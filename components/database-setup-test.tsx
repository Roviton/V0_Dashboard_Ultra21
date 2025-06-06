"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseSetupTest() {
  const [status, setStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testDatabaseOperations = async () => {
    setIsLoading(true)
    setStatus("Testing database operations...")

    try {
      // Test 1: Check if companies table exists
      setStatus("Checking if tables exist...")
      const { data: companies, error: companiesError } = await supabase.from("companies").select("*").limit(1)

      if (companiesError) {
        if (companiesError.code === "42P01") {
          setStatus("❌ Tables not found. You need to run the SQL scripts first.")
          return
        }
        throw companiesError
      }

      setStatus("✅ Tables exist! Testing data operations...")

      // Test 2: Try to insert a test company (if none exist)
      if (!companies || companies.length === 0) {
        const { error: insertError } = await supabase.from("companies").insert({
          name: "Test Company",
          email: "test@example.com",
        })

        if (insertError) throw insertError
        setStatus("✅ Successfully created test data!")
      } else {
        setStatus("✅ Database is ready with existing data!")
      }
    } catch (error: any) {
      console.error("Database test error:", error)
      setStatus(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Setup Test</CardTitle>
        <CardDescription>Test if your database schema is properly set up</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDatabaseOperations} disabled={isLoading} className="w-full">
          {isLoading ? "Testing..." : "Test Database Setup"}
        </Button>

        {status && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">{status}</p>
          </div>
        )}

        {status.includes("❌ Tables not found") && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Next Steps:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase Dashboard</li>
              <li>Click on "SQL Editor"</li>
              <li>Run the SQL scripts I provided earlier in order</li>
              <li>Come back and test again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
