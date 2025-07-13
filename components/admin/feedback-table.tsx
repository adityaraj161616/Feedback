"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, MoreHorizontal, Eye, Trash2, Star, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface FeedbackItem {
  id: string
  formTitle: string
  submittedAt: string
  sentiment: "positive" | "neutral" | "negative"
  rating?: number
  message: string
  userEmail?: string
  status: "new" | "reviewed" | "archived"
}

interface FeedbackTableProps {
  data: FeedbackItem[]
  onUpdate: () => void
}

export function FeedbackTable({ data, onUpdate }: FeedbackTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSentiment, setFilterSentiment] = useState<string>("all")

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesSentiment = filterSentiment === "all" || item.sentiment === filterSentiment

    return matchesSearch && matchesStatus && matchesSentiment
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "reviewed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "archived":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success("Feedback status updated")
        onUpdate()
      } else {
        toast.error("Failed to update feedback status")
      }
    } catch (error) {
      console.error("Error updating feedback:", error)
      toast.error("Error updating feedback status")
    }
  }

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Feedback deleted")
        onUpdate()
      } else {
        toast.error("Failed to delete feedback")
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast.error("Error deleting feedback")
    }
  }

  const exportData = () => {
    const csv = [
      ["Form Title", "Submitted At", "Sentiment", "Rating", "Message", "User Email", "Status"],
      ...filteredData.map((item) => [
        item.formTitle,
        item.submittedAt,
        item.sentiment,
        item.rating || "",
        item.message,
        item.userEmail || "",
        item.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "feedback-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Feedback</CardTitle>
          <Button
            onClick={exportData}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Status: {filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-white/20">
              <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-white hover:bg-white/10">
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("new")} className="text-white hover:bg-white/10">
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("reviewed")} className="text-white hover:bg-white/10">
                Reviewed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("archived")} className="text-white hover:bg-white/10">
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Sentiment: {filterSentiment}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-white/20">
              <DropdownMenuItem onClick={() => setFilterSentiment("all")} className="text-white hover:bg-white/10">
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterSentiment("positive")} className="text-white hover:bg-white/10">
                Positive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterSentiment("neutral")} className="text-white hover:bg-white/10">
                Neutral
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterSentiment("negative")} className="text-white hover:bg-white/10">
                Negative
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">Form</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Sentiment</TableHead>
                <TableHead className="text-gray-300">Rating</TableHead>
                <TableHead className="text-gray-300">Message</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    No feedback found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{item.formTitle}</TableCell>
                    <TableCell className="text-gray-300">{new Date(item.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {item.rating ? (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {item.rating}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs">
                      <div className="truncate" title={item.message}>
                        {item.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-white/20">
                          <DropdownMenuItem
                            onClick={() => updateFeedbackStatus(item.id, "reviewed")}
                            className="text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateFeedbackStatus(item.id, "archived")}
                            className="text-white hover:bg-white/10"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteFeedback(item.id)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
