"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface APIKeyStatus {
  openai: boolean
  anthropic: boolean
  errors: string[]
}

export function APIKeyStatus() {
  const [status, setStatus] = useState<APIKeyStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAPIKeys = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/test-keys")
      const data = await response.json()

      if (data.success) {
        setStatus(data.results)
      } else {
        setError(data.error || "Failed to check API keys")
      }
    } catch (err: any) {
      setError(err.message || "Failed to check API keys")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAPIKeys()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Key Status
          <Button variant="outline" size="sm" onClick={checkAPIKeys} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>Check if your AI service API keys are properly configured</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">OpenAI API</span>
              <Badge variant={status.openai ? "default" : "destructive"}>
                {status.openai ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {status.openai ? "Connected" : "Not Connected"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Anthropic API</span>
              <Badge variant={status.anthropic ? "default" : "destructive"}>
                {status.anthropic ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {status.anthropic ? "Connected" : "Not Connected"}
              </Badge>
            </div>

            {status.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Issues Found:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {status.errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="h-3 w-3 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {status.openai && status.anthropic && status.errors.length === 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  All API keys are properly configured! You can now test the AI features.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
