"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import type { Class } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editClass?: Class
  workstreamId?: string
}

export function ClassDialog({ open, onOpenChange, editClass, workstreamId }: ClassDialogProps) {
  const addClass = useAppStore((state) => state.addClass)
  const updateClass = useAppStore((state) => state.updateClass)

  const [formData, setFormData] = useState({
    name: "",
    course_code: "",
    description: "",
    instructor: "",
    image_url: "",
  })

  useEffect(() => {
    if (editClass) {
      setFormData({
        name: editClass.name || "",
        course_code: editClass.course_code || "",
        description: editClass.description || "",
        instructor: editClass.instructor || "",
        image_url: editClass.color || "", // Using color field for image URL
      })
    } else {
      setFormData({
        name: "",
        course_code: "",
        description: "",
        instructor: "",
        image_url: "",
      })
    }
  }, [editClass, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editClass) {
      updateClass(editClass.id, {
        name: formData.name,
        course_code: formData.course_code,
        description: formData.description,
        instructor: formData.instructor,
        color: formData.image_url, // Store image URL in color field
      })
    } else {
      addClass({
        user_id: "grace",
        workstream_id: workstreamId || "",
        name: formData.name,
        course_code: formData.course_code,
        description: formData.description,
        instructor: formData.instructor,
        color: formData.image_url, // Store image URL in color field
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{editClass ? "Edit Class" : "Add New Class"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {editClass ? "Update class information" : "Add a new class to your courses"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Class Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Psychology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_code" className="text-gray-300">
              Course Code
            </Label>
            <Input
              id="course_code"
              placeholder="e.g., PSYCH-101"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor" className="text-gray-300">
              Instructor
            </Label>
            <Input
              id="instructor"
              placeholder="e.g., Dr. Smith"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-gray-300">
              Image URL
            </Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://i.pinimg.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
            <p className="text-xs text-gray-500">Add a decorative image from Pinterest or any URL</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the class..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
              {editClass ? "Update" : "Add"} Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
