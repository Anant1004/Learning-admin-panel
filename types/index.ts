// Database schema types for the LMS system
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "instructor" | "student"
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  instructorId: string
  instructor?: User
  status: "draft" | "published" | "archived"
  price: number
  duration: number // in hours
  chapters: Chapter[]
  createdAt: Date
  updatedAt: Date
}

export interface Chapter {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  chapterId: string
  title: string
  description: string
  order: number
  videoUrl?: string
  duration: number // in minutes
  materials: LessonMaterial[]
  createdAt: Date
  updatedAt: Date
}

export interface LessonMaterial {
  id: string
  lessonId: string
  title: string
  type: "notes" | "dpp" | "pdf" | "assignment"
  fileUrl: string
  createdAt: Date
}

export interface TestSeries {
  id: string
  title: string
  description: string
  courseId?: string
  questions: Question[]
  duration: number // in minutes
  totalMarks: number
  status: "draft" | "published"
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  testSeriesId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  marks: number
  order: number
}

export interface FreeVideo {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnail?: string
  duration: number
  views: number
  status: "draft" | "published"
  createdAt: Date
  updatedAt: Date
}
