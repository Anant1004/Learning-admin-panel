"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, Save, FileText, BookOpen, PenTool, Paperclip } from "lucide-react"

export default function NewLessonPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
  })

  const [materials, setMaterials] = useState<
    Array<{
      type: "notes" | "dpp" | "pdf" | "assignment"
      title: string
      file?: File
    }>
  >([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating lesson:", formData, materials)
    router.push(`/admin/courses/${params.id}/chapters`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addMaterial = (type: "notes" | "dpp" | "pdf" | "assignment") => {
    setMaterials((prev) => [...prev, { type, title: "" }])
  }

  const updateMaterial = (index: number, field: string, value: string) => {
    setMaterials((prev) => prev.map((material, i) => (i === index ? { ...material, [field]: value } : material)))
  }

  const removeMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "notes":
        return <BookOpen className="h-4 w-4" />
      case "dpp":
        return <PenTool className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "assignment":
        return <Paperclip className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${params.id}/chapters`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Add New Lesson</h1>
          <p className="text-muted-foreground">Create a new lesson with video content and materials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="video">Video Content</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
                <CardDescription>Basic details about this lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter lesson title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this lesson"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="15"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Content</CardTitle>
                <CardDescription>Upload or link to the lesson video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                  />
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Or upload a video file</p>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <Button variant="outline" type="button">
                        Choose Video File
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">MP4, WebM up to 500MB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Materials</CardTitle>
                <CardDescription>Add notes, PDFs, assignments, and other resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addMaterial("notes")}
                    className="justify-start"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Add Notes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => addMaterial("dpp")} className="justify-start">
                    <PenTool className="mr-2 h-4 w-4" />
                    Add DPP
                  </Button>
                  <Button type="button" variant="outline" onClick={() => addMaterial("pdf")} className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Add PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addMaterial("assignment")}
                    className="justify-start"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Add Assignment
                  </Button>
                </div>

                {materials.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Added Materials</h4>
                    {materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getMaterialIcon(material.type)}
                        <div className="flex-1">
                          <Input
                            placeholder={`${material.type.charAt(0).toUpperCase() + material.type.slice(1)} title`}
                            value={material.title}
                            onChange={(e) => updateMaterial(index, "title", e.target.value)}
                          />
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(index)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {materials.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    <p>No materials added yet</p>
                    <p className="text-sm">Use the buttons above to add lesson materials</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link href={`/admin/courses/${params.id}/chapters`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </div>
      </form>
    </div>
  )
}
