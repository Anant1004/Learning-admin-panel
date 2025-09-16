"use client"

import type React from "react"

import { act, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, Save, FileText, BookOpen, PenTool, Paperclip, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "react-hot-toast";
import axios from "axios"
import { Progress } from "@/components/ui/progress"

export default function NewLessonPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const router = useRouter()
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [ispendingbasicdetails, setIsPendingBasicDetails] = useState<boolean>(false)
  const [lessonid, setLessonId] = useState<string>()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // videoUrl: "",
    duration: "",
  })
  const [videocontentformdata, setVideoContentFormData] = useState({
    video_url: "",
    video: null
  })
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);


  const [materials, setMaterials] = useState<
    Array<{
      type: "notes" | "pdf" | "assignment"
      title: string
      file?: File
    }>
  >([])


  // Button click pe file chooser open karo
  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  // File change hone par handle karo
  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress(0);
      // 1. Backend se signature lo
      const data = await apiClient("GET", "/get-signature");
      // 2. Directly Cloudinary pe upload karo
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
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      // setVideoURL(uploadRes.data.secure_url); // Cloudinary URL mil gaya
      setVideoContentFormData((prev) => ({
        ...prev,
        video: uploadRes.data.secure_url
      }));
      console.log("Video uploaded:", uploadRes.data.secure_url);

      // Ab ye URL database me save kar sakte ho backend API se
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
    console.log("Selected file:", file);
    // Yahan tum Cloudinary pe upload kar sakte ho
  };
  // console.log("EEEEEEEEEEEEEEEE:", videocontentformdata)

  console.log("chapter id aur course ID", params)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // console.log("Creating lesson:", formData, materials)
    if (activeTab == "video") {
      if (!videocontentformdata.video) {
        const confirmUpload = window.confirm("Kya aap bina video ke aage badhna chahte ho?");
        if (confirmUpload) {
          try {
            const res = await apiClient("PUT", `/lesson/68c92b10dc84b89680aef406`, { video_url: videocontentformdata.video_url, video: videocontentformdata.video })
            if (res.ok) {
              toast.success("yes it is uploaded")
              setActiveTab("materials")
            }
          } catch (error) {
            console.log("ERROR", error)
          }
        }
        else {
          return
        }
      }

    }

    if (activeTab == "basic") {
      try {
        setIsPendingBasicDetails(true)
        const res = await apiClient("POST", `/lesson`, {
          title: formData.title,
          description: formData.description,
          duration: Number(formData.duration),
          chapterId: params.chapterId,
          courseId: params.id
        })
        if (res.ok) {
          toast.success(res.message)
          setActiveTab("video")
          console.log("LESSION HAS BEEN CREATED:", res)
          setFormData({
            title: "",
            description: "",
            duration: "",
          })
        }
      } catch (error) {
        console.log("ERROR", error)
      }
      finally {
        setIsPendingBasicDetails(false)
      }
    }

    if (activeTab == "materials") {

      alert("ready to upload pdf aur something")
    }

    // router.push(`/admin/courses/${params.id}/chapters`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const handleInputChangeVideo = (field: string, value: string) => {
    setVideoContentFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addMaterial = (type: "notes" | "pdf" | "assignment") => {
    setMaterials((prev) => [...prev, { type, title: "" }])
  }
  console.log("XXXXXXXXXXXXXMATERIALS:", materials)

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

const handleMaterialFile = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // setIsUploading(true);
    // setUploadProgress(0);

    // 1. Backend se signature lo
    const data = await apiClient("GET", "/get-signature");

    // 2. Directly Cloudinary pe upload karo
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
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // setUploadProgress(percent);
        },
      }
    );

    // Update the specific material in the array
    setMaterials((prev) =>
      prev.map((mat, i) =>
        i === index ? { ...mat, file: file, url: uploadRes.data.secure_url } : mat
      )
    );

    console.log("Material uploaded:", uploadRes.data.secure_url);
  } catch (err) {
    console.log("Upload error:", err);
  } finally {
    setIsUploading(false);
  }
};

  // Cloudinary URL mil gaya  }

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

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Or upload a video file</p>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <Button variant="outline" type="button"
                        onClick={handleChooseFile}
                      >
                        Choose Video File
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        MP4, WebM up to 500MB
                      </p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="w-full mt-1.5">
                      <Progress value={uploadProgress} />
                      <p className="mt-2 text-sm">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                  {!isUploading && videocontentformdata.video && (
                    <div className="mt-4 ">
                      <p className="text-green-600 text-sm">Upload complete!</p>
                      <video
                        src={videocontentformdata.video}
                        controls
                        preload="metadata"
                        className="w-full h-64 rounded-lg mt-2 object-contain bg-black" onError={() => console.log("Video load error")}
                      />
                    </div>
                  )}
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
                  {/* <Button type="button" variant="outline" onClick={() => addMaterial("dpp")} className="justify-start">
                    <PenTool className="mr-2 h-4 w-4" />
                    Add DPP
                  </Button> */}
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
                        <Button type="button" variant="outline" size="sm" >
                          <input type="file" name="material_url" className="w-8"  onChange={(e) => handleMaterialFile(e, index)} />
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
            {ispendingbasicdetails ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {ispendingbasicdetails ? activeTab == "basic" ? "Creating..." : activeTab == "video" ? "uploading..." : "Lesson Materials Saving..." : activeTab == "basic" ? "Create Lesson And Next" : activeTab == "video" ? "Save Video And Next" : "Save Materials"}
          </Button>
        </div>
      </form>
    </div>
  )
}
