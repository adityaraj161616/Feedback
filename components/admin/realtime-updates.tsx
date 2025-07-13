"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Clock, MessageSquare, TrendingUp, Users, RefreshCw } from "lucide-react"

interface RealtimeUpdate {
  id: number | string
  type: "feedback" | "sentiment" | "user" | "alert"
  message: string
  timestamp: Date
  severity: "info" | "success" | "warning" | "error"
}

export function RealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([
    {
      id: 1,
      type: "feedback",
      message: "New feedback received on Product Survey",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: "info",
    },
    {
      id: 2,
      type: "sentiment",
      message: "Sentiment trend improving for Customer Service Form",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: "success",
    },
    {
      id: 3,
      type: "alert",
      message: "High negative sentiment detected on Bug Report Form",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: "warning",
    },
    {
      id: 4,
      type: "user",
      message: "New user registered: john.doe@example.com",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      severity: "info",
    },
  ])

  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newUpdate = {
        id: Date.now(),
        type: ["feedback", "sentiment", "user", "alert"][Math.floor(Math.random() * 4)],
        message: [
          "New feedback received",
          "Sentiment analysis completed",
          "User activity detected",
          "System alert triggered",
        ][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        severity: ["info", "success", "warning"][Math.floor(Math.random() * 3)],
      }

      setUpdates((prev) => [newUpdate, ...prev.slice(0, 9)])
    }, 30000) // Add new update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4" />
      case "sentiment":
        return <TrendingUp className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "alert":
        return <Bell className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "warning":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      case "error":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      default:
        return "text-blue-400 bg-blue-500/20 border-blue-500/30"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            Real-time Updates
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {updates.map((update) => (
            <div
              key={update.id}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getSeverityColor(update.severity)}`}>{getUpdateIcon(update.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{update.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getSeverityColor(update.severity)}`}>
                    {update.type}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatTimeAgo(update.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Summary */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{updates.filter((u) => u.type === "feedback").length}</div>
              <div className="text-xs text-gray-400">Feedback Updates</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {updates.filter((u) => u.severity === "warning").length}
              </div>
              <div className="text-xs text-gray-400">Alerts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
