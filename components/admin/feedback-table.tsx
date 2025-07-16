"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
      item.responses?.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesSentiment = sentimentFilter === "all" || item.sentiment?.label?.toLowerCase() === sentimentFilter

    return matchesSearch && matchesStatus && matchesSentiment
  })

  const handleDelete = async (feedbackId: string) => {
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

  const getSentimentBadge = (sentiment: any) => {
    if (!sentiment) return <Badge variant="secondary">Unknown</Badge>

    const { label, score } = sentiment
    const variant = label === "Positive" ? "default" : label === "Negative" ? "destructive" : "secondary"

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <span>{sentiment.emoji || "😐"}</span>
        {label} ({(score * 100).toFixed(0)}%)
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "default",
      reviewed: "secondary",
      archived: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Feedback Management</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Status" />
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
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Sentiment" />
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
        <div className="rounded-md border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Feedback</TableHead>
                <TableHead className="text-gray-300">Sentiment</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-gray-300 font-mono text-xs">{item.id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-white max-w-xs">
                      <div className="truncate">
                        {item.responses?.feedback || item.responses?.comment || "No feedback text"}
                      </div>
                    </TableCell>
                    <TableCell>{getSentimentBadge(item.sentiment)}</TableCell>
                    <TableCell>{getStatusBadge(item.status || "new")}</TableCell>
                    <TableCell className="text-gray-300">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            className="text-white hover:bg-gray-700"
                            onClick={() => handleStatusUpdate(item.id, "reviewed")}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-white hover:bg-gray-700"
                            onClick={() => handleStatusUpdate(item.id, "archived")}
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-900/20"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredData.length} of {data.length} feedback entries
        </div>
      </CardContent>
    </Card>
  )
}
