"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, GripVertical, ChevronUp, ChevronDown, Settings } from "lucide-react"

interface FormField {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "email" | "number"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface FormCanvasProps {
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export function FormCanvas({ fields, onFieldsChange, onFieldSelect, selectedField }: FormCanvasProps) {
  const [draggedField, setDraggedField] = useState<string | null>(null)

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const currentIndex = fields.findIndex((f) => f.id === fieldId)
    if (currentIndex === -1) return

    const newFields = [...fields]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= fields.length) return // Swap fields
    ;[newFields[currentIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[currentIndex]]

    onFieldsChange(newFields)
  }

  const removeField = (fieldId: string) => {
    const newFields = fields.filter((f) => f.id !== fieldId)
    onFieldsChange(newFields)
    if (selectedField?.id === fieldId) {
      onFieldSelect(null)
    }
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const newFields = fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    onFieldsChange(newFields)
    if (selectedField?.id === fieldId) {
      onFieldSelect({ ...selectedField, ...updates })
    }
  }

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            type={field.type}
            disabled
            className="bg-gray-50"
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            disabled
            className="bg-gray-50"
            rows={3}
          />
        )
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" disabled className="text-blue-600" />
                <label className="text-sm text-gray-700">{option}</label>
              </div>
            ))}
          </div>
        )
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="text-blue-600" />
                <label className="text-sm text-gray-700">{option}</label>
              </div>
            ))}
          </div>
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" disabled className="text-gray-300 hover:text-yellow-400">
                ⭐
              </button>
            ))}
          </div>
        )
      default:
        return <div className="text-gray-500 italic">Unknown field type</div>
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Form Canvas
          <Badge variant="secondary">{fields.length} fields</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No fields yet</h3>
            <p className="text-sm">Drag fields from the palette to start building your form</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className={`group relative border rounded-lg p-4 transition-all ${
                selectedField?.id === field.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              } ${draggedField === field.id ? "opacity-50" : ""}`}
              onClick={() => onFieldSelect(field)}
            >
              {/* Field Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <Label className="font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveField(field.id, "up")
                    }}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveField(field.id, "down")
                    }}
                    disabled={index === fields.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFieldSelect(field)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeField(field.id)
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Field Preview */}
              <div className="space-y-2">{renderFieldPreview(field)}</div>

              {/* Field Info */}
              <div className="mt-2 text-xs text-gray-500">
                {field.placeholder && <div>Placeholder: {field.placeholder}</div>}
                {field.options && field.options.length > 0 && <div>Options: {field.options.join(", ")}</div>}
              </div>
            </div>
          ))
        )}

        {/* Quick Add Field */}
        {fields.length > 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Add more fields</p>
            <p className="text-xs text-gray-400">Drag from the field palette or click a field to configure</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
