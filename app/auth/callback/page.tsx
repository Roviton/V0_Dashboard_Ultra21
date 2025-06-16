"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Truck } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Confirming your account...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")

        // Handle the auth callback from URL hash
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Auth callback error:", error)
          setStatus("error")
          setMessage("Failed to confirm your account. Please try again or contact support.")
          return
        }

        if (!data.session?.user) {
          console.log("❌ No session found")
          setStatus("error")
          setMessage("No valid session found. Please try signing in again.")
          return
        }

        const user = data.session.user
        console.log("✅ User session found:", user.email)

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
          console.log("✅ User profile found, redirecting...")
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
          // Profile doesn't exist - this is a critical issue
          console.error("❌ Profile not found for confirmed user:", user.id)
          console.log("User metadata:", user.user_metadata)

          const userMetadata = user.user_metadata
          if (userMetadata?.company_name && userMetadata?.full_name) {
            // This looks like a registration callback but profile creation failed
            setStatus("error")
            setMessage(
              "Account confirmation incomplete. Profile creation failed during registration. Please contact support or try registering again.",
            )
          } else {
            // No metadata, something went wrong
            setStatus("error")
            setMessage("Account confirmation incomplete. Please try registering again or contact support.")
          }
        }
      } catch (error) {
        console.error("❌ Callback processing error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during confirmation. Please try again.")
      }
    }

    handleAuthCallback()
  }, [router])

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
