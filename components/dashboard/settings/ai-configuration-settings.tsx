"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Brain, Eye, MessageSquare, BarChart3 } from "lucide-react"
import type { AIServiceConfig } from "@/lib/ai-config"

export function AIConfigurationSettings() {
  const [config, setConfig] = useState<AIServiceConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/ai/config")
      const data = await response.json()
      setConfig(data.config)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load AI configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "AI configuration saved successfully",
        })
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !config) {
    return <div>Loading AI configuration...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Service Configuration
          </CardTitle>
          <CardDescription>
            Configure different AI models for specific tasks to optimize performance and costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Generation Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-lg font-medium">Text Generation</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Model</Label>
                <Select
                  value={`${config.textGeneration.primary.provider}:${config.textGeneration.primary.model}`}
                  onValueChange={(value) => {
                    const [provider, model] = value.split(":")
                    setConfig({
                      ...config,
                      textGeneration: {
                        ...config.textGeneration,
                        primary: { ...config.textGeneration.primary, provider: provider as any, model },
                      },
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai:gpt-4o">GPT-4o (OpenAI)</SelectItem>
                    <SelectItem value="openai:gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                    <SelectItem value="anthropic:claude-3-haiku-20240307">Claude 3 Haiku (Anthropic)</SelectItem>
                    <SelectItem value="mistral:mistral-large-latest">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fallback Model</Label>
                <Select
                  value={
                    config.textGeneration.fallback
                      ? `${config.textGeneration.fallback.provider}:${config.textGeneration.fallback.model}`
                      : "none"
                  }
                  onValueChange={(value) => {
                    if (value === "none") {
                      setConfig({
                        ...config,
                        textGeneration: { ...config.textGeneration, fallback: undefined },
                      })
                    } else {
                      const [provider, model] = value.split(":")
                      setConfig({
                        ...config,
                        textGeneration: {
                          ...config.textGeneration,
                          fallback: { provider: provider as any, model, enabled: true, temperature: 0.7 },
                        },
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Fallback</SelectItem>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                    <SelectItem value="mistral:mistral-large-latest">Mistral Large</SelectItem>
                    <SelectItem value="openai:gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Text Generation</Label>
              <Switch
                checked={config.textGeneration.primary.enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    textGeneration: {
                      ...config.textGeneration,
                      primary: { ...config.textGeneration.primary, enabled: checked },
                    },
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Vision/OCR Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <h3 className="text-lg font-medium">Vision & OCR Processing</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Vision Model</Label>
                <Select
                  value={`${config.vision.primary.provider}:${config.vision.primary.model}`}
                  onValueChange={(value) => {
                    const [provider, model] = value.split(":")
                    setConfig({
                      ...config,
                      vision: {
                        ...config.vision,
                        primary: { ...config.vision.primary, provider: provider as any, model },
                      },
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai:gpt-4o">GPT-4o Vision (OpenAI)</SelectItem>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">
                      Claude 3.5 Sonnet Vision (Anthropic)
                    </SelectItem>
                    <SelectItem value="google:gemini-1.5-pro">Gemini 1.5 Pro (Google)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fallback Vision Model</Label>
                <Select
                  value={
                    config.vision.fallback
                      ? `${config.vision.fallback.provider}:${config.vision.fallback.model}`
                      : "none"
                  }
                  onValueChange={(value) => {
                    if (value === "none") {
                      setConfig({
                        ...config,
                        vision: { ...config.vision, fallback: undefined },
                      })
                    } else {
                      const [provider, model] = value.split(":")
                      setConfig({
                        ...config,
                        vision: {
                          ...config.vision,
                          fallback: { provider: provider as any, model, enabled: true, temperature: 0.3 },
                        },
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Fallback</SelectItem>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">
                      Claude 3.5 Sonnet Vision (Anthropic)
                    </SelectItem>
                    <SelectItem value="google:gemini-1.5-pro">Gemini 1.5 Pro (Google)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Enable Vision Processing</Label>
              <Switch
                checked={config.vision.primary.enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    vision: {
                      ...config.vision,
                      primary: { ...config.vision.primary, enabled: checked },
                    },
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Specialized Models */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <h3 className="text-lg font-medium">Specialized Models</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Analysis Model</Label>
                <Select
                  value={`${config.analysis.provider}:${config.analysis.model}`}
                  onValueChange={(value) => {
                    const [provider, model] = value.split(":")
                    setConfig({
                      ...config,
                      analysis: { ...config.analysis, provider: provider as any, model },
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai:gpt-4o">GPT-4o (OpenAI)</SelectItem>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                    <SelectItem value="mistral:mistral-large-latest">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Communication Model</Label>
                <Select
                  value={`${config.communication.provider}:${config.communication.model}`}
                  onValueChange={(value) => {
                    const [provider, model] = value.split(":")
                    setConfig({
                      ...config,
                      communication: { ...config.communication, provider: provider as any, model },
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic:claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                    <SelectItem value="openai:gpt-4o">GPT-4o (OpenAI)</SelectItem>
                    <SelectItem value="mistral:mistral-large-latest">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveConfig} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>High-frequency tasks:</strong> Use cost-effective models like Mistral Large or GPT-3.5 Turbo
            </p>
            <p>
              <strong>Customer communications:</strong> Use premium models like GPT-4o or Claude 3.5 Sonnet
            </p>
            <p>
              <strong>OCR processing:</strong> GPT-4o Vision for accuracy, Gemini 1.5 Pro for volume
            </p>
            <p>
              <strong>Fallback models:</strong> Ensure reliability without doubling costs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
