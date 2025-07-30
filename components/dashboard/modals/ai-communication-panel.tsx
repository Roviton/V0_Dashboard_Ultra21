"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AICommunicationPanelProps {
  load: any
}

export function AICommunicationPanel({ load }: AICommunicationPanelProps) {
  const [brokerEmail, setBrokerEmail] = useState("")
  const [driverInstructions, setDriverInstructions] = useState("")
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false)
  const { toast } = useToast()

  const generateBrokerEmail = async () => {
    setIsGeneratingEmail(true)
    try {
      const response = await fetch("/api/ai/broker-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ load }),
      })

      if (!response.ok) throw new Error("Failed to generate email")

      const data = await response.json()
      setBrokerEmail(data.email)
      toast({
        title: "Email Generated",
        description: "Broker email has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate broker email.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const generateDriverInstructions = async () => {
    setIsGeneratingInstructions(true)
    try {
      const response = await fetch("/api/ai/driver-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ load }),
      })

      if (!response.ok) throw new Error("Failed to generate instructions")

      const data = await response.json()
      setDriverInstructions(data.instructions)
      toast({
        title: "Instructions Generated",
        description: "Driver instructions have been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate driver instructions.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInstructions(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: `${type} copied to clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">AI-Powered</Badge>
        <span className="text-sm text-muted-foreground">Generate communications for Load {load.id}</span>
      </div>

      {/* Broker Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Broker Email
          </CardTitle>
          <CardDescription>Generate a professional email to send to the broker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateBrokerEmail} disabled={isGeneratingEmail} className="w-full">
            {isGeneratingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Broker Email
              </>
            )}
          </Button>

          {brokerEmail && (
            <div className="space-y-2">
              <Textarea
                value={brokerEmail}
                onChange={(e) => setBrokerEmail(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(brokerEmail, "Broker email")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Driver Instructions
          </CardTitle>
          <CardDescription>Generate clear instructions for the assigned driver</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateDriverInstructions} disabled={isGeneratingInstructions} className="w-full">
            {isGeneratingInstructions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Driver Instructions
              </>
            )}
          </Button>

          {driverInstructions && (
            <div className="space-y-2">
              <Textarea
                value={driverInstructions}
                onChange={(e) => setDriverInstructions(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(driverInstructions, "Driver instructions")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Instructions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
