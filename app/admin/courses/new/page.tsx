"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Save, Eye, Plus, X } from "lucide-react"
import Link from "next/link"

const mockInstructors = [
  { id: "inst1", name: "John Smith", email: "john@example.com" },
  { id: "inst2", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "inst3", name: "Mike Wilson", email: "mike@example.com" },
]

const mockCategories = [
  { id: "cat1", name: "Programming" },
  { id: "cat2", name: "Design" },
  { id: "cat3", name: "Business" },
  { id: "cat4", name: "Marketing" },
]

const mockSubCategories = [
  { id: "subcat1", name: "Web Development", categoryId: "cat1" },
  { id: "subcat2", name: "Mobile Development", categoryId: "cat1" },
  { id: "subcat3", name: "UI/UX Design", categoryId: "cat2" },
  { id: "subcat4", name: "Graphic Design", categoryId: "cat2" },
]

const mockSubjects = [
  { id: "sub1", name: "JavaScript" },
  { id: "sub2", name: "React" },
  { id: "sub3", name: "Node.js" },
  { id: "sub4", name: "Python" },
]

export default function NewCoursePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    course_topic: [] as string[],
    course_languages: [] as string[],
    subtitle_language: [] as string[],
    level: "beginner",
    duration: "",
    instructorId: [] as string[],
    paid: true,
    startDate: "",
    endDate: "",
    actualPrice: "",
    discountPrice: "",
    schedule: [] as string[],
    outcomes: [] as string[],
    faq: [{ question: "", answer: "" }] as Array<{ question: string; answer: string }>,
    thumbnail_url: "",
    video_url: "",
    subjectId: "",
    newTopic: "",
    newLanguage: "",
    newSubtitleLanguage: "",
    newInstructor: "",
    newSchedule: "",
    newOutcome: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating course:", formData)
    router.push("/admin/courses")
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addToArray = (field: keyof typeof formData, value: string, tempField: string) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[]
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentArray, value.trim()],
        [tempField]: "",
      }))
    }
  }

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    const currentArray = formData[field] as string[]
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index),
    }))
  }

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: "", answer: "" }],
    }))
  }

  const removeFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }))
  }

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Create New Course</h1>
          <p className="text-muted-foreground">Add a new course to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Course Subtitle</Label>
                  <Input
                    id="subtitle"
                    placeholder="Enter course subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Sub Category</Label>
                    <Select
                      value={formData.subCategoryId}
                      onValueChange={(value) => handleInputChange("subCategoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSubCategories
                          .filter((sub) => sub.categoryId === formData.categoryId)
                          .map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course Type</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="paid"
                          name="courseType"
                          checked={formData.paid}
                          onChange={() => handleInputChange("paid", true)}
                        />
                        <Label htmlFor="paid">Paid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="free"
                          name="courseType"
                          checked={!formData.paid}
                          onChange={() => handleInputChange("paid", false)}
                        />
                        <Label htmlFor="free">Free</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Schedule</CardTitle>
                <CardDescription>Set course pricing and schedule information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actualPrice">Actual Price ($)</Label>
                    <Input
                      id="actualPrice"
                      type="number"
                      step="0.01"
                      placeholder="99.99"
                      value={formData.actualPrice}
                      onChange={(e) => handleInputChange("actualPrice", e.target.value)}
                      disabled={!formData.paid}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      placeholder="79.99"
                      value={formData.discountPrice}
                      onChange={(e) => handleInputChange("discountPrice", e.target.value)}
                      disabled={!formData.paid}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="40"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topics & Languages</CardTitle>
                <CardDescription>Define course topics and language settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Topics</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a topic"
                      value={formData.newTopic}
                      onChange={(e) => handleInputChange("newTopic", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addToArray("course_topic", formData.newTopic, "newTopic")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToArray("course_topic", formData.newTopic, "newTopic")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.course_topic.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {topic}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromArray("course_topic", index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Course Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a language"
                      value={formData.newLanguage}
                      onChange={(e) => handleInputChange("newLanguage", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addToArray("course_languages", formData.newLanguage, "newLanguage")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToArray("course_languages", formData.newLanguage, "newLanguage")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.course_languages.map((language, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray("course_languages", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subtitle Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add subtitle language"
                      value={formData.newSubtitleLanguage}
                      onChange={(e) => handleInputChange("newSubtitleLanguage", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addToArray("subtitle_language", formData.newSubtitleLanguage, "newSubtitleLanguage")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        addToArray("subtitle_language", formData.newSubtitleLanguage, "newSubtitleLanguage")
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.subtitle_language.map((language, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray("subtitle_language", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructors</CardTitle>
                <CardDescription>Assign instructors to this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Assign Instructors</Label>
                  <Select
                    value={formData.newInstructor}
                    onValueChange={(value) => handleInputChange("newInstructor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstructors
                        .filter((instructor) => !formData.instructorId.includes(instructor.id))
                        .map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name} ({instructor.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (formData.newInstructor) {
                        addToArray("instructorId", formData.newInstructor, "newInstructor")
                      }
                    }}
                    disabled={!formData.newInstructor}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructor
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.instructorId.map((instructorId, index) => {
                    const instructor = mockInstructors.find((i) => i.id === instructorId)
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>
                          {instructor?.name} ({instructor?.email})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray("instructorId", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Outcomes</CardTitle>
                <CardDescription>Define course schedule and learning outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add schedule item (e.g., Mon-Wed-Fri 10:00 AM)"
                      value={formData.newSchedule}
                      onChange={(e) => handleInputChange("newSchedule", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addToArray("schedule", formData.newSchedule, "newSchedule")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToArray("schedule", formData.newSchedule, "newSchedule")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.schedule.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray("schedule", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Learning Outcomes</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add learning outcome"
                      value={formData.newOutcome}
                      onChange={(e) => handleInputChange("newOutcome", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addToArray("outcomes", formData.newOutcome, "newOutcome")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToArray("outcomes", formData.newOutcome, "newOutcome")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{outcome}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray("outcomes", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Add common questions and answers about the course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.faq.map((faqItem, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded">
                    <div className="flex items-center justify-between">
                      <Label>FAQ {index + 1}</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFAQ(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Question"
                      value={faqItem.question}
                      onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer"
                      value={faqItem.answer}
                      onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFAQ}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Media</CardTitle>
                <CardDescription>Upload thumbnail and promotional video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Promotional Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video_url}
                    onChange={(e) => handleInputChange("video_url", e.target.value)}
                  />
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button variant="outline" type="button">
                      Choose Thumbnail
                    </Button>
                    <p className="mt-2 text-sm text-muted-foreground">
                      PNG, JPG up to 2MB. Recommended size: 1280x720px
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>Control course visibility and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Course</Label>
                  <Switch id="featured" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <Switch id="notifications" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>After creating the course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span>Add chapters and lessons</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span>Upload course materials</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span>Set up assessments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span>Publish when ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <Link href="/admin/courses">
            <Button variant="outline">Cancel</Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" type="button">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
