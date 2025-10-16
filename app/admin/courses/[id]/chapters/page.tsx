"use client"

import { useEffect, useState } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  Loader2,
  PlusCircle,
  Video,
} from "lucide-react"
import { handleAddChaptera } from "@/lib/function"
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"


interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  order: number;
  videoUrl: string;
  duration: number;
  materials: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Chapter {
  _id: string;
  chapter_name: string;
  chapter_description: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}



export default function CourseChaptersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isAddingChapter, setIsAddingChapter] = useState<boolean>(false);
  const [newChapter, setNewChapter] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const [coursedetails, setCourseDetails] = useState({ title: '', subtitle: "", description: "", totalLessons: "", totalMaterials: "" })
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [ispendingaddchapter, setIsPendingAddChapter] = useState<boolean>(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [ispendingaupdatechapter, setIsPendingaUpdateChapter] = useState(false)
  const [isdialogopenforupdatechapter, setIsDialogOpenForUpdateChapter] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

  // const [notFound, setNotFound] = useState(false)

  const handleAddChapter = async (): Promise<void> => {
    if (!newChapter.title.trim()) return;
    setIsPendingAddChapter(true);

    try {
      const chapter: Chapter = {
        _id: `ch${Date.now()}`,
        chapter_name: newChapter.title,
        chapter_description: newChapter.description,
        courseId: params.id,
        order: chapters.length + 1,
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const res = await handleAddChaptera(params.id, newChapter.title, newChapter.description);

      if (res?.success || res?.ok) {
        setChapters((prev) => [...prev, chapter]);
        setNewChapter({ title: "", description: "" });
        setIsAddingChapter(false);
      } else {
        toast.error(res?.message || "Failed to create chapter");
      }
    } catch (err) {
      console.error("Error adding chapter:", err);
      toast.error("Something went wrong while adding the chapter");
    } finally {
      setIsPendingAddChapter(false);
    }
  };
  const [isdeletepending, setIsDeletePending] = useState(false)
  const [confirmChapterOpen, setConfirmChapterOpen] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<any>(null)
  const [isDeletingChapter, setIsDeletingChapter] = useState(false)
  const [confirmLessonOpen, setConfirmLessonOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<any>(null)
  const [isDeletingLesson, setIsDeletingLesson] = useState(false)


  const handleDialogOpenForUpdateChapter = (chapter: any) => {
    setIsDialogOpenForUpdateChapter(true);
    setIsAddingChapter(true);
    setEditingChapterId(chapter._id);
    setNewChapter({ title: chapter.chapter_name, description: chapter.chapter_description });
  };


  const handleOpenDialogForNewChapter = () => {
    setIsAddingChapter(true)
    setNewChapter({ title: "", description: "" })
    setIsDialogOpenForUpdateChapter(false)
  }

  const fetchGetChapterByCourseId = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await apiClient("GET", `/chapters/${params.id}/bycourseid`)
      if (res.ok && res.chapters?.length) {
        setCourseDetails({
          title: res.title,
          subtitle: res.subtitle,
          description: res.description,
          totalLessons: res.totalLessons,
          totalMaterials: res.totalMaterials,
        })
        setChapters(res.chapters as Chapter[])
      } else {
        // setNotFound(true)
      }
    } catch (e) {
      console.error("Error fetching chapters:", e)
      toast.error("Something went wrong")
      // setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGetChapterByCourseId()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }



  const getTotalDuration = (lessons: Lesson[]) => {
    return lessons?.reduce((total, lesson) => total + lesson?.duration, 0) || 0
  }

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      let videoId = "";

      // Check for watch?v= param
      if (parsedUrl.searchParams.has("v")) {
        videoId = parsedUrl.searchParams.get("v") || "";
      }

      // Short URL like youtu.be/VIDEOID
      if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.substring(1);
      }

      // Agar videoId mila to embed URL return karo
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return url; // agar YouTube nahi hai to original return karo
    } catch {
      return url;
    }
  };

  // Iframe open function (Final)
  const openInIframe = (url: string) => {
    const finalUrl = getYouTubeEmbedUrl(url);
    setIframeUrl(finalUrl);
    setOpenModal(true);
  };
  const handleDeleteChapter = async (id: string) => {
    try {
      setIsDeletePending(true)
      const resdel = await apiClient("DELETE", `/chapters/${id}`)
      if (resdel.ok) {
        toast.success(resdel.message)
        setIsDeletePending(false)
        fetchGetChapterByCourseId()
      }
    } catch (error: any) {
      toast.error("Please Refresh The Page & try to delete!")

    } finally {
      setIsDeletePending(false)
    }
  }

  const openConfirmChapter = (chapter: any) => {
    setChapterToDelete(chapter)
    setConfirmChapterOpen(true)
  }

  const confirmDeleteChapter = async () => {
    if (!chapterToDelete?._id) return
    setIsDeletingChapter(true)
    await handleDeleteChapter(chapterToDelete._id)
    setIsDeletingChapter(false)
    setConfirmChapterOpen(false)
    setChapterToDelete(null)
  }


  const handleUpdateChapter = async (): Promise<void> => {
    if (!newChapter.title.trim()) return;
    if (!editingChapterId) return;
    setIsPendingaUpdateChapter(true);
    try {
      const res = await apiClient(
        "PUT",
        `/chapters/${editingChapterId}`,
        {
          chapter_name: newChapter.title,
          chapter_description: newChapter.description,
        }
      );

      if (res.ok) {
        toast.success(res.message || "Chapter updated successfully");
        await fetchGetChapterByCourseId();
        setIsAddingChapter(false);
        setIsDialogOpenForUpdateChapter(false);
        setNewChapter({ title: "", description: "" });
        setEditingChapterId(null);
      } else {
        toast.error(res.message || "Failed to update chapter");
      }
    } catch (err) {
      console.error("Error updating chapter:", err);
      toast.error("Something went wrong");
    } finally {
      setIsPendingaUpdateChapter(false);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      const res = await apiClient("DELETE", `/lesson/${lessonId}`);

      if (res.ok) {
        toast.success(res.message || "Lesson deleted successfully");

        setChapters((prev) =>
          prev.map((ch: any) =>
            ch._id === chapterId
              ? { ...ch, lessons: ch.lessons.filter((l: any) => l.id === lessonId || l._id === lessonId ? false : true) }
              : ch
          )
        );
      } else {
        toast.error(res.message || "Failed to delete lesson");
      }
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      toast.error("Something went wrong while deleting lesson");
    }
  };

  const openConfirmLesson = (chapterId: string, lesson: any) => {
    setLessonToDelete({ chapterId, lessonId: lesson._id, title: lesson.title })
    setConfirmLessonOpen(true)
  }

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return
    setIsDeletingLesson(true)
    await handleDeleteLesson(lessonToDelete.chapterId, lessonToDelete.lessonId)
    setIsDeletingLesson(false)
    setConfirmLessonOpen(false)
    setLessonToDelete(null)
  }

  const handleEditLesson = (lesson: any) => {
    console.log(lesson)
    router.push(`/admin/courses/${params.id}/chapters/${lesson.chapter_id}/lessons/${lesson._id}`);
    setEditingLesson({
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.video_url || "",
      duration: lesson.duration,
    });
    setIsEditingLesson(true);
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson?.title?.trim()) return;
    setIsUpdatingLesson(true);
    try {
      const res = await apiClient("PUT", `/lesson/${editingLesson.id}`, {
        title: editingLesson.title,
        description: editingLesson.description,
        video_url: editingLesson.videoUrl,
        duration: editingLesson.duration,
      });
      if (res.ok) {
        toast.success("Lesson updated successfully!");
        setIsEditingLesson(false);
        setEditingLesson(null);
        await fetchGetChapterByCourseId();
      } else {
        toast.error(res.message || "Failed to update lesson");
      }
    } catch (err) {
      toast.error("Error updating lesson");
    } finally {
      setIsUpdatingLesson(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-balance">{coursedetails.title}</h1>
          <p className="text-muted-foreground">{coursedetails.description}</p>
        </div>
        <Dialog
          open={isAddingChapter}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingChapter(false);
              setIsDialogOpenForUpdateChapter(false);
              setNewChapter({ title: "", description: "" });
            } else {
              setIsAddingChapter(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isdialogopenforupdatechapter ? "Update chapter" : "Add New Chapter"}
              </DialogTitle>
              <DialogDescription>
                {isdialogopenforupdatechapter
                  ? "Update a chapter for this course"
                  : "Create a new chapter for this course"}
              </DialogDescription>
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
                {isdialogopenforupdatechapter && (
                  <Button onClick={() => handleUpdateChapter()}>
                    {ispendingaupdatechapter ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-2" />
                    )}
                    {ispendingaupdatechapter ? "Updating..." : "Update Chapter"}
                  </Button>)
                }
                {!isdialogopenforupdatechapter && (
                  <Button onClick={handleAddChapter}>
                    {ispendingaddchapter ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-2" />
                    )}
                    {ispendingaddchapter ? "Adding..." : "Add Chapter"}
                  </Button>
                )}

              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
              {/* {chapters?.reduce((total, chapter) => total + chapter?.lessons?.length, 0)} */}
              {coursedetails?.totalLessons}
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
              {chapters.reduce((total: any, chapter: any) => total + getTotalDuration(chapter.lessons), 0)}m
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
              {/* {coursedetails?.totalMaterials} */}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter: any, index: number) => (
          <Card key={chapter._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">Chapter {index + 1}</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{chapter.chapter_name}</CardTitle>
                    <CardDescription>{chapter.chapter_description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                  >
                    {expandedChapter === chapter._id ? "Collapse" : "Expand"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDialogOpenForUpdateChapter(chapter)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Chapter
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${params.id}/chapters/${chapter._id}/lessons/new`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => openConfirmChapter(chapter)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chapter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {expandedChapter === chapter._id && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Lessons ({chapter?.lessons?.length})</h4>
                    <Link href={`/admin/courses/${params.id}/chapters/${chapter._id}/lessons/new`}>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </Link>
                  </div>

                  {chapter?.lessons?.length > 0 ? (
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson: any, lessonIndex: number) => (
                        <div key={lesson._id} className="relative flex items-start justify-between border rounded-lg p-4 pt-6 pr-20 mt-5">
                          <div className="absolute -top-2 -left-2">
                            <Badge variant="secondary" className="text-[15px] px-2 py-0.5"># {lessonIndex + 1}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="pr-24">
                              <p className="font-medium line-clamp-1">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{lesson.description}</p>

                              {lesson.videos?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                  {lesson.videos.map((video: any, i: number) => (
                                    <div
                                      key={i}
                                      className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group"
                                      onClick={() => openInIframe(video.video_url)}
                                    >
                                      <img
                                        src={video.video_thumbnail}
                                        alt={`Video ${i + 1} Thumbnail`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle className="text-white w-12 h-12" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {lesson.materials?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {lesson.materials.map((mat: any, i: number) => (
                                    <Button
                                      key={i}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openInIframe(mat.material_url)}
                                    >
                                      <FileText className="h-4 w-4 mr-1" /> {mat.material_title || "Open File"}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{lesson.duration}m</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditLesson(lesson)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Lesson
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => openConfirmLesson(chapter._id, lesson)}>
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
                      <Link href={`/admin/courses/${params.id}/chapters/${chapter._id}/lessons/new`}>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Add First Lesson
                        </Button>
                      </Link>
                    </div>
                  )}

                  <Dialog open={openModal} onOpenChange={setOpenModal}>
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Preview</DialogTitle>
                      </DialogHeader>
                      <iframe
                        src={iframeUrl}
                        className="w-full h-[180%] rounded-md mt-[-250px]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      ></iframe>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog open={confirmLessonOpen} onOpenChange={setConfirmLessonOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {`This will permanently delete "${lessonToDelete?.title || "this lesson"}". This action cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingLesson}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteLesson} disabled={isDeletingLesson}>
                          {isDeletingLesson ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

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

      <AlertDialog open={confirmChapterOpen} onOpenChange={setConfirmChapterOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete "${chapterToDelete?.chapter_name || "this chapter"}" and its lessons. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingChapter}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChapter} disabled={isDeletingChapter}>
              {isDeletingChapter ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* <Dialog open={isEditingLesson} onOpenChange={setIsEditingLesson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update the lesson details and video notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={editingLesson?.title || ""}
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingLesson?.description || ""}
                onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={editingLesson?.duration || ""}
                onChange={(e) => setEditingLesson({ ...editingLesson, duration: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditingLesson(false)}>Cancel</Button>
            <Button onClick={handleUpdateLesson} disabled={isUpdatingLesson}>
              {isUpdatingLesson ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" /> Update Lesson
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}