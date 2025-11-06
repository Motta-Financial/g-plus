// hooks/useFileUpload.ts
// Hook for uploading files to Supabase Storage

"use client"

import { useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UseFileUploadOptions {
  bucket: "task-attachments" | "profile-avatars" | "finance-documents"
  maxSizeMB?: number
  allowedTypes?: string[]
  onSuccess?: (filePath: string, publicUrl: string) => void
  onError?: (error: Error) => void
}

interface UploadProgress {
  progress: number
  uploading: boolean
  fileName?: string
}

export function useFileUpload({ bucket, maxSizeMB = 50, allowedTypes = [], onSuccess, onError }: UseFileUploadOptions) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false,
  })
  const supabase = createClientComponentClient()

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File size must be less than ${maxSizeMB}MB`,
        }
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        }
      }

      return { valid: true }
    },
    [maxSizeMB, allowedTypes],
  )

  const uploadFile = useCallback(
    async (file: File, folderPath?: string): Promise<string | null> => {
      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        setUploadProgress({
          progress: 0,
          uploading: true,
          fileName: file.name,
        })

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        // Create file path: userId/[folderPath]/timestamp-filename
        const timestamp = Date.now()
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
        const filePath = folderPath
          ? `${user.id}/${folderPath}/${timestamp}-${sanitizedFileName}`
          : `${user.id}/${timestamp}-${sanitizedFileName}`

        // Upload file
        const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) throw uploadError

        setUploadProgress({
          progress: 100,
          uploading: false,
          fileName: file.name,
        })

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path)

        onSuccess?.(data.path, publicUrl)

        return data.path
      } catch (error) {
        console.error("Upload error:", error)
        setUploadProgress({
          progress: 0,
          uploading: false,
        })
        onError?.(error as Error)
        return null
      }
    },
    [bucket, validateFile, supabase, onSuccess, onError],
  )

  const deleteFile = useCallback(
    async (filePath: string): Promise<boolean> => {
      try {
        const { error } = await supabase.storage.from(bucket).remove([filePath])

        if (error) throw error

        return true
      } catch (error) {
        console.error("Delete error:", error)
        onError?.(error as Error)
        return false
      }
    },
    [bucket, supabase, onError],
  )

  const getPublicUrl = useCallback(
    (filePath: string): string => {
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return publicUrl
    },
    [bucket, supabase],
  )

  const downloadFile = useCallback(
    async (filePath: string): Promise<Blob | null> => {
      try {
        const { data, error } = await supabase.storage.from(bucket).download(filePath)

        if (error) throw error

        return data
      } catch (error) {
        console.error("Download error:", error)
        onError?.(error as Error)
        return null
      }
    },
    [bucket, supabase, onError],
  )

  const reset = useCallback(() => {
    setUploadProgress({
      progress: 0,
      uploading: false,
    })
  }, [])

  return {
    uploadFile,
    deleteFile,
    getPublicUrl,
    downloadFile,
    uploadProgress,
    reset,
  }
}

// Usage example:
/*
'use client'

import { useFileUpload } from '@/hooks/useFileUpload'
import { Button } from '@/components/ui/button'

export function FileUploadButton({ taskId }: { taskId: string }) {
  const { uploadFile, uploadProgress } = useFileUpload({
    bucket: 'task-attachments',
    maxSizeMB: 50,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    onSuccess: async (filePath, publicUrl) => {
      // Save attachment metadata to database
      await supabase.from('task_attachments').insert({
        task_id: taskId,
        file_path: filePath,
        public_url: publicUrl,
      })
    },
    onError: (error) => {
      alert(`Upload failed: ${error.message}`)
    },
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file, taskId) // Use taskId as folder
    }
  }

  return (
    <div>
      <Button disabled={uploadProgress.uploading}>
        {uploadProgress.uploading
          ? `Uploading ${uploadProgress.progress}%`
          : 'Upload File'}
      </Button>
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
*/
