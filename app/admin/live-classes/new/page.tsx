"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import { FetchCourses, fetchChaptersByCourseId } from "@/lib/function";
import { apiClient } from "@/lib/api";

interface CourseOpt {
  _id: string;
  title: string;
}

interface LessonOpt {
  _id: string;
  title: string;
}

interface ChapterOpt {
  _id: string;
  chapter_name: string;
  lessons?: LessonOpt[];
}

export default function NewLiveClassPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [chapters, setChapters] = useState<ChapterOpt[]>([]);
  const [lessons, setLessons] = useState<LessonOpt[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      const res = await FetchCourses();
      if (!res) return;
      const mapped = Object.values(res)
        .filter((c: any) => c && c._id)
        .map((c: any) => ({ _id: c._id as string, title: c.title as string }));
      setCourses(mapped);
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedCourseId) {
        setChapters([]);
        setLessons([]);
        setSelectedChapterId("");
        setSelectedLessonId("");
        return;
      }
      const res = await apiClient("GET",`/chapters/${selectedCourseId}/bycourseid`)
      setChapters(res.chapters || []);
      setSelectedChapterId("");
      setSelectedLessonId("");
      setLessons([]);
    };
    loadChapters();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setLessons([]);
      setSelectedLessonId("");
      return;
    }
    const chapter = chapters.find((c) => c._id === selectedChapterId);
    const ls = (chapter?.lessons || []).map((l: any) => ({ _id: l._id, title: l.title }));
    setLessons(ls);
    setSelectedLessonId("");
  }, [selectedChapterId, chapters]);

  const handleThumbFile = async (file: File) => {
    
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!selectedCourseId) return "Please select a course";
    if (!selectedChapterId) return "Please select a chapter";
    if (!selectedLessonId) return "Please select a lesson";
    if (!startDate) return "Start date/time is required";
    if (!endDate) return "End date/time is required";
    if (new Date(startDate) >= new Date(endDate)) return "End date must be after start date";
    if (!meetLink.trim()) return "Google Meet link is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    try {
      setIsSubmitting(true);
      const payload = {
        title,
        description,
        courseId: selectedCourseId,
        chapterId: selectedChapterId,
        lessonId: selectedLessonId,
        startDate,
        endDate,
        thumbnail_url: thumbnailUrl || undefined,
        meet_link: meetLink,
      };

      const res = await apiClient("POST", "/liveclasses", payload);
      if (res?.ok) {
        toast.success(res?.message || "Live class created");
        setTitle("");
        setDescription("");
        setMeetLink("");
        setStartDate("");
        setEndDate("");
        setThumbnailUrl("");
        setSelectedCourseId("");
        setSelectedChapterId("");
        setSelectedLessonId("");
        router.push("/admin/live-classes");
      } else {
        toast.error(res?.error || "Failed to create live class");
      }
    } catch (e: any) {
      toast.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/live-classes`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Create Live Class</h1>
          <p className="text-muted-foreground">Schedule a live class linked to a course chapter and lesson</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Title and description for the live class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Live class title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What this live class covers" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link to Course Content</CardTitle>
            <CardDescription>Select course, then chapter and lesson</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourseId} onValueChange={(v) => setSelectedCourseId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={selectedChapterId} onValueChange={(v) => setSelectedChapterId(v)} disabled={!selectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder={!selectedCourseId ? "Select course first" : "Select chapter"} />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch._id} value={ch._id}>{ch.chapter_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={selectedLessonId} onValueChange={(v) => setSelectedLessonId(v)} disabled={!selectedChapterId}>
                <SelectTrigger>
                  <SelectValue placeholder={!selectedChapterId ? "Select chapter first" : "Select lesson"} />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((l) => (
                    <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Set start and end date/time</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input id="start" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input id="end" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
            <CardDescription>Add your Google Meet link and optional thumbnail</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meet">Google Meet Link</Label>
              <Input id="meet" placeholder="https://meet.google.com/…" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbUrl">Thumbnail URL (optional)</Label>
              <Input id="thumbUrl" placeholder="https://…" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              {/* <Label htmlFor="thumbFile">Or Upload Thumbnail</Label> */}
              {/* <div className="flex items-center gap-3">
                <Input id="thumbFile" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleThumbFile(e.target.files[0])} />
                <Button type="button" variant="outline" disabled={isUploadingThumb}>
                  {isUploadingThumb ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploadingThumb ? "Uploading…" : "Upload"}
                </Button>
              </div> */}
              {thumbnailUrl && (
                <div className="text-sm text-muted-foreground break-all">Uploaded URL: {thumbnailUrl}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between border-t pt-6">
          <Link href="/admin/live-classes">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>) : "Create Live Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
