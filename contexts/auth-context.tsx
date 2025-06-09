"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "dispatcher" | "admin" | "manager" | "accountant"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string // This is what our components expect
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users with EXACT company_id from your database
const sampleUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as UserRole,
    avatar: "/stylized-letters-sj.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000", // Using the exact company_id from your DB
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "John Dispatcher",
    email: "dispatcher@example.com",
    role: "dispatcher" as UserRole,
    avatar: "/javascript-code.png",
    companyId: "550e8400-e29b-41d4-a716-446655440000", // Using the exact company_id from your DB
  },
]

// Permission mapping
const rolePermissions: Record<UserRole, string[]> = {
  dispatcher: [
    "view:loads",
    "assign:drivers",
    "comment:loads",
    "view:drivers",
    "message:drivers",
    "view:customers",
    "view:basic_reports",
    "edit:personal_settings",
  ],
  admin: ["*"], // All permissions
  manager: [
    "view:loads",
    "edit:loads",
    "delete:loads",
    "view:drivers",
    "edit:drivers",
    "view:customers",
    "edit:customers",
    "view:reports",
    "edit:settings",
    "view:financial",
  ],
  accountant: ["view:loads", "view:drivers", "view:customers", "view:reports", "view:financial", "edit:financial"],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    console.log("🔍 AuthProvider: Checking for existing session...")
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("📦 Found stored user:", parsedUser)

        // Ensure the user has companyId
        if (parsedUser && parsedUser.companyId) {
          console.log("✅ User has companyId:", parsedUser.companyId)
          setUser(parsedUser)
        } else {
          console.log("❌ Stored user missing companyId, clearing...")
          localStorage.removeItem("user")
        }
      } catch (e) {
        console.error("❌ Failed to parse stored user:", e)
        localStorage.removeItem("user")
      }
    } else {
      console.log("📭 No stored user found")
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    console.log("🔐 Login attempt for:", email)
    setIsLoading(true)

    try {
      // Try sample users first for demo
      const foundSampleUser = sampleUsers.find((u) => u.email === email)
      if (foundSampleUser) {
        console.log("✅ Found sample user:", foundSampleUser)

        if (!foundSampleUser.companyId) {
          throw new Error("Sample user missing company information")
        }

        setUser(foundSampleUser)
        localStorage.setItem("user", JSON.stringify(foundSampleUser))
        console.log("💾 Saved sample user to localStorage")
        return
      }

      // Fallback to Supabase authentication
      console.log("🔍 Trying Supabase authentication...")
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Supabase auth failed:", authError)
        throw new Error("Invalid credentials")
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (profileError || !profile) {
        console.error("❌ Profile fetch failed:", profileError)
        throw new Error("User profile not found")
      }

      if (!profile.company_id) {
        console.error("❌ User profile missing company_id")
        throw new Error("User account is not associated with a company")
      }

      const authenticatedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url || undefined,
        companyId: profile.company_id, // Convert snake_case to camelCase
      }

      console.log("✅ Supabase user authenticated:", authenticatedUser)
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
