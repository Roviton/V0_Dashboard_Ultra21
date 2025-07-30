"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Info } from "lucide-react"

export function SupabaseTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing Supabase connection...")

      // Simple test - just try to get the current session
      const { data: session, error } = await supabase.auth.getSession()

      if (error && error.message !== "Invalid JWT") {
        throw error
      }

      // If we get here, connection is working
      setStatus("success")
      setMessage("✅ Supabase connection successful!")
    } catch (error: any) {
      console.error("Connection test failed:", error)
      setStatus("error")
      setMessage(`❌ Connection failed: ${error.message || "Unknown error"}`)
    }
  }

  // Check if environment variables are set
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Test</CardTitle>
          <CardDescription>Simple connection test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment check */}
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              {hasUrl ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Supabase URL: {hasUrl ? "Set" : "Missing"}</span>
            </div>
            <div className="flex items-center gap-2">
              {hasKey ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Supabase Key: {hasKey ? "Set" : "Missing"}</span>
            </div>
          </div>

          {/* Test results */}
          {status === "loading" && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{message}</span>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Ready</AlertTitle>
              <AlertDescription>Click test to check your Supabase connection</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={!hasUrl || !hasKey || status === "loading"} className="w-full">
            {status === "loading" ? "Testing..." : "Test Connection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
