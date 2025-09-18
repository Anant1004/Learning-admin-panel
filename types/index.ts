export type UserRole = "admin" | "instructor" | "student";

// Database schema types for the LMS system
export interface Subcategory {
  _id?: number
  name: string
  description: string
}

export interface Category {
  _id: number
  name: string
  description: string
  subcategories: Subcategory[]
}


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
  duration: number
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

// Normalized backend-style Test Series types
export interface TestSeries {
  // Many APIs use Mongo-style `_id`. Keep optional `id` for compatibility.
  _id: string
  id?: string
  title: string
  description?: string
  courseId?: string
  questions?: TestSeriesQuestion[]
  duration?: number
  totalMarks?: number
  marksPerQuestion?: number
  status?: "draft" | "published"
  createdAt?: string | Date
  updatedAt?: string | Date
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

export interface TestSeriesQuestionOption {
  name: string
}

export interface TestSeriesQuestion {
  _id: string
  question: string
  options: TestSeriesQuestionOption[]
  correctAns: string
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
export interface EnhancedUser {
  _id: string;
  fullname: string;
  email: string;
  phoneNo?: string;
  role: UserRole | string;
  bio?: string;
  expertise?: string[];
  profile_image?: string;
  created_at: string;
  updatedAt?: string;
  status?: "active" | "inactive";
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
}

export interface BannerItem {
  _id?: string
  image: string
  url?: string
}

export interface BannerGroup {
  type: "website" | "app1" | "app2"
  banners: BannerItem[]
}

export interface ApiOk<T = unknown> {
  ok: true
  message?: string
  data?: T
}
