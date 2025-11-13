"use client"

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, BarChart2, Calendar, User, Clock, Award, CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { fetchTestSeriesResults } from "@/lib/function"

interface TestResult {
  _id: string
  testSeriesId: {
    _id: string
    title: string
    totalMarks: number
  }
  userId: {
    _id: string
    fullname: string
    email: string
  }
  score: number
  totalMarks: number
  attemptedAt: string
  answers: Record<string, string>
  questionStatus: Record<string, string>
}

export default function TestSeriesResultsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        console.log('Fetching test results...')
        setIsLoading(true)
        const data = await fetchTestSeriesResults()
        console.log('API Response: of test series results', data)
        
        if (!data) {
          console.error('No data received from API')
          return
        }
        
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data)
          return
        }
        
        console.log(`Fetched ${data.length} test results`)
        setResults(data)
      } catch (error) {
        console.error('Error in loadResults:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [])

  const filteredResults = results.filter(result => {
    // Make sure we have the required nested properties
    if (!result.testSeriesId || !result.userId) return false
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      (result.testSeriesId?.title?.toLowerCase().includes(searchLower) ||
      result.userId?.fullname?.toLowerCase().includes(searchLower) ||
      result.userId?.email?.toLowerCase().includes(searchLower) ||
      false)
    
    const scorePercentage = result.totalMarks > 0 ? (result.score / result.totalMarks) : 0
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "passed" ? scorePercentage >= 0.5 : scorePercentage < 0.5)
    
    // Filter by date if needed
    const testDate = new Date(result.attemptedAt || new Date())
    const now = new Date()
    let matchesDate = true
    
    if (dateFilter === "today") {
      matchesDate = testDate.toDateString() === now.toDateString()
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      matchesDate = testDate >= oneWeekAgo
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(now.getMonth() - 1)
      matchesDate = testDate >= oneMonthAgo
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleViewDetails = (resultId: string) => {
    router.push(`/admin/test-series/results/${resultId}`)
  }

  const getStatusBadge = (result: TestResult) => {
    const percentage = (result.score / result.totalMarks) * 100
    const isPassed = percentage >= 50
    
    return (
      <Badge variant={isPassed ? "default" : "destructive"} className="capitalize">
        {isPassed ? (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Passed
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        )}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Test Series Results</h1>
          <p className="text-muted-foreground">View and manage test results</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by test or student..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <span>{filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found</span>
                {isLoading && (
                  <span className="inline-block h-2 w-2 animate-ping rounded-full bg-primary ml-1"></span>
                )}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Passed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span>Failed</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="p-3">Test Title</th>
                    <th className="p-3">Student</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3 text-right hidden md:table-cell">Percentage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right hidden sm:table-cell">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        Loading results...
                      </td>
                    </tr>
                  ) : filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No results found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result) => {
                      const percentage = (result.score / result.totalMarks) * 100
                      const testDate = new Date(result.attemptedAt)
                      
                      return (
                        <tr key={result._id} className="hover:bg-muted/50">
                          <td className="p-3 font-medium">
                            <div className="font-medium">{result.testSeriesId.title}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {format(testDate, 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{result.userId.fullname}</div>
                            <div className="text-xs text-muted-foreground">
                              {result.userId.email}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="font-medium">
                              {result.score} / {result.totalMarks}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {percentage.toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-3 text-right hidden md:table-cell">
                            {percentage.toFixed(1)}%
                          </td>
                          <td className="p-3">
                            {getStatusBadge(result)}
                          </td>
                          <td className="p-3 text-right text-sm text-muted-foreground hidden sm:table-cell">
                            <div className="flex flex-col items-end">
                              <span>{format(testDate, 'MMM d, yyyy')}</span>
                              <span className="text-xs">{format(testDate, 'h:mm a')}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(result._id)}
                              className="h-8"
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
