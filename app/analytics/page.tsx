"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ExportModal } from "@/components/export/export-modal"
import { AiInsights } from "@/components/analytics/ai-insights"
import { WordCloud } from "@/components/analytics/word-cloud"
import { SentimentHeatmap } from "@/components/analytics/sentiment-heatmap"
import {
  TrendingUp,
  MessageSquare,
  Star,
  Download,
  RefreshCw,
  BarChart3,
  Brain,
  Target,
  Calendar,
  Users,
  ThumbsUp,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import type { AnalyticsData } from "@/lib/types"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchForms()
      fetchAnalytics()
    } else if (status === "unauthenticated") {
      setError("Please sign in to view analytics")
      setLoading(false)
    }
  }, [session?.user?.id, selectedForm, status])

  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/forms?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      } else {
        console.error("Failed to fetch forms:", response.status)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
    }
  }

  const fetchAnalytics = async () => {
    if (!session?.user?.id) return

    try {
      setRefreshing(true)
      setError(null)
      const url = `/api/analytics?userId=${session.user.id}&formId=${selectedForm}`
      console.log("Fetching analytics from:", url)

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log("Analytics data received:", data)
        setAnalytics(data)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch analytics:", response.status, errorData)
        setError(errorData.error || "Failed to load analytics")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-x-hidden">
        <DashboardHeader user={session?.user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
              <div className="text-white text-lg md:text-xl">Loading analytics...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-x-hidden">
        <DashboardHeader user={session?.user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4">Error Loading Analytics</h2>
            <p className="text-blue-200 text-sm md:text-base mb-6">{error}</p>
            <Button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-x-hidden">
        <DashboardHeader user={session?.user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4">No Analytics Data</h2>
            <p className="text-blue-200 text-sm md:text-base">Start collecting feedback to see analytics.</p>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"]

  const pieChartData = [
    { name: "Positive", value: analytics.sentimentDistribution.Positive, color: "#10B981" },
    { name: "Neutral", value: analytics.sentimentDistribution.Neutral, color: "#F59E0B" },
    { name: "Negative", value: analytics.sentimentDistribution.Negative, color: "#EF4444" },
  ].filter((item) => item.value > 0)

  // Generate trend data from analytics
  const trendData = analytics.feedbackTrends.slice(-6).map((item, index) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
    responses: item.count,
    sentiment: analytics.sentimentTrends[index]?.averageScore * 5 || 3.0,
  }))

  const performanceData = [
    {
      metric: "Response Rate",
      value: Math.min(100, (analytics.overview.totalFeedback / Math.max(forms.length, 1)) * 20),
      target: 80,
    },
    { metric: "Completion Rate", value: 92, target: 90 },
    { metric: "Satisfaction", value: Math.round(analytics.overview.averageSentimentScore * 100), target: 85 },
    { metric: "Active Forms", value: Math.min(100, analytics.overview.activeForms * 25), target: 50 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-4 md:left-20 w-48 h-48 md:w-72 md:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-4 md:right-20 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <DashboardHeader user={session?.user} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-blue-400" />
              Analytics Dashboard
            </h1>
            <p className="text-blue-200 text-sm md:text-base">Comprehensive insights into your feedback data</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">
                  All Forms
                </SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id || form._id} value={form.id || form._id} className="text-white">
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex-1 sm:flex-none bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                onClick={() => setShowExportModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="bg-white/10 border border-white/20 grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm">
              <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm">
              <Brain className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/30 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-200">Total Feedback</CardTitle>
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold text-white">{analytics.overview.totalFeedback}</div>
                  <p className="text-xs text-blue-300">Across all forms</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-200">Avg Sentiment</CardTitle>
                  <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold text-white">
                    {(analytics.overview.averageSentimentScore * 5).toFixed(1)}
                  </div>
                  <p className="text-xs text-blue-300">Out of 5.0</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-200">Response Rate</CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold text-white">
                    {Math.round((analytics.overview.totalFeedback / Math.max(forms.length, 1)) * 20)}%
                  </div>
                  <p className="text-xs text-green-300">Engagement rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-200">Active Forms</CardTitle>
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold text-white">{analytics.overview.activeForms}</div>
                  <p className="text-xs text-purple-300">Currently active</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    Sentiment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No sentiment data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Word Cloud */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Popular Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WordCloud analytics={analytics} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Trends */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Response Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="responses"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sentiment Trends */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Sentiment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sentiment"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      No sentiment trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Heatmap */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Sentiment Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentHeatmap analytics={analytics} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <AiInsights analytics={analytics} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="metric" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" />
                      <Bar dataKey="target" fill="#10B981" opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Key Performance Indicators */}
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">{item.metric}</span>
                        <span className="text-white font-semibold">{Math.round(item.value)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.value >= item.target ? "bg-green-500" : "bg-yellow-500"}`}
                          style={{ width: `${Math.min(item.value, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        Target: {item.target}% |
                        {item.value >= item.target ? (
                          <span className="text-green-400 ml-1">✓ On track</span>
                        ) : (
                          <span className="text-yellow-400 ml-1">⚠ Below target</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} analyticsData={analytics} />}
    </div>
  )
}
