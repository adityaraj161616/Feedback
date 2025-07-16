"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Save, Eye, Share2, Settings, ArrowLeft, User, LogOut, Menu } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface FormBuilderHeaderProps {
  user: any
  formTitle: string
  onTitleChange: (title: string) => void
  onSave: () => void
  onPreview: () => void
  onShare: () => void
  onSettings: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function FormBuilderHeader({
  user,
  formTitle,
  onTitleChange,
  onSave,
  onPreview,
  onShare,
  onSettings,
  isSaving,
  hasUnsavedChanges,
}: FormBuilderHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Link href="/forms">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Forms</span>
              </Button>
            </Link>

            {/* Form Title - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Input
                value={formTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-w-[200px]"
                placeholder="Untitled Form"
              />
              {hasUnsavedChanges && <Badge variant="secondary">Unsaved</Badge>}
            </div>
          </div>

          {/* Form Title - Mobile (below header) */}
          <div className="md:hidden absolute top-16 left-0 right-0 p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Input
                value={formTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1"
                placeholder="Untitled Form"
              />
              {hasUnsavedChanges && <Badge variant="secondary">Unsaved</Badge>}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSettings}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onPreview()
                      setMobileMenuOpen(false)
                    }}
                    className="border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onShare()
                      setMobileMenuOpen(false)
                    }}
                    className="border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSettings()
                      setMobileMenuOpen(false)
                    }}
                    className="border-white/20 text-white hover:bg-white/10 justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={() => {
                      onSave()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 justify-start"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || user?.email || "User"}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium">
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || user?.email || "User"}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium text-white">{user.name}</p>}
                    {user?.email && <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
