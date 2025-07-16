"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare, TrendingUp, Users, RefreshCw } from "lucide-react"

interface RealtimeUpdate {
  id: string
  type: "feedback" | "form" | "user"
  message: string
  timestamp: Date
  severity: "info" | "warning" | "success"
}

export function RealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const updateTypes = [
        {
          type: "feedback" as const,
          messages: [
            "New feedback received on Product Survey",
            "Negative feedback alert on Customer Service Form",
            "High satisfaction score on Website Feedback",
          ],
          severity: "info" as const,
        },
        {
          type: "form" as const,
          messages: [
            "Form 'User Experience Survey' published",
            "Form analytics updated",
            "New form created: 'Event Feedback'",
          ],
          severity: "success" as const,
        },
        {
          type: "user" as const,
          messages: ["New user registered", "User upgraded to premium", "User exported feedback data"],
          severity: "info" as const,
        },
      ]

      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)]

      const newUpdate: RealtimeUpdate = {
        id: Date.now().toString(),
        type: randomType.type,
        message: randomMessage,
        timestamp: new Date(),
        severity: randomType.severity,
      }

      setUpdates((prev) => [newUpdate, ...prev.slice(0, 9)]) // Keep only 10 latest
    }, 5000) // Update every 5 seconds

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4" />
      case "form":
        return <TrendingUp className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "info":
      default:
        return "outline"
    }
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-time Updates
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.length > 0 ? (
            updates.map((update) => (
              <div key={update.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">{getIcon(update.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(update.severity)} className="text-xs">
                      {update.type}
                    </Badge>
                    <span className="text-xs text-gray-400">{update.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{update.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-400 text-sm">Waiting for updates...</p>
            </div>
          )}
        </div>

        {updates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setUpdates([])}
            >
              Clear All Updates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
