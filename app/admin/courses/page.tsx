"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Users, Clock, BookOpen } from "lucide-react"
import { FetchCourses } from "@/lib/function"

interface Instructor {
  _id: string
  fullname: string
  email?: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  status: string
  price: number
  discountPrice?: number
  instructor?: Instructor
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await FetchCourses()
      console.log("Courses:", res)

      if (res) {
        const mapped = Object.values(res)
          .filter((c: any) => c && c._id)
          .map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail_url || "/placeholder.svg",
            duration: c.duration,
            price: c.actualPrice,
            discountPrice: c.discountPrice,
            status: "published",
            instructor: c.instructorId?.[0] || undefined,
          }))
        setCourses(mapped)
      }
    }
    fetchCourses()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog and content</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="object-cover w-full h-full"
              />
              <Badge className={`absolute top-3 right-3 ${getStatusColor(course.status)}`}>
                {course.status}
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/courses/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/courses/${course.id}/chapters`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Content
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.instructor?.fullname || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}h</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    ₹{course.discountPrice || course.price}
                  </span>
                  <Link href={`/admin/courses/${course.id}/chapters`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first course"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link href="/admin/courses/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
