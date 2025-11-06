// components/storage/attachment-list.tsx
// Display and manage file attachments for tasks

"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { File, ImageIcon, FileText, Download, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Attachment {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  created_at: string
}

interface AttachmentListProps {
  taskId: string
  className?: string
  showDelete?: boolean
  onDelete?: (attachmentId: string) => void
}

export function AttachmentList({ taskId, className, showDelete = true, onDelete }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch attachments
  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const fetchAttachments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAttachments(data || [])
    } catch (error) {
      console.error("Error fetching attachments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    try {
      setDeleting(attachment.id)

      // Delete from storage
      const { error: storageError } = await supabase.storage.from("task-attachments").remove([attachment.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase.from("task_attachments").delete().eq("id", attachment.id)

      if (dbError) throw dbError

      // Update local state
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))

      // Call parent callback
      onDelete?.(attachment.id)
    } catch (error) {
      console.error("Error deleting attachment:", error)
      alert("Failed to delete attachment")
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage.from("task-attachments").download(attachment.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading attachment:", error)
      alert("Failed to download attachment")
    }
  }

  const getPublicUrl = (filePath: string) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("task-attachments").getPublicUrl(filePath)
    return publicUrl
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (mimeType === "application/pdf") {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (attachments.length === 0) {
    return (
      <div className={cn("text-center p-8 text-muted-foreground", className)}>
        <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No attachments yet</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* File Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-muted rounded-lg">{getFileIcon(attachment.mime_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(attachment.file_size)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(attachment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getPublicUrl(attachment.file_path), "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDownload(attachment)}>
                <Download className="h-4 w-4" />
              </Button>
              {showDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={deleting === attachment.id}>
                      {deleting === attachment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{attachment.file_name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(attachment)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Usage example:
/*
'use client'

import { AttachmentList } from '@/components/storage/attachment-list'
import { FileUpload } from '@/components/storage/file-upload'

export function TaskAttachments({ taskId }: { taskId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Attachments</h3>
        <AttachmentList taskId={taskId} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload New File</h3>
        <FileUpload
          bucket="task-attachments"
          taskId={taskId}
          onUploadComplete={() => {
            // Refresh attachment list
            window.location.reload()
          }}
        />
      </div>
    </div>
  )
}
*/
