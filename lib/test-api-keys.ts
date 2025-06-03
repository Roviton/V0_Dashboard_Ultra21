import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function testAPIKeys() {
  const results = {
    openai: false,
    anthropic: false,
    errors: [] as string[],
  }

  // Test OpenAI
  try {
    if (!process.env.OPENAI_API_KEY) {
      results.errors.push("OPENAI_API_KEY environment variable is not set")
    } else {
      await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: "Hello",
        maxTokens: 5,
      })
      results.openai = true
    }
  } catch (error: any) {
    results.errors.push(`OpenAI API Error: ${error.message}`)
  }

  // Test Anthropic
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      results.errors.push("ANTHROPIC_API_KEY environment variable is not set")
    } else {
      await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt: "Hello",
        maxTokens: 5,
      })
      results.anthropic = true
    }
  } catch (error: any) {
    results.errors.push(`Anthropic API Error: ${error.message}`)
  }

  return results
}
