"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, GripVertical, Settings, Star } from "lucide-react"

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  settings?: any
}

interface FormCanvasProps {
  formTitle: string
  formDescription: string
  onDescriptionChange: (description: string) => void
  fields: FormField[]
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
  onReorderFields: (startIndex: number, endIndex: number) => void
}

export function FormCanvas({
  formTitle,
  formDescription,
  onDescriptionChange,
  fields,
  onUpdateField,
  onDeleteField,
  onReorderFields,
}: FormCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const renderField = (field: FormField, index: number) => {
    return (
      <SortableFieldItem
        key={field.id}
        field={field}
        index={index}
        onUpdate={(updates) => onUpdateField(field.id, updates)}
        onDelete={() => onDeleteField(field.id)}
      />
    )
  }

  return (
    <div ref={canvasRef} className="max-w-4xl mx-auto">
      {/* Form Header */}
      <Card className="mb-6 md:mb-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
        <CardContent className="p-4 md:p-6">
          <div className="text-xl md:text-2xl font-bold text-white mb-4">{formTitle}</div>
          <Textarea
            value={formDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="bg-transparent border-none text-gray-300 p-0 resize-none focus:ring-0 text-sm md:text-base"
            placeholder="Add a description for your form..."
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-3 md:space-y-4">
        {fields.length === 0 ? (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-gray-400 text-base md:text-lg mb-2">No fields added yet</div>
              <div className="text-gray-500 text-sm">
                <span className="md:hidden">Tap the menu button to add fields</span>
                <span className="hidden md:inline">
                  Add fields from the palette on the left to start building your form
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => renderField(field, index))
        )}
      </div>
    </div>
  )
}

function SortableFieldItem({
  field,
  index,
  onUpdate,
  onDelete,
}: {
  field: FormField
  index: number
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
}) {
  const renderFieldPreview = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder || "Enter your response..."}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            disabled
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your detailed response..."}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            rows={3}
            disabled
          />
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 cursor-pointer hover:fill-current" />
            ))}
          </div>
        )
      case "emoji":
        return (
          <div className="flex space-x-2">
            {["😢", "😐", "😊", "😍", "🤩"].map((emoji, index) => (
              <button
                key={index}
                className="text-xl md:text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors"
                disabled
              >
                {emoji}
              </button>
            ))}
          </div>
        )
      case "select":
        return (
          <select
            className="w-full p-2 md:p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
            disabled
          >
            <option>Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case "file":
        return (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 md:p-8 text-center">
            <div className="text-gray-400 text-sm md:text-base">Click to upload or drag and drop</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card
      data-field-id={field.id}
      className="group cursor-pointer transition-all duration-200 bg-white/5 border-white/10 hover:border-white/20"
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <button className="text-gray-400 hover:text-white cursor-pointer">
                <GripVertical className="h-3 w-3 md:h-4 md:w-4" />
              </button>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="bg-transparent border-none text-white font-medium p-0 focus:ring-0 text-sm md:text-base"
                placeholder="Field Label"
                onClick={(e) => e.stopPropagation()}
              />
              {field.required && <span className="text-red-400 text-sm">*</span>}
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1 md:p-2">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-red-400 p-1 md:p-2"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300 text-sm md:text-base">{field.label}</Label>
          {renderFieldPreview()}
        </div>
      </CardContent>
    </Card>
  )
}
