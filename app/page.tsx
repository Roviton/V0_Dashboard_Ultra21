"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      // Only redirect once auth status is known
      if (user) {
        if (pathname !== "/dashboard") {
          // Avoid redirect if already on dashboard (less likely for root)
          router.push("/dashboard")
        }
      } else {
        if (pathname !== "/login") {
          // Avoid redirect if already on login
          router.push("/login")
        }
      }
    }
  }, [user, loading, router, pathname])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold">Loading your experience...</p>
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  )
}
