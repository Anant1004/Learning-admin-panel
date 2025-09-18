"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function EditLessonPage({
  params,
}: {
  params: { id: string; chapterId: string; lessonId: string };
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    video_url: "",
    video_thumnail: "",
  });

  const [materials, setMaterials] = useState<
    { material_type: string; material_title: string; material_url: string }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch lesson details on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient(
          "GET",
          `/lessons/${params.lessonId}`
        );
        if (res.ok) {
          const lesson = res.lesson;
          setFormData({
            title: lesson.title || "",
            description: lesson.description || "",
            duration: String(lesson.duration || ""),
            video_url: lesson.video_url || "",
            video_thumnail: lesson.video_thumnail || "",
          });
          setMaterials(lesson.materials || []);
        } else {
          toast.error(res.message || "Failed to load lesson");
        }
      } catch (err) {
        toast.error("Error loading lesson");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.lessonId]);

  // 🔹 Update lesson
  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        materials,
      };
      const res = await apiClient(
        "PUT",
        `/lessons/${params.lessonId}`,
        payload
      );
      if (res.ok) {
        toast.success("Lesson updated successfully");
        router.push(`/admin/courses/${params.id}`);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <h1 className="text-xl font-bold mb-4">Edit Lesson</h1>

      <div>
        <label className="block mb-1 font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Duration (minutes)</label>
        <Input
          type="number"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Video URL</label>
        <Input
          value={formData.video_url}
          onChange={(e) =>
            setFormData({ ...formData, video_url: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Video Thumbnail URL</label>
        <Input
          value={formData.video_thumnail}
          onChange={(e) =>
            setFormData({ ...formData, video_thumnail: e.target.value })
          }
        />
      </div>

      {/* Materials Section */}
      <div>
        <h2 className="font-semibold mt-4">Materials</h2>
        {materials.map((mat, idx) => (
          <div key={idx} className="flex gap-2 mt-2">
            <Input
              placeholder="Type (notes/pdf/assignment)"
              value={mat.material_type}
              onChange={(e) => {
                const copy = [...materials];
                copy[idx].material_type = e.target.value;
                setMaterials(copy);
              }}
            />
            <Input
              placeholder="Title"
              value={mat.material_title}
              onChange={(e) => {
                const copy = [...materials];
                copy[idx].material_title = e.target.value;
                setMaterials(copy);
              }}
            />
            <Input
              placeholder="URL"
              value={mat.material_url}
              onChange={(e) => {
                const copy = [...materials];
                copy[idx].material_url = e.target.value;
                setMaterials(copy);
              }}
            />
          </div>
        ))}
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() =>
            setMaterials((prev) => [
              ...prev,
              { material_type: "", material_title: "", material_url: "" },
            ])
          }
        >
          Add Material
        </Button>
      </div>

      <Button onClick={handleUpdate} disabled={saving} className="mt-6">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Lesson
      </Button>
    </div>
  );
}
