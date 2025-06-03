import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { AI_MODELS } from "./ai-config"

// Schemas for structured data extraction
export const billOfLadingSchema = z.object({
  loadNumber: z.string().optional(),
  shipper: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  consignee: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  commodity: z.string().optional(),
  weight: z.number().optional(),
  pieces: z.number().optional(),
  rate: z.number().optional(),
  specialInstructions: z.string().optional(),
})

export type BillOfLadingData = z.infer<typeof billOfLadingSchema>

// Test API key connectivity
export async function testAPIKeys() {
  const results = {
    openai: false,
    anthropic: false,
    errors: {} as Record<string, string>,
  }

  // Test OpenAI
  try {
    await generateText({
      model: openai(AI_MODELS.OPENAI_GPT4O),
      prompt: 'Say "API key working" if you can read this.',
      maxTokens: 10,
    })
    results.openai = true
  } catch (error) {
    results.errors.openai = error instanceof Error ? error.message : "Unknown error"
  }

  // Test Anthropic
  try {
    await generateText({
      model: anthropic(AI_MODELS.ANTHROPIC_CLAUDE),
      prompt: 'Say "API key working" if you can read this.',
      maxTokens: 10,
    })
    results.anthropic = true
  } catch (error) {
    results.errors.anthropic = error instanceof Error ? error.message : "Unknown error"
  }

  return results
}

// Generate broker email - Updated to correctly identify broker vs carrier
export async function generateBrokerEmail(loadDetails: any) {
  try {
    // Determine who is the broker (usually the "BILL TO" company)
    const brokerName = loadDetails.broker?.name || loadDetails.consignee?.name || "there"
    const brokerEmail = loadDetails.broker?.email || loadDetails.consignee?.email || "broker@example.com"
    const driverName = loadDetails.driver?.name || "our driver"

    const { text } = await generateText({
      model: openai(AI_MODELS.OPENAI_GPT4O),
      prompt: `Generate a personalized, concise email to the broker following this exact format:

To: ${brokerEmail}
Subject: Load ${loadDetails.loadNumber || "L-XXXX"} - Driver Departed from Pickup

Hello ${brokerName.split(" ")[0] || "there"},

I wanted to update you on load ${loadDetails.loadNumber || "L-XXXX"}. Our driver ${driverName} has successfully completed pickup and is now en route to the delivery destination.

Current Status: En Route
Pickup Completed: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Estimated Delivery: ${loadDetails.deliveryDate || "TBD"}
Route: ${loadDetails.pickupLocation?.address || loadDetails.origin?.address || "Pickup Location"}, ${loadDetails.pickupLocation?.city || loadDetails.origin?.city || ""} ${loadDetails.pickupLocation?.state || loadDetails.origin?.state || ""} → ${loadDetails.deliveryLocation?.address || loadDetails.destination?.address || "Delivery Location"}, ${loadDetails.deliveryLocation?.city || loadDetails.destination?.city || ""} ${loadDetails.deliveryLocation?.state || loadDetails.destination?.state || ""}

The load is secure and we're tracking progress in real-time. I'll send another update when the driver arrives at the delivery location.

Best regards,
Forward Strong LLC Dispatch
`,
      maxTokens: 400,
    })

    return { success: true, content: text }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Generate driver instructions - Updated to use correct pickup/delivery locations
export async function generateDriverInstructions(loadDetails: any) {
  try {
    const { text } = await generateText({
      model: openai(AI_MODELS.OPENAI_GPT4O),
      prompt: `Create concise, practical driver instructions focusing ONLY on the most relevant information:

LOAD: ${loadDetails.loadNumber || "N/A"}

PICKUP INFORMATION:
- Location: ${loadDetails.pickupLocation?.address || loadDetails.origin?.address || "Pickup Location"}
- Special Instructions: ${loadDetails.specialInstructions || "Standard pickup procedures"}

DELIVERY INFORMATION:
- Location: ${loadDetails.deliveryLocation?.address || loadDetails.destination?.address || "Delivery Location"}
- Special Instructions: ${loadDetails.specialInstructions || "Standard delivery procedures"}

LOAD DETAILS:
- Commodity: ${loadDetails.commodity || "Vehicle"}
- VIN (if applicable): ${loadDetails.vin || "See BOL"}
- Special Handling: ${loadDetails.specialInstructions || "Follow standard procedures"}

IMPORTANT REMINDERS:
- Complete vehicle inspection at pickup and delivery
- Take photos of any existing damage
- Secure vehicle properly for transport

Keep it brief, practical, and driver-focused with correct pickup/delivery locations.`,
      maxTokens: 500,
    })

    return { success: true, content: text }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Extracts bill of lading data from an image or PDF using AI
 */
export async function extractBillOfLadingData(dataUrl: string) {
  try {
    // Check if it's a PDF data URL
    const isPdf = dataUrl.startsWith("data:application/pdf")

    if (isPdf) {
      // For PDFs, we need to use text-based extraction since AI vision models don't support PDFs
      // We'll use a text-only approach
      const { text } = await generateText({
        model: openai(AI_MODELS.OPENAI_GPT4O),
        prompt: `I have a PDF document that contains freight information like a bill of lading or rate confirmation. 
        Since I cannot directly process the PDF, please help me understand what information I should extract manually and provide a template JSON structure.

        The document should contain information about:
        - Load number
        - Carrier company (with MC number)
        - Broker/shipper company (BILL TO)
        - Pickup location (ORIGIN)
        - Delivery location (DESTINATION)
        - Commodity details
        - Driver information
        - Rates and special instructions

        Please provide a JSON template with null values that I can fill in manually:`,
        maxTokens: 500,
      })

      return {
        success: false,
        error:
          "PDF processing requires manual data entry. Please convert the PDF to an image (screenshot) for automatic extraction, or enter the data manually.",
        rawResponse: text,
        isPdfError: true,
      }
    } else {
      // Handle image files normally
      const { text } = await generateText({
        model: openai(AI_MODELS.OPENAI_GPT4O),
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that extracts structured data from freight documents like bills of lading, invoices, and rate confirmations.

IMPORTANT: Understand the document structure:
- The company at the top (with MC number) is usually the CARRIER/FREIGHT COMPANY
- The "BILL TO" company is usually the BROKER/SHIPPER
- "ORIGIN" and "DESTINATION" are the actual pickup and delivery locations (different from company addresses)
- Driver names are usually mentioned separately from company names

Extract all relevant information and return it as a JSON object with the following structure:
{
  "loadNumber": "string",
  "pickupDate": "YYYY-MM-DD",
  "deliveryDate": "YYYY-MM-DD",
  "carrier": {
    "name": "string (company with MC number)",
    "address": "string",
    "city": "string", 
    "state": "string",
    "zip": "string",
    "mcNumber": "string",
    "phone": "string",
    "email": "string"
  },
  "broker": {
    "name": "string (BILL TO company)",
    "address": "string",
    "city": "string",
    "state": "string", 
    "zip": "string",
    "phone": "string",
    "email": "string"
  },
  "pickupLocation": {
    "address": "string (ORIGIN address)",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "deliveryLocation": {
    "address": "string (DESTINATION address)", 
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "commodity": "string",
  "vin": "string (if vehicle)",
  "weight": "number in pounds",
  "rate": "number in USD",
  "driver": {
    "name": "string (driver name, not company)",
    "phone": "string"
  },
  "specialInstructions": "string"
}

If you can't find a specific field, use null. Return ONLY the JSON object, no other text.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image",
                image: dataUrl,
              },
              {
                type: "text",
                text: "Extract all freight information from this document. Pay special attention to distinguishing between carrier, broker, pickup location, and delivery location.",
              },
            ],
          },
        ],
        maxTokens: 1500,
      })

      if (!text) {
        return {
          success: false,
          error: "No content returned from AI",
        }
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          return {
            success: false,
            error: "No JSON found in AI response",
            rawResponse: text,
          }
        }

        const data = JSON.parse(jsonMatch[0])
        return {
          success: true,
          data,
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError)
        return {
          success: false,
          error: "Failed to parse AI response",
          rawResponse: text,
          originalError: parseError instanceof Error ? parseError.message : "Unknown error",
        }
      }
    }
  } catch (error) {
    console.error("AI extraction error:", error)
    return {
      success: false,
      error: "Failed to extract data using AI",
      originalError: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
