"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"
import toast from "react-hot-toast"
import { Trash2 } from "lucide-react"

type NotificationType = 'All Users' | 'Students Only' | 'Instructors Only' | 'Specific User'

export default function NotificationsPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [notificationType, setNotificationType] = useState<NotificationType>('All Users')
  const [specificUser, setSpecificUser] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  // const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSending(true)

    try {
      const res = await apiClient("POST", "/notifications", {
        title,
        message,
        sendTo: notificationType,
        specificUser: notificationType === 'Specific User' ? specificUser : undefined
      })

      if (res.success) {
        toast.success("Notification sent successfully to " + notificationType + " ✅")
        setTitle("")
        setMessage("")
        setNotificationType('All Users')
        setSpecificUser("")
        handleFetchNotifications();
      } else {
        toast.error("Failed to send notification ❌")
      }

    } catch (error) {
      console.error("Failed to send notification:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    handleFetchNotifications();
  }, []);

  const handleFetchNotifications = async () => {
    const res = await apiClient("GET", "/notifications", null, false);
    if (res.success) {
      setNotifications(res.data);
    }
  }
  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await apiClient("DELETE", `/notifications/${id}`);
      if (res.success) {
        toast.success("Notification deleted");
        setNotifications((prev) =>
          prev.filter((item) => item._id !== id)
        );
        handleFetchNotifications();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
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
                  <SelectItem value="All Users">All Users</SelectItem>
                  <SelectItem value="Students Only">Students Only</SelectItem>
                  <SelectItem value="Instructors Only">Instructors Only</SelectItem>
                  <SelectItem value="Specific User">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationType === 'Specific User' && (
              <div className="space-y-2">
                <Label htmlFor="specific-user">User Email or ID</Label>
                <Input
                  id="specific-user"
                  placeholder="Enter user email or ID"
                  value={specificUser}
                  onChange={(e) => setSpecificUser(e.target.value)}
                  required={notificationType === 'Specific User'}
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
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="border rounded-lg p-4 hover:shadow-md transition relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={()=>handleDeleteNotification(n._id)}
                    className="absolute top-12 right-9 p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition"
                    title="Delete Notification"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{n.title}</h3>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {n.sendTo}
                    </span>
                  </div>

                  {n.specificUser && (
                    <p className="text-sm mt-2 text-blue-600">
                      🎯 Sent to: {n.specificUser.name} ({n.specificUser.email})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}

