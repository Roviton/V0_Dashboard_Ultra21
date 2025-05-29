"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "dispatcher" | "admin" | "manager" | "accountant"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
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

// Sample users for demonstration
const sampleUsers = [
  {
    id: "1",
    name: "John Dispatcher",
    email: "dispatcher@example.com",
    password: "password",
    role: "dispatcher" as UserRole,
    avatar: "/javascript-code.png",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@example.com",
    password: "password",
    role: "admin" as UserRole,
    avatar: "/stylized-letters-sj.png",
  },
  {
    id: "3",
    name: "Manager User",
    email: "manager@example.com",
    password: "password",
    role: "manager" as UserRole,
    avatar: "/intertwined-letters.png",
  },
  {
    id: "4",
    name: "Accountant User",
    email: "accountant@example.com",
    password: "password",
    role: "accountant" as UserRole,
    avatar: "/abstract-geometric-TD.png",
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
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Handle initial redirection based on user role
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const path = window.location.pathname
      if (user.role === "admin" && path === "/dashboard") {
        window.location.href = "/dashboard/admin"
      }
    }
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = sampleUsers.find((u) => u.email === email && u.password === password)

      if (!foundUser) {
        throw new Error("Invalid credentials")
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const hasPermission = (permission: string) => {
    if (!user) return false

    const userPermissions = rolePermissions[user.role]

    // Admin has all permissions
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
