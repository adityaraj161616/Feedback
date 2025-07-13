"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, Trash2, Archive, CheckCircle, Clock } from "lucide-react"

interface FeedbackTableProps {
  data: any[]
  onUpdate: () => void
}

export function FeedbackTable({ data, onUpdate }: FeedbackTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.responses || {})
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesSentiment = sentimentFilter === "all" || item.sentiment?.label?.toLowerCase() === sentimentFilter

    return matchesSearch && matchesStatus && matchesSentiment
  })

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating feedback status:", error)
    }
  }

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
    }
  }

  const getSentimentBadge = (sentiment: any) => {
    if (!sentiment) return <Badge variant="secondary">Unknown</Badge>

    const label = sentiment.label?.toLowerCase()
    switch (label) {
      case "positive":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Positive</Badge>
      case "negative":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Negative</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Neutral</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reviewed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "archived":
        return <Archive className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Feedback Management</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white">
                All Status
              </SelectItem>
              <SelectItem value="new" className="text-white">
                New
              </SelectItem>
              <SelectItem value="reviewed" className="text-white">
                Reviewed
              </SelectItem>
              <SelectItem value="archived" className="text-white">
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white">
                All Sentiment
              </SelectItem>
              <SelectItem value="positive" className="text-white">
                Positive
              </SelectItem>
              <SelectItem value="neutral" className="text-white">
                Neutral
              </SelectItem>
              <SelectItem value="negative" className="text-white">
                Negative
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Form</TableHead>
                <TableHead className="text-gray-300">Sentiment</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((feedback) => (
                  <TableRow key={feedback.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white font-mono text-sm">{feedback.id?.substring(0, 8)}...</TableCell>
                    <TableCell className="text-gray-300">{feedback.formId?.substring(0, 8)}...</TableCell>
                    <TableCell>{getSentimentBadge(feedback.sentiment)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(feedback.status || "new")}
                        <span className="text-gray-300 capitalize">{feedback.status || "new"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={feedback.status || "new"}
                          onValueChange={(value) => handleStatusUpdate(feedback.id, value)}
                        >
                          <SelectTrigger className="h-8 w-24 bg-white/10 border-white/20 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="new" className="text-white">
                              New
                            </SelectItem>
                            <SelectItem value="reviewed" className="text-white">
                              Reviewed
                            </SelectItem>
                            <SelectItem value="archived" className="text-white">
                              Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(feedback.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No feedback found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <span>
            Showing {filteredData.length} of {data.length} feedback entries
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Positive: {data.filter((f) => f.sentiment?.label?.toLowerCase() === "positive").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Neutral: {data.filter((f) => f.sentiment?.label?.toLowerCase() === "neutral").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Negative: {data.filter((f) => f.sentiment?.label?.toLowerCase() === "negative").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
