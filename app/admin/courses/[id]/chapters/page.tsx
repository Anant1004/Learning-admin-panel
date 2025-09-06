"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
  BookOpen,
  PlayCircle,
  FileText,
  Clock,
} from "lucide-react"
import type { Chapter, Lesson } from "@/types"

// Mock data
const mockCourse = {
  id: "1",
  title: "Advanced React Patterns",
  description: "Master advanced React concepts including hooks, context, and performance optimization",
}

const mockChapters: (Chapter & { lessons: Lesson[] })[] = [
  {
    id: "ch1",
    courseId: "1",
    title: "Introduction to React Hooks",
    description: "Learn the fundamentals of React hooks and how they work",
    order: 1,
    lessons: [
      {
        id: "l1",
        chapterId: "ch1",
        title: "useState Hook Basics",
        description: "Understanding state management with useState",
        order: 1,
        videoUrl: "https://example.com/video1",
        duration: 15,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "l2",
        chapterId: "ch1",
        title: "useEffect Hook Deep Dive",
        description: "Side effects and lifecycle management",
        order: 2,
        videoUrl: "https://example.com/video2",
        duration: 20,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "ch2",
    courseId: "1",
    title: "Advanced Patterns",
    description: "Explore advanced React patterns and best practices",
    order: 2,
    lessons: [
      {
        id: "l3",
        chapterId: "ch2",
        title: "Render Props Pattern",
        description: "Implementing the render props pattern",
        order: 1,
        videoUrl: "https://example.com/video3",
        duration: 25,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function CourseChaptersPage({ params }: { params: { id: string } }) {
  const [chapters, setChapters] = useState(mockChapters)
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [newChapter, setNewChapter] = useState({ title: "", description: "" })
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  const handleAddChapter = () => {
    if (newChapter.title.trim()) {
      const chapter: Chapter & { lessons: Lesson[] } = {
        id: `ch${Date.now()}`,
        courseId: params.id,
        title: newChapter.title,
        description: newChapter.description,
        order: chapters.length + 1,
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setChapters([...chapters, chapter])
      setNewChapter({ title: "", description: "" })
      setIsAddingChapter(false)
    }
  }

  const getTotalDuration = (lessons: Lesson[]) => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-balance">{mockCourse.title}</h1>
          <p className="text-muted-foreground">Manage course content and structure</p>
        </div>
        <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
              <DialogDescription>Create a new chapter for this course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  placeholder="Enter chapter title"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter-description">Description</Label>
                <Textarea
                  id="chapter-description"
                  placeholder="Describe what this chapter covers"
                  value={newChapter.description}
                  onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingChapter(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChapter}>Add Chapter</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Chapters</span>
            </div>
            <div className="text-2xl font-bold">{chapters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Lessons</span>
            </div>
            <div className="text-2xl font-bold">
              {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Duration</span>
            </div>
            <div className="text-2xl font-bold">
              {chapters.reduce((total, chapter) => total + getTotalDuration(chapter.lessons), 0)}m
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Materials</span>
            </div>
            <div className="text-2xl font-bold">
              {chapters.reduce(
                (total, chapter) =>
                  total + chapter.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.materials.length, 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <Card key={chapter.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <Badge variant="outline">Chapter {index + 1}</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    <CardDescription>{chapter.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  >
                    {expandedChapter === chapter.id ? "Collapse" : "Expand"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Chapter
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${params.id}/chapters/${chapter.id}/lessons`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chapter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {expandedChapter === chapter.id && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Lessons ({chapter.lessons.length})</h4>
                    <Link href={`/admin/courses/${params.id}/chapters/${chapter.id}/lessons/new`}>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </Link>
                  </div>

                  {chapter.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {lessonIndex + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{lesson.duration}m</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/courses/${params.id}/chapters/${chapter.id}/lessons/${lesson.id}`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Lesson
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Lesson
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PlayCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>No lessons in this chapter yet</p>
                      <Link href={`/admin/courses/${params.id}/chapters/${chapter.id}/lessons/new`}>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Add First Lesson
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {chapters.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No chapters yet</h3>
          <p className="text-muted-foreground">Start building your course by adding the first chapter</p>
          <Button className="mt-4" onClick={() => setIsAddingChapter(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Chapter
          </Button>
        </div>
      )}
    </div>
  )
}
