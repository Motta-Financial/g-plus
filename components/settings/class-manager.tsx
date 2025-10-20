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
import { Plus, Pencil, Trash2, GraduationCap, Download, Loader2 } from "lucide-react"
import type { Class } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface CanvasCourse {
  id: string
  name: string
  course_code: string
  workflow_state: string
}

export function ClassManager() {
  const classes = useAppStore((state) => state.classes)
  const workstreams = useAppStore((state) => state.workstreams)
  const settings = useAppStore((state) => state.settings)
  const addClass = useAppStore((state) => state.addClass)
  const updateClass = useAppStore((state) => state.updateClass)
  const deleteClass = useAppStore((state) => state.deleteClass)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const { toast } = useToast()

  const [canvasApiToken, setCanvasApiToken] = useState(settings?.canvasApiToken || "")
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(settings?.canvasBaseUrl || "https://canvas.instructure.com")
  const [savingIntegration, setSavingIntegration] = useState(false)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    course_code: "",
    description: "",
    workstream_id: "",
    color: "#3b82f6",
  })

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<CanvasCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)

  const schoolWorkstreams = useMemo(() => workstreams.filter((w) => w.type === "school"), [workstreams])
  const suffolkWorkstream = useMemo(() => workstreams.find((w) => w.name === "Suffolk University"), [workstreams])

  const handleSaveIntegration = async () => {
    setSavingIntegration(true)
    try {
      updateSettings({
        canvasApiToken,
        canvasBaseUrl,
      })

      toast({
        title: "Integration saved",
        description: "Your Canvas settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Canvas settings",
        variant: "destructive",
      })
    } finally {
      setSavingIntegration(false)
    }
  }

  const fetchCourses = async () => {
    if (!canvasApiToken || !canvasBaseUrl) {
      toast({
        title: "Missing credentials",
        description: "Please save your Canvas URL and API Key first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/canvas/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: canvasApiToken, canvasUrl: canvasBaseUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courses)
      setSelectedCourses(new Set(data.courses.map((c: CanvasCourse) => c.id)))
      toast({
        title: "Courses fetched",
        description: `Found ${data.courses.length} courses`,
      })
    } catch (error) {
      console.error("[v0] Error fetching Canvas courses:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch courses from Canvas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const importCourses = async () => {
    if (!suffolkWorkstream) {
      toast({
        title: "Error",
        description: "Suffolk University workstream not found",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    try {
      const coursesToImport = courses.filter((c) => selectedCourses.has(c.id))

      for (const course of coursesToImport) {
        await addClass({
          name: course.name,
          course_code: course.course_code,
          workstream_id: suffolkWorkstream.id,
          color: getRandomColor(),
          description: `Imported from Canvas`,
        })
      }

      toast({
        title: "Import successful",
        description: `Imported ${coursesToImport.length} classes`,
      })
      setIsImportDialogOpen(false)
      setCourses([])
      setSelectedCourses(new Set())
    } catch (error) {
      console.error("[v0] Error importing courses:", error)
      toast({
        title: "Error",
        description: "Failed to import courses",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId)
    } else {
      newSelected.add(courseId)
    }
    setSelectedCourses(newSelected)
  }

  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>School Integrations</CardTitle>
          <CardDescription>Connect your Canvas LMS account to import classes and assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="canvas_base_url">Canvas URL</Label>
            <Input
              id="canvas_base_url"
              value={canvasBaseUrl}
              onChange={(e) => setCanvasBaseUrl(e.target.value)}
              placeholder="https://canvas.instructure.com"
            />
            <p className="text-xs text-muted-foreground">
              Enter your institution's Canvas URL (e.g., https://suffolk.instructure.com)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="canvas_api_token">Canvas API Key</Label>
            <Input
              id="canvas_api_token"
              type="password"
              value={canvasApiToken}
              onChange={(e) => setCanvasApiToken(e.target.value)}
              placeholder="Enter your Canvas API token"
            />
            <p className="text-xs text-muted-foreground">
              Generate an API key from Canvas: Account → Settings → New Access Token
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveIntegration} disabled={savingIntegration}>
              {savingIntegration ? "Saving..." : "Save Integration"}
            </Button>
            {canvasApiToken && canvasBaseUrl && (
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Import from Canvas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Import Classes from Canvas</DialogTitle>
                    <DialogDescription>Select courses to import as classes</DialogDescription>
                  </DialogHeader>

                  {courses.length === 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Using saved Canvas credentials: {canvasBaseUrl}</p>
                      <Button onClick={fetchCourses} disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fetching Courses...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Fetch Courses
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Select courses to import ({selectedCourses.size} selected)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedCourses.size === courses.length) {
                              setSelectedCourses(new Set())
                            } else {
                              setSelectedCourses(new Set(courses.map((c) => c.id)))
                            }
                          }}
                        >
                          {selectedCourses.size === courses.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleCourse(course.id)}
                          >
                            <Checkbox
                              checked={selectedCourses.has(course.id)}
                              onCheckedChange={() => toggleCourse(course.id)}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="font-medium text-sm">{course.name}</p>
                              <p className="text-xs text-muted-foreground">{course.course_code}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCourses([])
                            setSelectedCourses(new Set())
                          }}
                        >
                          Back
                        </Button>
                        <Button onClick={importCourses} disabled={importing || selectedCourses.size === 0}>
                          {importing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            `Import ${selectedCourses.size} Classes`
                          )}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Classes</CardTitle>
              <CardDescription>Manage your classes for school workstreams</CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No classes yet. Add your first class or import from Canvas.</p>
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
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: classItem.color }}
                      />
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
    </div>
  )
}
