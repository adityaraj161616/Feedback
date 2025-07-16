"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Star, Send, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface FormField {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "email" | "number" | "emoji"
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

interface Form {
  id: string
  title: string
  description: string
  fields: FormField[]
  userId: string
  isActive: boolean
  settings?: {
    allowAnonymous?: boolean
    requireAuth?: boolean
    collectEmail?: boolean
    thankYouMessage?: string
    redirectUrl?: string
  }
}

export default function FeedbackFormPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    if (formId) {
      fetchForm()
    }
  }, [formId])

  const fetchForm = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching form:", formId)
      const response = await fetch(`/api/forms/${formId}`)

      if (response.ok) {
        const formData = await response.json()
        console.log("Form data received:", formData)
        setForm(formData)
      } else {
        const errorData = await response.json()
        console.error("Frontend: Form fetch failed:", response.status, errorData)
        if (response.status === 403) {
          setError("This form is currently inactive")
        } else if (response.status === 404) {
          setError("Form not found")
        } else {
          setError("Failed to load form")
        }
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      setError("Network error - please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form) return

    // Validate required fields
    const missingFields = form.fields
      .filter((field) => field.required && !responses[field.id])
      .map((field) => field.label)

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(", ")}`)
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: form.id,
          responses,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success("Feedback submitted successfully!")

        // Redirect if specified
        if (form.settings?.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl!
          }, 2000)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Network error - please try again")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = responses[field.id] || ""

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        )

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option} className="text-white hover:bg-gray-700">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "radio":
        return (
          <RadioGroup value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} className="border-white/20" />
                <Label htmlFor={`${field.id}-${index}`} className="text-white">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange(field.id, [...checkboxValues, option])
                    } else {
                      handleInputChange(
                        field.id,
                        checkboxValues.filter((v: string) => v !== option),
                      )
                    }
                  }}
                  className="border-white/20"
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-white">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "rating":
        const rating = Number(value) || 0
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange(field.id, star)}
                className={`p-1 transition-colors ${
                  star <= rating ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
        )

      case "emoji":
        const emojis = ["😢", "😐", "😊", "😍", "🤩"]
        const emojiLabels = ["Very Sad", "Neutral", "Happy", "Love It", "Amazing"]
        return (
          <div className="flex flex-wrap gap-3">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInputChange(field.id, emoji)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  value === emoji
                    ? "bg-purple-500/30 scale-110 border-2 border-purple-400"
                    : "bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/20"
                }`}
                title={emojiLabels[index]}
              >
                <span className="text-3xl mb-1">{emoji}</span>
                <span className="text-xs text-gray-300">{emojiLabels[index]}</span>
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <div className="text-white text-xl">Loading form...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchForm} className="bg-purple-500 hover:bg-purple-600">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-gray-400 mb-6">
              {form?.settings?.thankYouMessage || "Your feedback has been submitted successfully."}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Form Not Found</h2>
            <p className="text-gray-400 mb-4">The requested form could not be found.</p>
            <Link href="/">
              <Button className="bg-purple-500 hover:bg-purple-600">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-gray-300 text-base">{form.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-white font-medium text-base">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 text-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">Powered by FeedbackPro</p>
        </div>
      </div>
    </div>
  )
}
