"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Star, Smartphone, Monitor } from "lucide-react"
import type { FormConfig } from "@/app/form-builder/page"

interface FormPreviewProps {
  formConfig: FormConfig
  fullscreen?: boolean
}

export function FormPreview({ formConfig, fullscreen = false }: FormPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const [responses, setResponses] = useState<Record<string, any>>({})

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
  }

  const renderField = (field: any) => {
    const value = responses[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter your response..."}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter your detailed response..."}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            rows={3}
          />
        )

      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer transition-colors ${
                  star <= (value || 0) ? "text-yellow-400 fill-current" : "text-gray-600 hover:text-yellow-400"
                }`}
                onClick={() => handleFieldChange(field.id, star)}
              />
            ))}
          </div>
        )

      case "emoji":
        const emojis = ["😢", "😐", "😊", "😍", "🤩"]
        return (
          <div className="flex space-x-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  value === index ? "bg-purple-500/30 scale-110" : "hover:bg-white/10"
                }`}
                onClick={() => handleFieldChange(field.id, index)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="" className="bg-gray-800">
              Select an option...
            </option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option} className="bg-gray-800">
                {option}
              </option>
            ))}
          </select>
        )

      case "file":
        return (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer">
            <input type="file" className="hidden" />
            <div className="text-gray-400">Click to upload or drag and drop</div>
            <div className="text-sm text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</div>
          </div>
        )

      default:
        return null
    }
  }

  // Provide default values if formConfig is undefined
  const title = formConfig?.title || "Untitled Form"
  const description = formConfig?.description || ""
  const fields = formConfig?.fields || []
  const settings = formConfig?.settings || {}

  return (
    <div className={`${fullscreen ? "p-4 md:p-8" : "p-6"} h-full overflow-y-auto`}>
      {/* Preview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          <p className="text-sm text-gray-400">See how your form will look to users</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === "desktop" ? "default" : "ghost"}
            onClick={() => setViewMode("desktop")}
            className="h-8 px-3"
          >
            <Monitor className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Desktop</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === "mobile" ? "default" : "ghost"}
            onClick={() => setViewMode("mobile")}
            className="h-8 px-3"
          >
            <Smartphone className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Mobile</span>
          </Button>
        </div>
      </div>

      {/* Form Preview */}
      <div className={`mx-auto transition-all duration-300 ${viewMode === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">{title}</CardTitle>
            {description && <p className="text-gray-300">{description}</p>}
          </CardHeader>

          <CardContent className="space-y-6">
            {fields.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No fields to preview</div>
                <div className="text-gray-500 text-sm">Add fields from the palette to see the preview</div>
              </div>
            ) : (
              fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label className="text-gray-300">{field.label}</Label>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {renderField(field)}
                </div>
              ))
            )}

            {fields.length > 0 && (
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                {settings.submitMessage || "Submit Feedback"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preview Stats */}
        {fields.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <div>
              Form has {fields.length} field{fields.length !== 1 ? "s" : ""}
            </div>
            <div>
              Estimated completion time: {Math.ceil(fields.length * 0.5)} minute
              {Math.ceil(fields.length * 0.5) !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
