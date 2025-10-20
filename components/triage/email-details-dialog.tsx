"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import type { Email, TaskPriority } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MessageSquare, Send, Tag } from "lucide-react"
import { toast } from "sonner"

interface EmailDetailsDialogProps {
  email: Email
  onClose: () => void
}

export function EmailDetailsDialog({ email, onClose }: EmailDetailsDialogProps) {
  const workstreams = useAppStore((state) => state.workstreams)
  const projects = useAppStore((state) => state.projects)
  const classes = useAppStore((state) => state.classes)
  const updateEmail = useAppStore((state) => state.updateEmail)
  const addEmailComment = useAppStore((state) => state.addEmailComment)

  const [workstreamId, setWorkstreamId] = useState(email.workstream_id || "defaultWorkstream")
  const [projectId, setProjectId] = useState(email.project_id || "defaultProject")
  const [classId, setClassId] = useState(email.class_id || "defaultClass")
  const [priority, setPriority] = useState<TaskPriority | "">(email.priority || "defaultPriority")
  const [dueDate, setDueDate] = useState<Date | undefined>(email.due_date ? new Date(email.due_date) : undefined)
  const [comment, setComment] = useState("")

  const selectedWorkstream = workstreams.find((w) => w.id === workstreamId)
  const availableProjects = projects.filter((p) => p.workstream_id === workstreamId)
  const availableClasses = classes.filter((c) => c.workstream_id === workstreamId)

  const handleSave = () => {
    updateEmail(email.id, {
      workstream_id: workstreamId || undefined,
      project_id: projectId || undefined,
      class_id: classId || undefined,
      priority: priority || undefined,
      due_date: dueDate?.toISOString(),
    })
    toast.success("Email updated successfully")
  }

  const handleAddComment = () => {
    if (!comment.trim()) return
    addEmailComment(email.id, comment)
    setComment("")
    toast.success("Comment added")
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">{email.subject}</DialogTitle>
          <DialogDescription>
            From: {email.from_name || email.from_address} • {format(new Date(email.received_at), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Body */}
          <div className="space-y-2">
            <Label>Message</Label>
            <div
              className="p-4 rounded-lg border bg-muted/30 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body_html || email.body_text || email.snippet || "" }}
            />
          </div>

          {/* Tagging Section */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/10">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-cyan-400" />
              <h3 className="font-light">Organize & Tag</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workstream</Label>
                <Select value={workstreamId} onValueChange={setWorkstreamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workstream" />
                  </SelectTrigger>
                  <SelectContent>
                    {workstreams.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.icon} {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="big_rock">Big Rock</SelectItem>
                    <SelectItem value="medium_rock">Medium Rock</SelectItem>
                    <SelectItem value="small_rock">Small Rock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {workstreamId && availableProjects.length > 0 && (
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableProjects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {workstreamId && selectedWorkstream?.type === "school" && availableClasses.length > 0 && (
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.course_code} - {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Tags
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <h3 className="font-light">Internal Comments</h3>
            </div>

            {email.comments && email.comments.length > 0 && (
              <div className="space-y-2">
                {email.comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(comment.created_at), "PPp")}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Add an internal comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <Button onClick={handleAddComment} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
