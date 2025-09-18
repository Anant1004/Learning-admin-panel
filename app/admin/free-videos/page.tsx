"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlayCircle, Plus, Search, Filter, Eye, Trash2, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { apiClient } from "@/lib/api"
import toast from "react-hot-toast"

interface FreeVideo {
  _id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function FreeVideosPage() {
  const [allvideos, setAllVideos] = useState<FreeVideo[]>([])
  const [totalvideo, setTotalVideo] = useState(0)
  const [draftvideos, setDraftVideo] = useState(0)
  const [publishedvideos, setPublishedVideos] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")        // 🔎 NEW

  // dialog state
  const [open, setOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<FreeVideo | null>(null)

  const [isPending, startTransition] = useTransition()

  const fetchAllFreeVideos = async () => {
    try {
      const res = await apiClient("GET", "/freevideos")
      if (res.ok) {
        setAllVideos(res.freevideos)
        setPublishedVideos(res.publishedvideos)
        setDraftVideo(res.draftvideos)
        setTotalVideo(res.totalvideo)
      }
    } catch {
      toast.error("Failed to load videos")
    }
  }

  useEffect(() => {
    fetchAllFreeVideos()
  }, [])

  const handleDeleteFreeVideos = (id: string) => {
    startTransition(async () => {
      try {
        const res = await apiClient("DELETE", `/freevideos/${id}`)
        if (res.ok) {
          toast.success(res.message || "Video deleted")
          setAllVideos((prev) => prev.filter((v) => v._id !== id))
          fetchAllFreeVideos()
        } else {
          toast.error(res.message || "Delete failed")
        }
      } catch (err: any) {
        toast.error(err.message || "Delete failed")
      }
    })
  }

  const getEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  // 🔎 Filter videos based on searchTerm
  const filteredVideos = allvideos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Free Videos</h1>
          <p className="text-muted-foreground">Manage your free educational video content</p>
        </div>
        <Link href="/admin/free-videos/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Videos", value: totalvideo, icon: PlayCircle },
          { label: "Published", value: publishedvideos, icon: Eye },
          { label: "Drafted", value: draftvideos, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search / Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  // 🔎 NEW
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Video Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (         // 🔎 Use filteredVideos
          <Card key={video._id} className="overflow-hidden">
            <div
              className="relative cursor-pointer"
              onClick={() => {
                setSelectedVideo(video)
                setOpen(true)
              }}
            >
              <img
                src={video.thumbnail_url || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayCircle className="h-12 w-12 text-white" />
              </div>
              <Badge
                className="absolute top-2 right-2"
                variant={video.status === "published" ? "default" : "secondary"}
              >
                {video.status}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="line-clamp-2">{video.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedVideo(video)
                    setOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDeleteFreeVideos(video._id)}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          {selectedVideo && (
            <>
              <DialogHeader className="p-4">
                <DialogTitle>{selectedVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video w-full">
                <iframe
                  src={getEmbedUrl(selectedVideo.video_url)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
