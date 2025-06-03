import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { mistral } from "@ai-sdk/mistral"
import type { AIServiceConfig, AIModelConfig } from "./ai-config"
import { defaultAIConfig } from "./ai-config"

export class AIServiceManager {
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
      case "google":
        return google(model)
      case "mistral":
        return mistral(model)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  async generateText(
    prompt: string,
    taskType: "textGeneration" | "analysis" | "communication" = "textGeneration",
    options?: {
      temperature?: number
      maxTokens?: number
      useFallback?: boolean
    },
  ) {
    let modelConfig: AIModelConfig

    if (taskType === "textGeneration") {
      modelConfig =
        options?.useFallback && this.config.textGeneration.fallback
          ? this.config.textGeneration.fallback
          : this.config.textGeneration.primary
    } else {
      modelConfig = this.config[taskType]
    }

    if (!modelConfig.enabled) {
      throw new Error(`${taskType} model is disabled`)
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
      if (!options?.useFallback && taskType === "textGeneration" && this.config.textGeneration.fallback) {
        return this.generateText(prompt, taskType, { ...options, useFallback: true })
      }

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

    let modelConfig: AIModelConfig

    if (configKey === "vision") {
      modelConfig =
        options?.useFallback && this.config.vision.fallback ? this.config.vision.fallback : this.config.vision.primary
    } else {
      modelConfig =
        options?.useFallback && this.config.textGeneration.fallback
          ? this.config.textGeneration.fallback
          : this.config.textGeneration.primary
    }

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

      throw error
    }
  }

  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig() {
    return this.config
  }
}

// Global instance
export const aiService = new AIServiceManager()
