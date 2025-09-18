"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Cast, Clock, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClassItem {
  _id: string;
  title: string;
  description?: string;
  course?: { _id: string; title: string } | string;
  chapter?: { _id: string; chapter_name: string } | string;
  lesson?: { _id: string; title: string } | string;
  startDate?: string;
  endDate?: string;
  thumbnail_url?: string;
  meet_link?: string;
}

export default function LiveClasses() {
  const [items, setItems] = useState<LiveClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient("GET", "/live-classes");
        if (res?.ok) {
          const list = res?.data?.items || res?.items || res?.data || [];
          setItems(Array.isArray(list) ? list : []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Cast className="h-7 w-7" /> Live Classes</h1>
          <p className="text-muted-foreground">Schedule and manage your live classes</p>
        </div>
        <Link href="/admin/live-classes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Live Class
          </Button>
        </Link>
      </div>

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
        <div className="text-center py-12">
          <Cast className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No live classes yet</h3>
          <p className="text-muted-foreground">Create your first live class to get started</p>
          <Link href="/admin/live-classes/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Live Class
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((lc) => {
            const courseTitle = typeof lc.course === "string" ? lc.course : lc.course?.title;
            const chapterName = typeof lc.chapter === "string" ? lc.chapter : lc.chapter?.chapter_name;
            const lessonTitle = typeof lc.lesson === "string" ? lc.lesson : lc.lesson?.title;
            return (
              <Card key={lc._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {lc.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lc.thumbnail_url} alt={lc.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Cast className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{lc.title}</CardTitle>
                    {lc.meet_link && (
                      <a href={lc.meet_link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Join</a>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{lc.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{courseTitle}</span>
                    <Badge variant="outline">{chapterName}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate">{lessonTitle}</span>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}