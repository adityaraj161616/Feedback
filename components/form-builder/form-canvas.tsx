"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings,
  Eye,
  Type,
  Mail,
  Phone,
  Calendar,
  Hash,
  FileText,
  CheckSquare,
  Circle,
  Star,
  FileSlidersIcon as Slider,
} from "lucide-react"

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: any
}

interface FormCanvasProps {
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export function FormCanvas({ fields, onFieldsChange, onFieldSelect, selectedField }: FormCanvasProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newFields.length) {
      ;[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      onFieldsChange(newFields)
    }
  }

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index)
    onFieldsChange(newFields)
    if (selectedField && selectedField.id === fields[index].id) {
      onFieldSelect(null)
    }
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "number":
        return <Hash className="h-4 w-4" />
      case "date":
        return <Calendar className="h-4 w-4" />
      case "textarea":
        return <FileText className="h-4 w-4" />
      case "select":
        return <CheckSquare className="h-4 w-4" />
      case "radio":
        return <Circle className="h-4 w-4" />
      case "checkbox":
        return <CheckSquare className="h-4 w-4" />
      case "rating":
        return <Star className="h-4 w-4" />
      case "range":
        return <Slider className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "date":
        return (
          <Input type={field.type} placeholder={field.placeholder} disabled className="bg-white/5 border-white/20" />
        )
      case "textarea":
        return <Textarea placeholder={field.placeholder} disabled className="bg-white/5 border-white/20" />
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-white/5 border-white/20">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup disabled>
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                <Label htmlFor={`${field.id}-${idx}`} className="text-gray-300">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${idx}`} disabled />
                <Label htmlFor={`${field.id}-${idx}`} className="text-gray-300">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-gray-400" />
            ))}
          </div>
        )
      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              disabled
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        )
      default:
        return <Input placeholder={field.placeholder} disabled className="bg-white/5 border-white/20" />
    }
  }

  return (
    <Card className="bg-white/5 border-white/10 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Form Canvas</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No fields added yet</h3>
            <p className="text-sm">Drag fields from the palette to start building your form</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`
                  group relative p-4 rounded-lg border transition-all duration-200
                  ${
                    selectedField?.id === field.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }
                `}
                onClick={() => onFieldSelect(field)}
              >
                {/* Field Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-500/20 rounded">{getFieldIcon(field.type)}</div>
                    <span className="text-white font-medium">{field.label}</span>
                    {field.required && (
                      <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                        Required
                      </Badge>
                    )}
                  </div>

                  {!previewMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(index, "up")
                        }}
                        disabled={index === 0}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(index, "down")
                        }}
                        disabled={index === fields.length - 1}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFieldSelect(field)
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeField(index)
                        }}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Field Preview */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  {renderFieldPreview(field)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
