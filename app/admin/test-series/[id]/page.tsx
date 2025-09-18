"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, FileText, CheckCircle } from "lucide-react"
import { getTestSeriesById } from "@/lib/function"
import type { TestSeries, TestSeriesQuestion } from "@/types"

export default function TestSeriesPreviewPage() {
    const params = useParams()
    const testId = params.id as string
    const [testSeries, setTestSeries] = useState<TestSeries | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const res = await getTestSeriesById(testId)
            setTestSeries(res)
            setLoading(false)
        }
        if (testId) load()
    }, [testId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">Loading test series...</div>
            </div>
        )
    }

    if (!testSeries) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Test Series Not Found</h2>
                    <p className="text-muted-foreground mb-4">The test series you're looking for doesn't exist.</p>
                    <Link href="/admin/test-series">
                        <Button>Back to Test Series</Button>
                    </Link>
                </div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold text-balance">{testSeries?.title}</h1>
                    <p className="text-muted-foreground">{testSeries?.description}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Test Info Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{testSeries?.questions?.length ?? 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{testSeries?.duration ?? 0} Minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{testSeries?.totalMarks ?? 0} Total Marks</span>
                            </div>
                            <div>
                                <Badge variant={testSeries?.status === "published" ? "default" : "secondary"}>{testSeries?.status ?? "draft"}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions Preview</CardTitle>
                            <CardDescription>All questions in this test series</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {testSeries?.questions?.map((question: TestSeriesQuestion, index: number) => (
                                    <div key={question._id ?? index} className="border rounded-lg p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Question {index + 1}</Badge>
                                                {typeof testSeries?.marksPerQuestion === "number" && (
                                                    <Badge variant="secondary">{testSeries.marksPerQuestion} marks</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-medium text-lg mb-4">{question.question}</h3>

                                        <div className="space-y-2 mb-4">
                                            {question.options.map((option, optIndex) => {
                                                const isCorrect = option.name === question.correctAns;
                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-muted/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                                                            <span>{option.name}</span>
                                                            {isCorrect && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
