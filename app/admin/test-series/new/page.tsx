"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { uploadPDFfile, uploadTestSeries, fetchCategories, fetchSubcategories } from "@/lib/function"
import { toast } from "@/components/ui/use-toast"

interface Option {
  name: string;
  image?: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
  correctAns: string;
  explanation?: string;
  marks: number;
}

interface TestSeriesFormData {
  title: string;
  description: string;
  terms: string[];
  duration: string;
  paid: boolean;
  price?: number;
  startDate: string;
  endDate: string;
  questions: Question[];
  status: string;
  totalMarks?: string;
  category: string;
  subcategory: string;
}

const mockCourses = [
  { id: "course1", title: "JavaScript Fundamentals" },
  { id: "course2", title: "React Advanced" },
  { id: "course3", title: "Node.js Backend" },
]

export default function NewTestSeriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true)
  const [loadingSubcategories, setLoadingSubcategories] = useState<boolean>(false)

  const [formData, setFormData] = useState<TestSeriesFormData>({
    title: "",
    description: "",
    terms: [""],
    duration: "60",
    paid: false,
    price: undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    questions: [],
    status: "draft",
    category: "",
    subcategory: "",
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [totalMarks, setTotalMarks] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isParsingPDF, setIsParsingPDF] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      const res = await fetchCategories()
      if (res) setCategories(res)
      setLoadingCategories(false)
    }
    loadCategories()
  }, [])

  const handleCategoryChange = async (value: string) => {
    handleInputChange("category", value)
    setFormData(prev => ({ ...prev, subcategory: "" }))
    setLoadingSubcategories(true)
    const subs = await fetchSubcategories(value)
    if (subs) setSubcategories(subs)
    else setSubcategories([])
    setLoadingSubcategories(false)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'questions') {
          const formattedQuestions = questions.map(q => ({
            question: q.question,
            options: q.options.map(opt => opt.name),
            correctAns: q.correctAns,
            marks: Number(q.marks) || 1,
            explanation: q.explanation || ''
          }))
          formDataToSend.append('questions', JSON.stringify(formattedQuestions))
        } else if (key === 'terms') {
          formDataToSend.append('terms', JSON.stringify(value))
        } else if (key === 'price') {
          if (formData.paid) {
            const num = Number(value);
            if (!isNaN(num)) {
              formDataToSend.append('price', num.toString());
            } else {
              formDataToSend.append('price', '0');
            }
          } else {
            formDataToSend.append('price', '0');
          }
        }
        else if (key === 'paid') {
          formDataToSend.append(key, value ? 'true' : 'false')
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        } else if(value){
          formDataToSend.append(key, value)
        }
      })

      if (uploadedFile) {
        formDataToSend.append('file', uploadedFile)
      }
      formDataToSend.append('totalMarks', totalMarks.toString())

      const result = await uploadTestSeries(formDataToSend)
      if (result) {
        toast({
          title: "Success",
          description: "Test series created successfully!",
          variant: "default",
        })
        router.push('/admin/test-series')
      }
    } catch (error) {
      console.error('Error creating test series:', error)
      toast({
        title: "Error",
        description: "Failed to create test series. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof Omit<TestSeriesFormData, 'terms'>, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...formData.terms]
    newTerms[index] = value
    setFormData(prev => ({ ...prev, terms: newTerms }))
  }

  const addTerm = () => {
    setFormData(prev => ({ ...prev, terms: [...prev.terms, ''] }))
  }

  const removeTerm = (index: number) => {
    if (formData.terms.length > 1) {
      const newTerms = formData.terms.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, terms: newTerms }))
    }
  }

  const updateTotalMarks = (questions: Question[]) => {
    const total = questions.reduce((sum, q) => sum + (q.marks || 0), 0)
    setTotalMarks(total)
  }

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setIsParsingPDF(true);

      try {
        const uploadRes = await uploadPDFfile(file);

        const pdfUrl = uploadRes?.pdfUrl;
        if (!pdfUrl) throw new Error("No pdfUrl returned from upload");

        const parseRes = await fetch("https://pdf-parsing-3e3i.onrender.com/parse-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfUrl }),
        });
        const parseData = await parseRes.json();
        console.log("Parse result:", parseData);

        if (parseData?.data) {
          const parsedQuestions: Question[] = parseData.data.map((q: any, idx: number) => ({
            id: `q${idx + 1}`,
            question: q.question,
            options: q.options,
            correctAns: q.correctAns,
            marks: 1,
          }));

          setQuestions(parsedQuestions);
          updateTotalMarks(parsedQuestions);
          setFormData((prev) => ({
            ...prev,
            totalMarks: parsedQuestions.reduce((sum, q) => sum + q.marks, 0).toString(),
          }));
        } else {
          console.error("No questions returned from parser");
        }
      } catch (error) {
        console.error("Error in PDF upload/parse:", error);
      } finally {
        setIsParsingPDF(false);
      }
    }
  };


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

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Terms & Conditions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTerm}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Term
                    </Button>
                  </div>
                  {formData.terms.map((term, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Term ${index + 1}`}
                        value={term}
                        onChange={(e) => handleTermChange(index, e.target.value)}
                        required
                      />
                      {formData.terms.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTerm(index)}
                          className="h-10 w-10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      required
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pricing</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="free"
                          name="pricing"
                          checked={!formData.paid}
                          onChange={() => setFormData(prev => ({ ...prev, paid: false, price: undefined }))}
                          className="h-4 w-4 text-primary"
                        />
                        <Label htmlFor="free" className="cursor-pointer">Free</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="paid"
                          name="pricing"
                          checked={formData.paid}
                          onChange={() => setFormData(prev => ({ ...prev, paid: true }))}
                          className="h-4 w-4 text-primary"
                        />
                        <Label htmlFor="paid" className="cursor-pointer">Paid</Label>
                      </div>
                    </div>
                  </div>

                  {formData.paid && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        value={formData.price ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = Number(val);
                          setFormData(prev => ({
                            ...prev,
                            price: val === '' ? undefined : !isNaN(num) ? num : prev.price
                          }));
                        }}                        
                        required={formData.paid}
                        min="0"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      required
                      min={formData.startDate}
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger disabled={loadingCategories}>
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories && (
                          <SelectItem disabled value="loading">Loading...</SelectItem>
                        )}
                        {!loadingCategories && categories.length === 0 && (
                          <SelectItem disabled value="empty">No categories found</SelectItem>
                        )}
                        {!loadingCategories && categories.length > 0 &&
                          categories.map((cat: any) => {
                            const id = cat?._id || cat?.id || String(cat?.value || "")
                            const name = cat?.name || cat?.label || "Unnamed"
                            return (
                              <SelectItem key={id} value={id}>
                                {name}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => handleInputChange("subcategory", value)}
                      disabled={!formData.category || loadingSubcategories || loadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !formData.category 
                              ? "Select a category first" 
                              : loadingSubcategories 
                                ? "Loading subcategories..." 
                                : "Select Subcategory"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {!formData.category && (
                          <SelectItem disabled value="no-cat">Select a category first</SelectItem>
                        )}
                        {formData.category && loadingSubcategories && (
                          <SelectItem disabled value="loading">Loading...</SelectItem>
                        )}
                        {formData.category && !loadingSubcategories && subcategories.length === 0 && (
                          <SelectItem disabled value="empty">No subcategories found</SelectItem>
                        )}
                        {formData.category && !loadingSubcategories && subcategories.length > 0 &&
                          subcategories.map((s: any) => {
                            const id = s?._id || s?.id || String(s?.value || "")
                            const name = s?.name || s?.label || "Unnamed"
                            return (
                              <SelectItem key={id} value={id}>
                                {name}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground " />
                    <div className="mt-4 flex items-center flex-col">
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
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parsed Questions</CardTitle>
                  <CardDescription>Review the extracted questions, options, and answers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 border rounded-lg space-y-2">
                      <p className="font-medium">
                        {idx + 1}. {q.question}
                      </p>
                      <ul className="space-y-1 ml-4">
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={`text-sm ${opt.name === q.correctAns ? "font-semibold text-green-600" : ""
                              }`}
                          >
                            {opt.name}
                            {opt.name === q.correctAns && " ✅"}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Correct Answer: <span className="font-semibold">{q.correctAns}</span>
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

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
