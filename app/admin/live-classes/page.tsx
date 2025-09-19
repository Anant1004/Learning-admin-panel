"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Cast, Clock, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassItem {
  _id: string;
  title: string;
  description?: string;
  courseId?: { _id: string; title?: string } | string;
  chapterId?: { _id: string; chapter_name?: string } | string;
  lessonId?: { _id: string; title?: string } | string;
  startDate?: string;
  endDate?: string;
  thumbnail_url?: string;
  meet_link?: string;
}

// YouTube thumbnail extract function
const getThumbnail = (url?: string) => {
  if (!url) return null;
  const match = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
  return url; // direct image URL
};

export default function LiveClasses() {
  const [items, setItems] = useState<LiveClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load live classes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient("GET", "/liveclasses");
        if (res?.ok) {
          const list: LiveClassItem[] = res.liveclass || [];
          setItems(list);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Delete function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this live class?")) return;

    try {
      const res = await apiClient("DELETE", `/liveclasses/${id}`);
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        alert("Live class deleted successfully!");
      } else {
        alert("Failed to delete live class.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cast className="h-7 w-7" /> Live Classes
          </h1>
          <p className="text-muted-foreground">Schedule and manage your live classes</p>
        </div>
        <Link href="/admin/live-classes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Live Class
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <Cast className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No live classes yet</h3>
          <p className="text-muted-foreground">Create your first live class to get started</p>
          <Link href="/admin/live-classes/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create Live Class
            </Button>
          </Link>
        </div>
      ) : (
        // Live classes grid
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((lc) => {
            const courseText =
              typeof lc.courseId === "string"
                ? lc.courseId
                : lc.courseId?.title || "Course";

            const chapterText =
              typeof lc.chapterId === "string"
                ? lc.chapterId
                : lc.chapterId?.chapter_name || "Chapter";

            const lessonText =
              typeof lc.lessonId === "string"
                ? lc.lessonId
                : lc.lessonId?.title || "Lesson";

            return (
              <Card key={lc._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {lc.thumbnail_url ? (
                    <img
                      src={getThumbnail(lc.thumbnail_url) || ""}
                      alt={lc.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Cast className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{lc.title}</CardTitle>
                    {lc.meet_link && (
                      <a
                        href={lc.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        Join
                      </a>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{lc.description}</CardDescription>
                </CardHeader>

                {/* Content */}
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{courseText}</span>
                    <Badge variant="outline">{chapterText}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate">{lessonText}</span>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{lc.startDate ? new Date(lc.startDate).toLocaleString() : ""}</span>
                    </div>
                  </div>
                  {lc.endDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Ends: {new Date(lc.endDate).toLocaleString()}</span>
                    </div>
                  )}
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 opacity-38 hover:opacity-100 hover:cursor-pointer"
                    onClick={() => handleDelete(lc._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4 " /> Delete
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
