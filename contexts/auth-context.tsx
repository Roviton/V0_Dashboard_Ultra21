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

    // Check for Supabase session first
    const checkSupabaseSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("📦 Found Supabase session:", session.user.id)

        // Get user profile from database
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile && !error) {
          const authenticatedUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar_url || undefined,
            companyId: profile.company_id,
          }

          console.log("✅ Supabase user authenticated:", authenticatedUser.role)
          setUser(authenticatedUser)
          setIsLoading(false)
          return
        }
      }

      // Fallback to localStorage for demo users
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log("📦 Found stored demo user:", parsedUser)

          if (parsedUser && parsedUser.companyId && ["admin", "dispatcher"].includes(parsedUser.role)) {
            console.log("✅ Valid demo user found:", parsedUser.role)
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
    }

    checkSupabaseSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        // Get user profile from database
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile && !error) {
          const authenticatedUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar_url || undefined,
            companyId: profile.company_id,
          }

          console.log("✅ User signed in:", authenticatedUser.role)
          setUser(authenticatedUser)
          localStorage.removeItem("user") // Clear demo user if any
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out")
        setUser(null)
        localStorage.removeItem("user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    console.log("🔐 Login attempt for:", email)
    setIsLoading(true)

    try {
      // Try sample users first for MVP demo
      const foundSampleUser = sampleUsers.find((u) => u.email === email)
      if (foundSampleUser && password === "password") {
        console.log("✅ Found sample user:", foundSampleUser)
        setUser(foundSampleUser)
        localStorage.setItem("user", JSON.stringify(foundSampleUser))
        setIsLoading(false)
        return
      }

      // Real Supabase authentication for production users
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error("Invalid email or password")
      }

      if (!authData.user) {
        throw new Error("Authentication failed")
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error("User profile not found. Please contact support.")
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

      console.log("✅ Real user authenticated:", authenticatedUser.role)
      setUser(authenticatedUser)
      localStorage.removeItem("user") // Clear any demo user data
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    console.log("🚪 Logging out...")
    setUser(null)
    localStorage.removeItem("user")
    await supabase.auth.signOut()

    // Redirect to the official sign-in page
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin"
    }
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
