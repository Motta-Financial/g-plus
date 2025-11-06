// components/storage/file-upload.tsx
// Complete file upload component with drag-and-drop, preview, and progress

"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useFileUpload } from "@/hooks/useFileUpload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, ImageIcon, FileText, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  bucket: "task-attachments" | "profile-avatars" | "finance-documents"
  taskId?: string
  onUploadComplete?: (filePath: string, publicUrl: string) => void
  maxSizeMB?: number
  allowedTypes?: string[]
  accept?: string // HTML accept attribute
  multiple?: boolean
  className?: string
}

export function FileUpload({
  bucket,
  taskId,
  onUploadComplete,
  maxSizeMB = 50,
  allowedTypes,
  accept,
  multiple = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; path: string }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, uploadProgress } = useFileUpload({
    bucket,
    maxSizeMB,
    allowedTypes,
    onSuccess: (filePath, publicUrl) => {
      setUploadedFiles((prev) => [...prev, { name: uploadProgress.fileName || "file", url: publicUrl, path: filePath }])
      onUploadComplete?.(filePath, publicUrl)
    },
    onError: (error) => {
      alert(`Upload failed: ${error.message}`)
    },
  })

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0] // Handle first file (can be extended for multiple)
      await uploadFile(file, taskId)
    },
    [uploadFile, taskId],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (["pdf"].includes(ext || "")) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          uploadProgress.uploading ? "opacity-50 pointer-events-none" : "cursor-pointer",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{dragActive ? "Drop file here" : "Drag & drop file here"}</p>
            <p className="text-xs text-muted-foreground">or click to browse (max {maxSizeMB}MB)</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadProgress.uploading}
            onClick={(e) => {
              e.stopPropagation()
              handleButtonClick()
            }}
          >
            Choose File
          </Button>

          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </Card>

      {/* Upload Progress */}
      {uploadProgress.uploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Uploading {uploadProgress.fileName}</span>
              <span className="text-muted-foreground">{uploadProgress.progress}%</span>
            </div>
            <Progress value={uploadProgress.progress} />
          </div>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files</p>
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View file
                    </a>
                  </div>
                </div>
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Usage example:
/*
'use client'

import { FileUpload } from '@/components/storage/file-upload'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function TaskAttachmentUpload({ taskId }: { taskId: string }) {
  const supabase = createClientComponentClient()

  const handleUploadComplete = async (filePath: string, publicUrl: string) => {
    // Save to database
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('task_attachments').insert({
      user_id: user?.id,
      task_id: taskId,
      file_name: filePath.split('/').pop(),
      file_path: filePath,
      file_size: 0, // Calculate from File object
      mime_type: 'application/octet-stream', // Get from File object
    })

    if (error) {
      console.error('Failed to save attachment:', error)
    }
  }

  return (
    <FileUpload
      bucket="task-attachments"
      taskId={taskId}
      onUploadComplete={handleUploadComplete}
      accept="image/*,.pdf,.doc,.docx"
      maxSizeMB={50}
    />
  )
}
*/
