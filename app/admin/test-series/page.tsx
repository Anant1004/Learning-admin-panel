"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Plus, Search, Eye, Edit, Trash2, Clock, ListChecks } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { getTestSeries,deleteTestSeries } from "@/lib/function"
import { TestSeries } from "@/types"

export default function TestSeriesPage() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);

  const fetchTestSeries = async () => {
    const res = await getTestSeries();
    if (res) setTestSeries(res);
  };

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const stats = useMemo(() => {
    const total = testSeries.length;
    const published = testSeries.filter(ts => ts.status === "published").length;
    const totalQuestions = testSeries.reduce((acc, ts) => acc + (ts.questions?.length ?? 0), 0);
    const avgDuration = total > 0
      ? Math.round(
          testSeries.reduce((acc, ts) => acc + (ts.duration ?? 0), 0) / total
        )
      : 0;
    return { total, published, totalQuestions, avgDuration };
  }, [testSeries]);

  const handleDelete = async (id: string) => {
    const res = await deleteTestSeries(id);
    fetchTestSeries();
  } 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Test Series</h1>
          <p className="text-muted-foreground">Create and manage assessments for your courses</p>
        </div>
        <Link href="/admin/test-series/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Test Series
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Series</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} min</div>
            <p className="text-xs text-muted-foreground">Average per test</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search test series..." className="pl-10" />
        </div>
        {/* <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button> */}
      </div>

      <div className="grid gap-4">
        {testSeries.map((test) => (
          <Card key={test._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </div>
                {/* <Badge variant="secondary">Draft</Badge> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{test.questions?.length || 0} Questions</span>
                  <span>{test.duration} Minutes</span>
                  <span>{test.totalMarks || 0} Marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/test-series/${test._id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/test-series/${test._id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button onClick={() => handleDelete(test._id)} variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}
