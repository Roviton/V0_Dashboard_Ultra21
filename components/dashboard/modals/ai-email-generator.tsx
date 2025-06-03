"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Send, Copy, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Load } from "@/components/dashboard/loads-data-table"

interface AIEmailGeneratorProps {
  load: Load
  onSave: (content: string) => void
}

export function AIEmailGenerator({ load, onSave }: AIEmailGeneratorProps) {
  const [emailContent, setEmailContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const generateEmail = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loadDetails: load }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate email")
      }

      const data = await response.json()
      setEmailContent(data.emailContent)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent)
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard",
    })
  }

  const handleSave = () => {
    onSave(emailContent)
    toast({
      title: "Saved!",
      description: "Email content saved successfully",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">AI-Generated Broker Email</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} className="min-h-[200px]" />
        ) : (
          <div className="rounded-md border bg-muted/30 p-4 min-h-[200px] whitespace-pre-line">
            {emailContent || "Click 'Generate Email' to create a professional email for this load."}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={generateEmail} disabled={isGenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Email"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!emailContent}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={!emailContent}>
            <Send className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
