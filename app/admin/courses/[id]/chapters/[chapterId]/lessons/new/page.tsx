"use client"

import type React from "react"
import {useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, BookOpen, PenTool, Paperclip, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "react-hot-toast";
import axios from "axios"

export default function NewLessonPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // videoUrl: "",
    duration: "",
  })
  const [videocontentformdata, setVideoContentFormData] = useState({
    video_url: "",
    video_thumnail: ""
  })
  const [isUploading, setIsUploading] = useState<any>({});
  const [isPendingSubmit, setPendingSubmit] = useState(false)

  const [materials, setMaterials] = useState<
    Array<{
      material_type: "notes" | "pdf" | "assignment"
      material_title: string
      file?: File,
      url?: string,
      public_id?: string
    }>
  >([])
  const [openDialogUrl, setOpenDialogUrl] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const handleInputChangeVideo = (field: string, value: string) => {
    setVideoContentFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addMaterial = (material_type: "notes" | "pdf" | "assignment") => {
    setMaterials((prev) => [...prev, { material_type, material_title: "" }])
  }

  const updateMaterial = (index: number, field: string, value: string) => {
    setMaterials((prev) => prev.map((material, i) => (i === index ? { ...material, [field]: value } : material)))
  }

  const removeMaterial = async (index: number) => {
    const materialToRemove = materials[index];

    if (materialToRemove?.public_id) {
      try {
        setIsUploading((prev:any) => ({ ...prev, [index]: true }));
        await apiClient("POST", "/signature", {
          public_id: materialToRemove.public_id,
        });

      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
      finally {
        setIsUploading((prev:any) => ({ ...prev, [index]: false }));
      }
    }
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

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


  const handleOpenImageDialog = (url: any) => {
  
    setOpenDialogUrl(url);
  };

  const handleCloseDialog = () => {
    setOpenDialogUrl(null);
  };

const isValidYouTubeUrl = (url: any) => {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    const validHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be"
    ];

    if (!validHosts.includes(host)) return false;

    if (host.includes("youtu.be")) {
      const id = parsedUrl.pathname.slice(1);
      return id.length === 11;
    }

    const videoId = parsedUrl.searchParams.get("v");
    return !!videoId && videoId.length === 11;
  } catch {
    return false;
  }
};

const isValidUrl = (url: any) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

  const handleMaterialFile = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPendingSubmit(true)
      setIsUploading((prev:any) => ({ ...prev, [index]: true }));
      const data = await apiClient("GET", "/signature");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", data.apiKey);
      formData.append("timestamp", data.timestamp);
      formData.append("signature", data.signature);
      formData.append("folder", data.folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMaterials((prev) =>
        prev.map((mat, i) =>
          i === index ? { ...mat, file: file, url: uploadRes.data.secure_url, public_id: uploadRes.data.public_id } : mat
        )
      );

    } catch (err) {
      console.log("Upload error:", err);
    } finally {
      setIsUploading((prev:any) => ({ ...prev, [index]: false }));
      setPendingSubmit(false)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "basic") {
      if (formData.title.trim() && formData.description.trim() && formData.duration) {
        setActiveTab("video");
      } else {
        toast.error("Please Fill all fields of basic section!");
      }
    }
    else if (activeTab === "video") {
      const videoUrl = videocontentformdata.video_url.trim();
      const videoThumbnail = videocontentformdata.video_thumnail.trim();

      if (!videoUrl || !videoThumbnail) {
        toast.error("Both fields are required");
        return;
      }

      if (!isValidYouTubeUrl(videoUrl)) {
        toast.error("Please enter a valid YouTube video URL");
        return;
      }

      if (!isValidUrl(videoThumbnail)) {
        toast.error("Please enter a valid URL for video thumbnail");
        return;
      }

      setActiveTab("materials");
    }
    else if (activeTab === "materials") {
      if (materials.length > 0) {
        try {
          const body = {
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            video_url: videocontentformdata.video_url,
            video_thumnail: videocontentformdata.video_thumnail,
            materials,
            chapterId: params.chapterId,
            courseId: params.id,
          };

          const res = await apiClient("POST", "/lesson", body);
          if (res.ok) {
            toast.success("Lesson is successfully created!");
            setFormData({
              title: "",
              description: "",
              duration: "",
            });

            setVideoContentFormData({
              video_url: "",
              video_thumnail: "",
            });

            setMaterials([]);
            router.push(`/admin/courses/${params.id}/chapters`)
          }
        } catch (error: any) {
          toast.error(error);
        }
      } else {
        toast.error("Please upload notes, PDF, or assignment!");
      }
    }
  };




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
        <Tabs defaultValue="basic" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
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

          <TabsContent value="video" className="space-y-6"  >
            <Card>
              <CardHeader>
                <CardTitle>Video Content</CardTitle>
                <CardDescription>Upload or link to the lesson video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="video_url"
                    placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                    value={videocontentformdata.video_url}
                    onChange={(e) => handleInputChangeVideo("video_url", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video Thumnail URL</Label>
                  <Input
                    id="thumnail_url"
                    placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                    value={videocontentformdata.video_thumnail}
                    onChange={(e) => handleInputChangeVideo("video_thumnail", e.target.value)}
                  />
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
                        {getMaterialIcon(material.material_type)}
                        <div className="flex-1">
                          <Input
                            placeholder={`${material.material_type.charAt(0).toUpperCase() + material.material_type.slice(1)} title`}
                            value={material.material_title}
                            onChange={(e) => updateMaterial(index, "material_title", e.target.value)}
                          />
                        </div>

                        <div className="flex items-center space-x-4 my-2">
                          {isUploading[index] ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Button type="button" variant="outline" size="sm">
                              <input
                                type="file"
                                name="material_url"
                                accept="application/pdf"
                                // required
                                className="w-8"
                                onChange={(e) => handleMaterialFile(e, index)}
                              />
                              Upload File
                            </Button>
                          )}

                          {materials[index]?.file && materials[index]?.url && (
                            <>
                              <span>{materials[index].file.name.slice(0, 3)}...</span>
                              <button
                              type="button" 
                                onClick={() => handleOpenImageDialog(materials[index].url)}
                                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                              >
                                Open
                              </button>
                            </>
                          )}
                        </div>
                        {openDialogUrl && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-4 rounded shadow-lg max-w-3xl max-h-[90vh] overflow-auto">
                              <button
                              type="button" 
                                onClick={handleCloseDialog}
                                className="mb-4 px-2 py-1 bg-red-500 text-white rounded"
                              >
                                Close
                              </button>

                              {/* PDF or Image Display */}
                              {openDialogUrl.endsWith('.pdf') ? (
                                <iframe
                                  src={openDialogUrl}
                                  width="700vw"
                                  height="580px"
                                  title="PDF Preview"
                                />
                              ) : (
                                <img
                                  src={openDialogUrl}
                                  alt="Material Preview"
                                  className="max-w-full max-h-[80vh] object-contain"
                                />
                              )}
                            </div>
                          </div>
                        )}


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
          <Button type="submit" disabled={isPendingSubmit}>
            {activeTab == "basic" ? "Next To Video" : activeTab == "video" ? "Next To Materials" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  )
}
