"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Star, TrendingUp } from "lucide-react"

interface RealtimeUpdate {
  id: string
  type: "new_feedback" | "form_created" | "high_rating" | "negative_feedback"
  message: string
  timestamp: string
  metadata?: any
}

export function RealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const mockUpdates: RealtimeUpdate[] = [
        {
          id: `update_${Date.now()}`,
          type: "new_feedback",
          message: 'New feedback received on "Customer Satisfaction Survey"',
          timestamp: new Date().toISOString(),
        },
        {
          id: `update_${Date.now() + 1}`,
          type: "high_rating",
          message: 'High rating (5 stars) received on "Product Feedback Form"',
          timestamp: new Date().toISOString(),
        },
        {
          id: `update_${Date.now() + 2}`,
          type: "form_created",
          message: 'New form "Employee Feedback" was created',
          timestamp: new Date().toISOString(),
        },
        {
          id: `update_${Date.now() + 3}`,
          type: "negative_feedback",
          message: 'Negative feedback detected on "Service Quality Survey"',
          timestamp: new Date().toISOString(),
        },
      ]

      // Randomly add an update
      if (Math.random() > 0.7) {
        const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)]
        setUpdates((prev) => [randomUpdate, ...prev.slice(0, 9)]) // Keep only 10 most recent
        setUnreadCount((prev) => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "new_feedback":
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case "high_rating":
        return <Star className="h-4 w-4 text-yellow-400" />
      case "form_created":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "negative_feedback":
        return <MessageSquare className="h-4 w-4 text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "new_feedback":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "high_rating":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "form_created":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative_feedback":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const markAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Live Updates
          </CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white cursor-pointer hover:bg-red-600" onClick={markAsRead}>
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent updates</p>
              <p className="text-sm">Updates will appear here in real-time</p>
            </div>
          ) : (
            updates.map((update, index) => (
              <div
                key={update.id}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  index < unreadCount ? "bg-white/10 border border-white/20" : "bg-white/5"
                }`}
              >
                <div className="flex-shrink-0 mt-1">{getUpdateIcon(update.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{update.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={getUpdateColor(update.type)}>{update.type.replace("_", " ")}</Badge>
                    <span className="text-xs text-gray-400">{formatTime(update.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
