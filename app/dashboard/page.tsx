"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentFeedback } from "@/components/dashboard/recent-feedback"
import { FeedbackChart } from "@/components/dashboard/feedback-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [feedbackData, setFeedbackData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard - Session status:", status)
    console.log("Dashboard - Session data:", session)

    if (status === "loading") {
      // Still loading, do nothing
      return
    }

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to sign in")
      router.push("/auth/signin?callbackUrl=/dashboard")
      return
    }

    if (status === "authenticated" && session) {
      console.log("User authenticated, setting up dashboard")

      // Dashboard entrance animations
      const tl = gsap.timeline()

      tl.fromTo(".dashboard-header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(
          ".stats-cards",
          { opacity: 0, y: 100, stagger: 0.1 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
          "-=0.4",
        )
        .fromTo(
          ".dashboard-content",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2",
        )

      // Fetch user's feedback data
      fetchFeedbackData()

      // Welcome message for users (only show once)
      if (!hasShownWelcome) {
        toast.success(`Welcome back, ${session.user?.name || "User"}!`)
        setHasShownWelcome(true)
      }
    }
  }, [status, session, router, hasShownWelcome])

  const fetchFeedbackData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/feedback/user")
      if (response.ok) {
        const data = await response.json()
        setFeedbackData(data)
      } else {
        console.error("Failed to fetch feedback data")
      }
    } catch (error) {
      console.error("Error fetching feedback data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-lg md:text-xl">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  // Show redirecting state
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-lg md:text-xl">Redirecting to sign in...</div>
        </div>
      </div>
    )
  }

  // Render dashboard for authenticated users
  if (status === "authenticated" && session) {
    return (
      <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="dashboard-header">
          <DashboardHeader user={session.user} />
        </div>

        <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Stats Cards */}
          <div className="stats-cards grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <StatsCards />
          </div>

          {/* Main Dashboard Content */}
          <div className="dashboard-content space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Mobile: Stack all components vertically */}
            <div className="block lg:hidden space-y-4 sm:space-y-6">
              <div className="w-full">
                <FeedbackChart data={feedbackData} />
              </div>
              <div className="w-full">
                <QuickActions />
              </div>
              <div className="w-full">
                <RecentFeedback />
              </div>
            </div>

            {/* Desktop: Two column layout */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {/* Left Column - Takes 2/3 of space */}
              <div className="lg:col-span-2 space-y-6 xl:space-y-8">
                <FeedbackChart data={feedbackData} />
                <RecentFeedback />
              </div>

              {/* Right Column - Takes 1/3 of space */}
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
