"use client"

import type React from "react"
import { useState } from "react"
import type { Workstream } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WorkstreamManagerProps {
  userId?: string
}

export function WorkstreamManager({ userId }: WorkstreamManagerProps) {
  const workstreams = useAppStore((state) => state.workstreams)
  const addWorkstream = useAppStore((state) => state.addWorkstream)
  const updateWorkstream = useAppStore((state) => state.updateWorkstream)
  const deleteWorkstream = useAppStore((state) => state.deleteWorkstream)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWorkstream, setEditingWorkstream] = useState<Workstream | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<"school" | "work" | "life" | "side_quest">("life")
  const [color, setColor] = useState("#6366f1")
  const [icon, setIcon] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingWorkstream) {
        updateWorkstream(editingWorkstream.id, { name, type, color, icon, description })
        toast({ title: "Workstream updated", description: "Your workstream has been updated successfully" })
      } else {
        addWorkstream({
          user_id: "grace",
          name,
          type,
          color,
          icon,
          description,
        })
        toast({ title: "Workstream created", description: "Your new workstream has been created successfully" })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save workstream", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (workstream: Workstream) => {
    setEditingWorkstream(workstream)
    setName(workstream.name)
    setType(workstream.type)
    setColor(workstream.color)
    setIcon(workstream.icon || "")
    setDescription(workstream.description || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workstream? All associated tasks will also be deleted.")) return

    try {
      deleteWorkstream(id)
      toast({ title: "Workstream deleted", description: "The workstream has been removed" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete workstream", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingWorkstream(null)
    setName("")
    setType("life")
    setColor("#6366f1")
    setIcon("")
    setDescription("")
  }

  const typeLabels = {
    school: "School",
    work: "Work",
    life: "Life",
    side_quest: "Side Quest",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Workstreams</CardTitle>
            <CardDescription>Create and customize your workstreams to organize your tasks</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                New Workstream
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWorkstream ? "Edit Workstream" : "Create New Workstream"}</DialogTitle>
                <DialogDescription>
                  {editingWorkstream ? "Update your workstream details" : "Add a new workstream to organize your tasks"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Suffolk University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="life">Life</SelectItem>
                      <SelectItem value="side_quest">Side Quest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (emoji)</Label>
                    <Input
                      id="icon"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="e.g., 🎓"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this workstream"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingWorkstream ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workstreams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No workstreams yet. Create your first one!</p>
          ) : (
            workstreams.map((workstream) => (
              <div
                key={workstream.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${workstream.color}20` }}
                  >
                    {workstream.icon || "📁"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{workstream.name}</h4>
                      <Badge variant="secondary">{typeLabels[workstream.type]}</Badge>
                    </div>
                    {workstream.description && (
                      <p className="text-sm text-muted-foreground">{workstream.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(workstream)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(workstream.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
