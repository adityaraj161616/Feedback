"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, Settings, BarChart3, FileText, Plus } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
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

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Forms", href: "/forms", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Create Form", href: "/form-builder", icon: Plus },
  ]

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              FeedbackPro
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:block">
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
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gray-900 border-gray-700 w-80">
                  <div className="flex flex-col h-full">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user?.image || ""}
                          alt={user?.name || user?.email || "User"}
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          {getInitials(user?.name, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        {user?.name && <p className="font-medium text-white">{user.name}</p>}
                        {user?.email && <p className="text-sm text-gray-400 truncate">{user.email}</p>}
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </nav>

                    {/* Sign Out */}
                    <div className="p-4 border-t border-gray-700">
                      <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
