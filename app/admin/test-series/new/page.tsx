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
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Save, Eye, Plus, FileText, Trash2 } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  marks: number
}

const mockCourses = [
  { id: "course1", title: "JavaScript Fundamentals" },
  { id: "course2", title: "React Advanced" },
  { id: "course3", title: "Node.js Backend" },
]

export default function NewTestSeriesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    duration: "",
    totalMarks: "",
    status: "draft",
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isParsingPDF, setIsParsingPDF] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    marks: "1",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating test series:", { formData, questions })
    router.push("/admin/test-series")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      setIsParsingPDF(true)

      // Simulate PDF parsing
      setTimeout(() => {
        const parsedQuestions: Question[] = [
          {
            id: "q1",
            question: "What is the correct way to declare a variable in JavaScript?",
            options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
            correctAnswer: 0,
            explanation: "The 'var' keyword is used to declare variables in JavaScript.",
            marks: 2,
          },
          {
            id: "q2",
            question: "Which method is used to add an element to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: 0,
            explanation: "The push() method adds one or more elements to the end of an array.",
            marks: 2,
          },
          {
            id: "q3",
            question: "What does DOM stand for?",
            options: [
              "Document Object Model",
              "Data Object Management",
              "Dynamic Object Method",
              "Document Oriented Model",
            ],
            correctAnswer: 0,
            explanation: "DOM stands for Document Object Model, which represents the structure of HTML documents.",
            marks: 1,
          },
        ]
        setQuestions(parsedQuestions)
        setFormData((prev) => ({
          ...prev,
          totalMarks: parsedQuestions.reduce((sum, q) => sum + q.marks, 0).toString(),
        }))
        setIsParsingPDF(false)
      }, 2000)
    }
  }

  const addManualQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every((opt) => opt.trim())) {
      const newQuestion: Question = {
        id: `q${questions.length + 1}`,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        marks: Number.parseInt(currentQuestion.marks),
      }
      setQuestions([...questions, newQuestion])
      setCurrentQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        marks: "1",
      })
      setShowQuestionForm(false)

      // Update total marks
      const newTotalMarks = [...questions, newQuestion].reduce((sum, q) => sum + q.marks, 0)
      setFormData((prev) => ({ ...prev, totalMarks: newTotalMarks.toString() }))
    }
  }

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId)
    setQuestions(updatedQuestions)
    const newTotalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0)
    setFormData((prev) => ({ ...prev, totalMarks: newTotalMarks.toString() }))
  }

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/test-series">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Create Test Series</h1>
          <p className="text-muted-foreground">Create a new assessment for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Series Information</CardTitle>
                <CardDescription>Basic details about your test series</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Series Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter test series title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this test series covers"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course">Associated Course (Optional)</Label>
                    <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="100"
                    value={formData.totalMarks}
                    onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Questions</CardTitle>
                <CardDescription>Upload a PDF file to automatically extract questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" id="pdf-upload" />
                      <Label htmlFor="pdf-upload">
                        <Button variant="outline" type="button" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload PDF
                          </span>
                        </Button>
                      </Label>
                      <p className="mt-2 text-sm text-muted-foreground">
                        PDF files only. Questions will be automatically extracted.
                      </p>
                    </div>
                  </div>

                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{uploadedFile.name}</span>
                      {isParsingPDF && <Badge variant="secondary">Parsing...</Badge>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions ({questions.length})</CardTitle>
                    <CardDescription>Manage test questions and answers</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowQuestionForm(!showQuestionForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showQuestionForm && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter your question"
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, question: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === index}
                            onChange={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                          />
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateQuestionOption(index, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          placeholder="Explain the correct answer"
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={currentQuestion.marks}
                          onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, marks: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" onClick={addManualQuestion}>
                        Add Question
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowQuestionForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {questions.length > 0 && (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="secondary">{question.marks} marks</Badge>
                            </div>
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`text-sm p-2 rounded ${
                                    optIndex === question.correctAnswer
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : "bg-muted"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {questions.length === 0 && !showQuestionForm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>No questions added yet</p>
                    <p className="text-sm">Upload a PDF or add questions manually</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>Control test series visibility</CardDescription>
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
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
                <CardDescription>Overview of your test series</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Marks:</span>
                  <span className="font-medium">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-medium">{formData.duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={formData.status === "published" ? "default" : "secondary"}>{formData.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link href="/admin/test-series">
            <Button variant="outline">Cancel</Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" type="button">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button type="submit" disabled={questions.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Create Test Series
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
