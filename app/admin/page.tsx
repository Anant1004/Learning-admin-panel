"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, PlayCircle, TrendingUp, Clock } from "lucide-react"
import { FetchCourses } from "@/lib/function";

const recentActivity = [
  { action: "New course created", details: "Advanced React Patterns", time: "2 hours ago", user: "John Instructor" },
  { action: "Student enrolled", details: "JavaScript Fundamentals", time: "4 hours ago", user: "Sarah Student" },
  { action: "Test series published", details: "Node.js Assessment", time: "6 hours ago", user: "Mike Instructor" },
  { action: "Free video uploaded", details: "CSS Grid Tutorial", time: "1 day ago", user: "Admin User" },
];

export default function AdminDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await FetchCourses();
      if (res) {
        const courseList = Array.isArray(res)
          ? res
          : Object.keys(res).filter((k) => !isNaN(Number(k))).map((k) => res[k]);
        setCourses(courseList);
      }
    };
    fetchCourses();
  }, []);

  const courseCount = courses.length;

  const stats = [
    { title: "Total Courses", value: courseCount.toString(), description: "Updated in real-time", icon: BookOpen, trend: courseCount > 0 ? "+100%" : "0%" },
    { title: "Active Students", value: "1,234", description: "+180 from last month", icon: Users, trend: "+15%" },
    { title: "Test Series", value: "18", description: "+3 from last month", icon: FileText, trend: "+20%" },
    { title: "Free Videos", value: "56", description: "+8 from last month", icon: PlayCircle, trend: "+16%" },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your LMS today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.trend}</span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your LMS platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your LMS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button
                className="cursor-pointer flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleNavigate("/admin/courses/new")}
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Create New Course</p>
                  <p className="text-sm text-muted-foreground">Start building a new course</p>
                </div>
              </button>
              <button className="cursor-pointer flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleNavigate("/admin/test-series/new")}
              >
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Add Test Series</p>
                  <p className="text-sm text-muted-foreground">Create a new assessment</p>
                </div>
              </button>
              <button className="cursor-pointer flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleNavigate("/admin/free-videos/upload")}
              >
                <PlayCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Upload Free Video</p>
                  <p className="text-sm text-muted-foreground">Add educational content</p>
                </div>
              </button>
              <button className="cursor-pointer flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleNavigate("/admin/live-classes/new")}
              >
                <PlayCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Live Class</p>
                  <p className="text-sm text-muted-foreground">Add educational content</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
