"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Truck } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Confirming your account...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")
        console.log("URL search params:", searchParams.toString())
        console.log("URL hash:", window.location.hash)
        console.log("Full URL:", window.location.href)

        // Check if there are any hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const type = hashParams.get("type")
        const error = hashParams.get("error")

        console.log("Hash parameters:", {
          accessToken: accessToken ? "present" : "missing",
          refreshToken: refreshToken ? "present" : "missing",
          type,
          error,
        })

        // If there's an error in the URL
        if (error) {
          console.error("❌ URL contains error:", error)
          setStatus("error")
          setMessage(`Confirmation failed: ${error}. Please try again or contact support.`)
          return
        }

        // If no tokens in hash, check if user is already signed in
        if (!accessToken && !refreshToken) {
          console.log("🔍 No tokens in URL, checking existing session...")
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

          if (sessionError || !sessionData.session) {
            console.log("❌ No existing session found")
            setStatus("error")
            setMessage("No confirmation tokens found. Please try clicking the email link again or sign in manually.")
            return
          }

          console.log("✅ Found existing session")
          const user = sessionData.session.user

          // Check user profile
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select(`
              id, name, email, role, company_id, is_active,
              companies(id, name)
            `)
            .eq("id", user.id)
            .single()

          if (profile && !profileError) {
            setStatus("success")
            setMessage("Account confirmed successfully! Redirecting to your dashboard...")

            setTimeout(() => {
              if (profile.role === "admin") {
                router.push("/dashboard/admin")
              } else {
                router.push("/dashboard")
              }
            }, 2000)
            return
          }
        }

        // If we have tokens, try to set the session
        if (accessToken && refreshToken) {
          console.log("🔑 Setting session with tokens...")
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("❌ Session error:", sessionError)
            setStatus("error")
            setMessage("Failed to confirm your account. Please try again or contact support.")
            return
          }

          if (!data.session?.user) {
            console.error("❌ No user in session")
            setStatus("error")
            setMessage("No valid session found. Please try signing in again.")
            return
          }

          const user = data.session.user
          console.log("✅ User session created:", user.email)

          // Small delay to ensure database operations are complete
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Check if user profile exists in database
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select(`
              id, name, email, role, company_id, is_active,
              companies(id, name)
            `)
            .eq("id", user.id)
            .single()

          if (profile && !profileError) {
            // Profile exists, redirect to dashboard
            console.log("✅ User profile found:", profile)
            setStatus("success")
            setMessage("Account confirmed successfully! Redirecting to your dashboard...")

            setTimeout(() => {
              if (profile.role === "admin") {
                router.push("/dashboard/admin")
              } else {
                router.push("/dashboard")
              }
            }, 2000)
          } else {
            console.error("❌ Profile lookup error:", profileError)
            setStatus("error")
            setMessage(
              "Account confirmed but profile lookup failed. Please try signing in manually or contact support.",
            )
          }
        } else {
          // No tokens and no existing session
          console.log("❌ No authentication tokens found")
          setStatus("error")
          setMessage("No confirmation tokens found. Please try clicking the email link again.")
        }
      } catch (error) {
        console.error("❌ Callback processing error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during confirmation. Please try again.")
      }
    }

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(handleAuthCallback, 500)
    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          {/* Ultra21 Branding */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-black text-gray-900">
                Ultra<span className="text-blue-600 font-extrabold">21</span>
              </div>
              <div className="text-xs text-gray-600 font-medium tracking-wide">Freight Solutions</div>
            </div>
          </div>

          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
            {status === "success" && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === "error" && <XCircle className="h-8 w-8 text-red-600" />}
          </div>

          <CardTitle className="text-xl">
            {status === "loading" && "Confirming Account"}
            {status === "success" && "Success!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={() => router.push("/auth/signin")} className="w-full">
                Go to Sign In
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/register/company")} className="w-full">
                Register Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
