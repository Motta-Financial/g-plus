"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react"
import type { Class } from "@/lib/types"
import { CanvasImport } from "./canvas-import"

export function ClassManager() {
  const classes = useAppStore((state) => state.classes)
  const workstreams = useAppStore((state) => state.workstreams)
  const addClass = useAppStore((state) => state.addClass)
  const updateClass = useAppStore((state) => state.updateClass)
  const deleteClass = useAppStore((state) => state.deleteClass)
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    course_code: "",
    description: "",
    workstream_id: "",
    color: "#3b82f6",
  })

  // Filter to only school workstreams
  const schoolWorkstreams = useMemo(() => workstreams.filter((w) => w.type === "school"), [workstreams])

  const suffolkWorkstream = useMemo(() => workstreams.find((w) => w.name === "Suffolk University"), [workstreams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.workstream_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData)
        toast({
          title: "Class updated",
          description: `${formData.name} has been updated successfully`,
        })
      } else {
        await addClass(formData)
        toast({
          title: "Class added",
          description: `${formData.name} has been added successfully`,
        })
      }

      setIsAddDialogOpen(false)
      setEditingClass(null)
      setFormData({
        name: "",
        course_code: "",
        description: "",
        workstream_id: "",
        color: "#3b82f6",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save class",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      course_code: classItem.course_code || "",
      description: classItem.description || "",
      workstream_id: classItem.workstream_id,
      color: classItem.color || "#3b82f6",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (classId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this class? All associated tasks will remain but will be unassigned from this class.",
      )
    ) {
      return
    }

    try {
      await deleteClass(classId)
      toast({
        title: "Class deleted",
        description: "The class has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    setEditingClass(null)
    setFormData({
      name: "",
      course_code: "",
      description: "",
      workstream_id: "",
      color: "#3b82f6",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Classes</CardTitle>
            <CardDescription>Manage your classes for school workstreams</CardDescription>
          </div>
          <div className="flex gap-2">
            {suffolkWorkstream && <CanvasImport workstreamId={suffolkWorkstream.id} />}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                    <DialogDescription>
                      {editingClass ? "Update the class details" : "Add a new class to organize your assignments"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="workstream">Workstream *</Label>
                      <Select
                        value={formData.workstream_id}
                        onValueChange={(value) => setFormData({ ...formData, workstream_id: value })}
                      >
                        <SelectTrigger id="workstream">
                          <SelectValue placeholder="Select a workstream" />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolWorkstreams.map((workstream) => (
                            <SelectItem key={workstream.id} value={workstream.id}>
                              {workstream.icon} {workstream.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course_code">Course Code</Label>
                      <Input
                        id="course_code"
                        value={formData.course_code}
                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                        placeholder="e.g., CS101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Class Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Introduction to Computer Science"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the class"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingClass ? "Update Class" : "Add Class"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No classes yet. Add your first class to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {classes.map((classItem) => {
              const workstream = workstreams.find((w) => w.id === classItem.workstream_id)
              return (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: classItem.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {classItem.course_code && (
                          <span className="text-sm font-mono text-muted-foreground">{classItem.course_code}</span>
                        )}
                        <h4 className="font-medium truncate">{classItem.name}</h4>
                      </div>
                      {classItem.description && (
                        <p className="text-sm text-muted-foreground truncate">{classItem.description}</p>
                      )}
                      {workstream && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {workstream.icon} {workstream.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(classItem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(classItem.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
