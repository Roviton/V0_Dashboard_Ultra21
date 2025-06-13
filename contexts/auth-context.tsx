"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "dispatcher"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isDispatcher: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users for MVP testing
const sampleUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as UserRole,
    avatar: "/stylized-letters-sj.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "John Dispatcher",
    email: "dispatcher@example.com",
    role: "dispatcher" as UserRole,
    avatar: "/javascript-code.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Sarah Dispatcher",
    email: "dispatcher2@example.com",
    role: "dispatcher" as UserRole,
    avatar: "/emergency-dispatcher.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
]

// Simplified permission mapping for MVP
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "*", // All permissions
  ],
  dispatcher: [
    "view:loads",
    "create:loads",
    "edit:loads",
    "assign:drivers",
    "view:drivers",
    "view:customers",
    "comment:loads",
    "view:basic_reports",
    "edit:personal_profile",
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 AuthProvider: Checking for existing session...")
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("📦 Found stored user:", parsedUser)

        if (parsedUser && parsedUser.companyId && ["admin", "dispatcher"].includes(parsedUser.role)) {
          console.log("✅ Valid user found:", parsedUser.role)
          setUser(parsedUser)
        } else {
          console.log("❌ Invalid stored user, clearing...")
          localStorage.removeItem("user")
        }
      } catch (e) {
        console.error("❌ Failed to parse stored user:", e)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    console.log("🔐 Login attempt for:", email)
    setIsLoading(true)

    try {
      // Try sample users first for MVP demo
      const foundSampleUser = sampleUsers.find((u) => u.email === email)
      if (foundSampleUser) {
        console.log("✅ Found sample user:", foundSampleUser)
        setUser(foundSampleUser)
        localStorage.setItem("user", JSON.stringify(foundSampleUser))
        return
      }

      // Fallback to Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error("Invalid credentials")
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (profileError || !profile) {
        throw new Error("User profile not found")
      }

      if (!profile.company_id) {
        throw new Error("User account is not associated with a company")
      }

      if (!["admin", "dispatcher"].includes(profile.role)) {
        throw new Error("Invalid user role for this system")
      }

      const authenticatedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url || undefined,
        companyId: profile.company_id,
      }

      setUser(authenticatedUser)
      localStorage.setItem("user", JSON.stringify(authenticatedUser))
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("🚪 Logging out...")
    setUser(null)
    localStorage.removeItem("user")
    supabase.auth.signOut()
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    const userPermissions = rolePermissions[user.role]
    if (userPermissions.includes("*")) return true
    return userPermissions.includes(permission)
  }

  const isAdmin = () => user?.role === "admin"
  const isDispatcher = () => user?.role === "dispatcher"

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, isAdmin, isDispatcher }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
