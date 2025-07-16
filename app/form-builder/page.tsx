"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { gsap } from "gsap"
import { FormBuilderHeader } from "@/components/form-builder/form-builder-header"
import { FieldPalette } from "@/components/form-builder/field-palette"
import { FormCanvas } from "@/components/form-builder/form-canvas"
import { FormPreview } from "@/components/form-builder/form-preview"
import { FormSettingsModal } from "@/components/form-builder/form-settings-modal"
import { ShareModal } from "@/components/form-builder/share-modal"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu, Eye } from "lucide-react"
import { toast } from "sonner"

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  settings?: any
}

interface FormSettings {
  submitMessage?: string
  redirectUrl?: string
  allowMultipleSubmissions?: boolean
  requireAuth?: boolean
  theme?: string
  collectEmail?: boolean
  allowAnonymous?: boolean
}

export interface FormConfig {
  id?: string
  title: string
  description: string
  fields: FormField[]
  settings: FormSettings
}

export default function FormBuilderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editFormId = searchParams.get("id")
  const pageRef = useRef<HTMLDivElement>(null)

  const [formId, setFormId] = useState<string>("")
  const [formTitle, setFormTitle] = useState("Untitled Form")
  const [formDescription, setFormDescription] = useState("")
  const [fields, setFields] = useState<FormField[]>([])
  const [settings, setSettings] = useState<FormSettings>({
    submitMessage: "Submit Feedback",
    redirectUrl: "",
    allowMultipleSubmissions: true,
    requireAuth: false,
    theme: "modern",
    collectEmail: false,
    allowAnonymous: true,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const formConfig: FormConfig = {
    id: formId || editFormId || `form_${Date.now()}`,
    title: formTitle,
    description: formDescription,
    fields,
    settings,
  }

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/form-builder")
      return
    }

    if (status === "authenticated") {
      if (editFormId) {
        setFormId(editFormId)
        loadFormForEditing(editFormId)
      } else {
        // Generate a new form ID for new forms
        const newFormId = `form_${Date.now()}`
        setFormId(newFormId)
      }

      // Page entrance animation
      gsap.fromTo(
        ".form-builder-content",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 },
      )
    }
  }, [status, router, editFormId])

  const loadFormForEditing = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/edit`)
      if (response.ok) {
        const formData = await response.json()
        setFormTitle(formData.title || "Untitled Form")
        setFormDescription(formData.description || "")
        setFields(formData.fields || [])
        setSettings({
          submitMessage: "Submit Feedback",
          redirectUrl: "",
          allowMultipleSubmissions: true,
          requireAuth: false,
          theme: "modern",
          collectEmail: false,
          allowAnonymous: true,
          ...formData.settings,
        })
        setHasUnsavedChanges(false)
      } else {
        toast.error("Failed to load form for editing")
        router.push("/forms")
      }
    } catch (error) {
      console.error("Error loading form:", error)
      toast.error("Error loading form")
      router.push("/forms")
    }
  }

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      required: false,
      settings: {},
    }

    if (fieldType === "select") {
      newField.options = ["Option 1", "Option 2", "Option 3"]
    }

    setFields([...fields, newField])
    setHasUnsavedChanges(true)
    setSidebarOpen(false) // Close sidebar on mobile after adding field
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
    setHasUnsavedChanges(true)
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId))
    setHasUnsavedChanges(true)
  }

  const reorderFields = (startIndex: number, endIndex: number) => {
    const result = Array.from(fields)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    setFields(result)
    setHasUnsavedChanges(true)
  }

  const updateFormConfig = (updates: Partial<FormConfig>) => {
    if (updates.title !== undefined) {
      setFormTitle(updates.title)
    }
    if (updates.description !== undefined) {
      setFormDescription(updates.description)
    }
    if (updates.fields !== undefined) {
      setFields(updates.fields)
    }
    if (updates.settings !== undefined) {
      setSettings({ ...settings, ...updates.settings })
    }
    setHasUnsavedChanges(true)
  }

  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast.error("Please enter a form title")
      return
    }

    setIsSaving(true)

    try {
      const currentFormId = formId || editFormId || `form_${Date.now()}`

      const formData = {
        id: currentFormId,
        title: formTitle,
        description: formDescription,
        fields,
        settings,
        isActive: true,
        userId: session?.user?.id,
      }

      const response = await fetch("/api/forms", {
        method: editFormId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const savedForm = await response.json()
        if (!formId && savedForm.id) {
          setFormId(savedForm.id)
        }
        setHasUnsavedChanges(false)
        toast.success(editFormId ? "Form updated successfully!" : "Form created successfully!")
      } else {
        toast.error("Failed to save form")
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast.error("Error saving form")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading form builder...</div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Redirecting to sign in...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <FormBuilderHeader
        user={session.user}
        formTitle={formTitle}
        onTitleChange={(title) => {
          setFormTitle(title)
          setHasUnsavedChanges(true)
        }}
        onSave={saveForm}
        onPreview={() => setShowPreview(true)}
        onShare={() => setShowShare(true)}
        onSettings={() => setShowSettings(true)}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="form-builder-content flex h-[calc(100vh-64px)]">
        {/* Mobile Sidebar Toggle - Fixed positioning */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-20 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-gray-900 border-gray-800 p-0 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Add Fields</h2>
            </div>
            <FieldPalette onAddField={addField} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm">
          <FieldPalette onAddField={addField} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Preview Button */}
          <div className="md:hidden p-4 border-b border-white/10">
            <Button
              onClick={() => setShowPreview(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Form
            </Button>
          </div>

          {/* Form Canvas */}
          <div className="p-4 md:p-8">
            <FormCanvas
              formTitle={formTitle}
              formDescription={formDescription}
              onDescriptionChange={(desc) => {
                setFormDescription(desc)
                setHasUnsavedChanges(true)
              }}
              fields={fields}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              onReorderFields={reorderFields}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh] bg-gray-900 border-gray-800 p-0">
          <DialogHeader className="p-6 border-b border-gray-800">
            <DialogTitle className="text-white text-xl">Form Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <FormPreview formConfig={formConfig} fullscreen={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <FormSettingsModal formConfig={formConfig} onUpdateFormConfig={updateFormConfig}>
        <Button variant="ghost" className="hidden" onClick={() => setShowSettings(true)}>
          Settings
        </Button>
      </FormSettingsModal>

      {/* Share Modal */}
      <ShareModal formConfig={formConfig}>
        <Button variant="ghost" className="hidden" onClick={() => setShowShare(true)}>
          Share
        </Button>
      </ShareModal>
    </div>
  )
}
