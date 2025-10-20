"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { Download, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface CanvasCourse {
  id: string
  name: string
  course_code: string
  workflow_state: string
  start_at?: string
  end_at?: string
}

export function CanvasImport({ workstreamId }: { workstreamId: string }) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState("15414~nAUFMKG3ZnTttwYfvtJreVxZVFNekCNRQVKzevuQLJDxw4WHVzTRX2ENvYFxYw86")
  const [canvasUrl, setCanvasUrl] = useState("https://canvas.instructure.com")
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<CanvasCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)

  const addClass = useAppStore((state) => state.addClass)

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/canvas/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, canvasUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courses)
      // Select all active courses by default
      setSelectedCourses(new Set(data.courses.map((c: CanvasCourse) => c.id)))
      toast.success(`Found ${data.courses.length} courses`)
    } catch (error) {
      console.error("[v0] Error fetching Canvas courses:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch courses from Canvas")
    } finally {
      setLoading(false)
    }
  }

  const importCourses = async () => {
    setImporting(true)
    try {
      const coursesToImport = courses.filter((c) => selectedCourses.has(c.id))

      for (const course of coursesToImport) {
        await addClass({
          name: course.name,
          course_code: course.course_code,
          workstream_id: workstreamId,
          color: getRandomColor(),
          description: `Imported from Canvas`,
        })
      }

      toast.success(`Imported ${coursesToImport.length} classes`)
      setOpen(false)
      setCourses([])
      setSelectedCourses(new Set())
    } catch (error) {
      console.error("[v0] Error importing courses:", error)
      toast.error("Failed to import courses")
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
    const colors = ["blue", "green", "purple", "orange", "pink", "cyan"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Import from Canvas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Classes from Canvas</DialogTitle>
          <DialogDescription>Connect to Canvas LMS to import your current classes</DialogDescription>
        </DialogHeader>

        {courses.length === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-url">Canvas URL</Label>
              <Input
                id="canvas-url"
                placeholder="https://canvas.instructure.com"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your institution's Canvas URL (e.g., https://suffolk.instructure.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">Canvas API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Your Canvas API token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Generate an API key from Canvas Account → Settings → New Access Token
              </p>
            </div>

            <Button onClick={fetchCourses} disabled={loading || !apiKey || !canvasUrl} className="w-full">
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
                  <Checkbox checked={selectedCourses.has(course.id)} onCheckedChange={() => toggleCourse(course.id)} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{course.name}</p>
                      {course.workflow_state === "available" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
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
  )
}
