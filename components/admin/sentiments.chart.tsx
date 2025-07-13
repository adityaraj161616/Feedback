"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SentimentChartProps {
  data: any[]
}

export function SentimentChart({ data }: SentimentChartProps) {
  // Calculate sentiment distribution
  const sentimentCounts = data.reduce(
    (acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 },
  )

  const total = data.length
  const positivePercentage = total > 0 ? (sentimentCounts.positive / total) * 100 : 0
  const neutralPercentage = total > 0 ? (sentimentCounts.neutral / total) * 100 : 0
  const negativePercentage = total > 0 ? (sentimentCounts.negative / total) * 100 : 0

  const sentimentData = [
    {
      label: "Positive",
      count: sentimentCounts.positive,
      percentage: positivePercentage,
      color: "bg-green-500",
      icon: TrendingUp,
      textColor: "text-green-400",
    },
    {
      label: "Neutral",
      count: sentimentCounts.neutral,
      percentage: neutralPercentage,
      color: "bg-gray-500",
      icon: Minus,
      textColor: "text-gray-400",
    },
    {
      label: "Negative",
      count: sentimentCounts.negative,
      percentage: negativePercentage,
      color: "bg-red-500",
      icon: TrendingDown,
      textColor: "text-red-400",
    },
  ]

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Sentiment Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Overall Sentiment Distribution</span>
              <span>{total} total responses</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full flex">
                <div className="bg-green-500 transition-all duration-500" style={{ width: `${positivePercentage}%` }} />
                <div className="bg-gray-500 transition-all duration-500" style={{ width: `${neutralPercentage}%` }} />
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${negativePercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {sentimentData.map((sentiment) => {
              const Icon = sentiment.icon
              return (
                <div key={sentiment.label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className={`h-5 w-5 ${sentiment.textColor}`} />
                  </div>
                  <div className={`text-2xl font-bold ${sentiment.textColor}`}>{sentiment.count}</div>
                  <div className="text-sm text-gray-400">{sentiment.label}</div>
                  <div className="text-xs text-gray-500">{sentiment.percentage.toFixed(1)}%</div>
                </div>
              )
            })}
          </div>

          {/* Trend Indicator */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Sentiment Trend</span>
              <div className="flex items-center space-x-2">
                {positivePercentage > negativePercentage ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Positive Trend</span>
                  </>
                ) : positivePercentage < negativePercentage ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Negative Trend</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Neutral Trend</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
