"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [tables, setTables] = useState<string[]>([])

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing connection to Supabase...")

      // Simple query to test the connection
      const { data, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

      if (error) throw error

      setTables(data.map((row) => row.tablename))
      setStatus("success")
      setMessage("Successfully connected to Supabase!")
    } catch (error) {
      console.error("Supabase connection error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to connect to Supabase")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test the connection to your Supabase project</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && (
          <p className="text-muted-foreground">Click the button below to test your Supabase connection.</p>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>{message}</p>
          </div>
        )}

        {status === "success" && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              {message}
              {tables.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Available tables:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {tables.map((table) => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>
              {message}
              <p className="mt-2">Please check your environment variables and make sure they are correctly set.</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
