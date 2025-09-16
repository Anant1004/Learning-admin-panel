"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { fetchNotifications, uploadNotification } from "@/lib/function"

type NotificationType = 'all' | 'students' | 'instructors' | 'specific'

export default function NotificationsPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [notificationType, setNotificationType] = useState<NotificationType>('all')
  const [specificUser, setSpecificUser] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const res = await fetchNotifications()
        if (res?.success) {
          setNotifications(res.data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const sendToMap: Record<NotificationType, string> = {
        all: "All Users",
        students: "Students Only",
        instructors: "Instructors Only",
        specific: "Specific User",
      }

      const payload: any = {
        title,
        message,
        sendTo: sendToMap[notificationType],
      }

      if (notificationType === "specific") {
        payload.specificUser = specificUser
      }

      const res = await uploadNotification(payload)

      toast({
        title: "Success",
        description:
          notificationType === "specific"
            ? `Notification sent to ${specificUser}`
            : "Notification sent successfully!",
      })

      setTitle("")
      setMessage("")
      setNotificationType("all")
      setSpecificUser("")
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Notification</h1>
        <p className="text-muted-foreground">Send push notifications to your users</p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
          <CardDescription>
            Fill in the details below to send a notification to your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-type">Send To</Label>
              <Select
                value={notificationType}
                onValueChange={(value: NotificationType) => setNotificationType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="instructors">Instructors Only</SelectItem>
                  <SelectItem value="specific">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationType === 'specific' && (
              <div className="space-y-2">
                <Label htmlFor="specific-user">User Email or ID</Label>
                <Input
                  id="specific-user"
                  placeholder="Enter user email or ID"
                  value={specificUser}
                  onChange={(e) => setSpecificUser(e.target.value)}
                  required={notificationType === 'specific'}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>View your notification history</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n._id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>
                      Send To: {n.sendTo}
                      {n.specificUser && ` (${n.specificUser})`}
                    </span>
                    <span>{new Date(n.createdAt)?.toDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}
