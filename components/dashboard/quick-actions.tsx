"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Download, Share2, Settings, Zap } from "lucide-react"

const actions = [
  {
    title: "Create New Form",
    description: "Build a custom feedback form",
    icon: Plus,
    color: "from-purple-500 to-blue-500",
    action: () => (window.location.href = "/form-builder"),
  },
  {
    title: "View Analytics",
    description: "Detailed insights and reports",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    action: () => (window.location.href = "/analytics"),
  },
  {
    title: "Export Data",
    description: "Download feedback as CSV",
    icon: Download,
    color: "from-blue-500 to-cyan-500",
    action: () => console.log("Export data"),
  },
  {
    title: "Share Forms",
    description: "Get shareable links",
    icon: Share2,
    color: "from-pink-500 to-rose-500",
    action: () => console.log("Share forms"),
  },
]

export function QuickActions() {
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate action buttons
    gsap.fromTo(
      ".action-button",
      { opacity: 0, scale: 0.8, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)", delay: 1 },
    )
  }, [])

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 min-w-0">
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
        <CardTitle className="text-white flex items-center text-base sm:text-lg">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
          <span className="truncate">Quick Actions</span>
        </CardTitle>
        <CardDescription className="text-gray-400 text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent ref={actionsRef} className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.action}
            className={`action-button w-full justify-start h-auto p-3 sm:p-4 bg-gradient-to-r ${action.color} hover:opacity-90 transition-all duration-200 group min-w-0`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                <action.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-white text-xs sm:text-sm truncate">{action.title}</div>
                <div className="text-xs text-white/80 truncate hidden sm:block">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}

        <div className="pt-3 sm:pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent text-xs sm:text-sm h-auto py-2 sm:py-3"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Settings & Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
