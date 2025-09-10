"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type NotificationType = 'all' | 'students' | 'instructors' | 'specific'

export default function NotificationsPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [notificationType, setNotificationType] = useState<NotificationType>('all')
  const [specificUser, setSpecificUser] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

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
      // TODO: Replace with actual API call to send notification
      console.log({
        title,
        message,
        type: notificationType,
        specificUser: notificationType === 'specific' ? specificUser : undefined
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Notification sent successfully!",
      })
      
      setTitle("")
      setMessage("")
      setNotificationType('all')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Notification</h1>
        <p className="text-muted-foreground">Send push notifications to your users</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
          <CardDescription>
            Fill in the details below to send a notification to your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>View your notification history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent notifications</p>
          </div>
          {/* TODO: Add notification history list */}
        </CardContent>
      </Card>
    </div>
  )
}
