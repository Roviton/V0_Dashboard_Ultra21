export interface AIModelConfig {
  provider: "openai" | "anthropic" | "google" | "mistral"
  model: string
  maxTokens?: number
  temperature?: number
  enabled: boolean
}

export interface AIServiceConfig {
  // General text generation
  textGeneration: {
    primary: AIModelConfig
    fallback?: AIModelConfig
  }
  // OCR and vision tasks
  vision: {
    primary: AIModelConfig
    fallback?: AIModelConfig
  }
}

export const defaultAIConfig: AIServiceConfig = {
  textGeneration: {
    primary: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      enabled: true,
    },
    fallback: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.7,
      enabled: true,
    },
  },
  vision: {
    primary: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.3,
      enabled: true,
    },
    fallback: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.3,
      enabled: true,
    },
  },
}
