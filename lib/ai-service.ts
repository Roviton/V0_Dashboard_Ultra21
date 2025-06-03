import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import type { AIServiceConfig, AIModelConfig } from "./ai-config"
import { defaultAIConfig } from "./ai-config"

export class AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig = defaultAIConfig) {
    this.config = config
  }

  private getModel(modelConfig: AIModelConfig) {
    const { provider, model } = modelConfig

    switch (provider) {
      case "openai":
        return openai(model)
      case "anthropic":
        return anthropic(model)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  async generateText(
    prompt: string,
    options?: {
      temperature?: number
      maxTokens?: number
      useFallback?: boolean
    },
  ) {
    const modelConfig =
      options?.useFallback && this.config.textGeneration.fallback
        ? this.config.textGeneration.fallback
        : this.config.textGeneration.primary

    if (!modelConfig.enabled) {
      throw new Error(`Text generation model is disabled`)
    }

    try {
      const model = this.getModel(modelConfig)

      const { text } = await generateText({
        model,
        prompt,
        temperature: options?.temperature ?? modelConfig.temperature,
        maxTokens: options?.maxTokens ?? modelConfig.maxTokens,
      })

      return { success: true, text, provider: modelConfig.provider }
    } catch (error) {
      // Try fallback if available and not already using it
      if (!options?.useFallback && this.config.textGeneration.fallback) {
        return this.generateText(prompt, { ...options, useFallback: true })
      }

      console.error("AI text generation error:", error)
      throw error
    }
  }

  async generateStructuredData<T>(
    prompt: string,
    schema: any,
    imageUrl?: string,
    options?: {
      temperature?: number
      maxTokens?: number
      useFallback?: boolean
    },
  ) {
    const isVisionTask = !!imageUrl
    const configKey = isVisionTask ? "vision" : "textGeneration"

    const modelConfig =
      options?.useFallback && this.config[configKey].fallback
        ? this.config[configKey].fallback
        : this.config[configKey].primary

    if (!modelConfig.enabled) {
      throw new Error(`${configKey} model is disabled`)
    }

    try {
      const model = this.getModel(modelConfig)

      const messages = [
        {
          role: "user" as const,
          content: imageUrl
            ? [
                { type: "text" as const, text: prompt },
                { type: "image" as const, image: imageUrl },
              ]
            : prompt,
        },
      ]

      const { object } = await generateObject({
        model,
        schema,
        messages,
        temperature: options?.temperature ?? modelConfig.temperature,
        maxTokens: options?.maxTokens ?? modelConfig.maxTokens,
      })

      return { success: true, data: object, provider: modelConfig.provider }
    } catch (error) {
      // Try fallback if available and not already using it
      if (!options?.useFallback && this.config[configKey].fallback) {
        return this.generateStructuredData<T>(prompt, schema, imageUrl, { ...options, useFallback: true })
      }

      console.error("AI structured data generation error:", error)
      throw error
    }
  }
}

// Global instance
export const aiService = new AIService()

// Convenience function for broker email generation
export async function generateBrokerEmail(loadDetails: any) {
  const prompt = `Generate a professional email to the broker about load ${loadDetails.id}. 
  The load is currently ${loadDetails.status} and scheduled for delivery on ${loadDetails.deliveryDate}.
  Include any relevant details about the driver, current location, and estimated arrival time.
  Use a professional but friendly tone appropriate for logistics industry communication.`

  return aiService.generateText(prompt, { temperature: 0.5 })
}
