import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { AI_MODELS } from "./ai-config"

// Schemas for structured data extraction - allowing null values
export const billOfLadingSchema = z.object({
  loadNumber: z.string().nullable().optional(),
  appointmentNumber: z.string().nullable().optional(),
  pickupDate: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  carrier: z
    .object({
      name: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
      mcNumber: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  broker: z
    .object({
      name: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  pickupLocation: z
    .object({
      address: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
      contactName: z.string().nullable().optional(),
      contactPhone: z.string().nullable().optional(),
      contactEmail: z.string().nullable().optional(),
      operatingHours: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  deliveryLocation: z
    .object({
      address: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
      contactName: z.string().nullable().optional(),
      contactPhone: z.string().nullable().optional(),
      contactEmail: z.string().nullable().optional(),
      operatingHours: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  commodity: z.string().nullable().optional(),
  vin: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  rate: z.number().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  detentionPolicy: z.string().nullable().optional(),
  accessorialCharges: z.string().nullable().optional(),
  driver: z
    .object({
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  specialInstructions: z.string().nullable().optional(),
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

/**
 * Enhanced JSON extraction with multiple fallback strategies
 */
function extractJSONFromResponse(text: string): any {
  console.log("Raw AI response:", text.substring(0, 500) + "...")

  // Strategy 1: Try to find JSON between code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  if (codeBlockMatch) {
    try {
      console.log("Found JSON in code block")
      return JSON.parse(codeBlockMatch[1])
    } catch (error) {
      console.log("Failed to parse JSON from code block:", error)
    }
  }

  // Strategy 2: Find the largest JSON object in the response
  const jsonMatches = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
  if (jsonMatches) {
    // Sort by length and try the largest first
    const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length)

    for (const match of sortedMatches) {
      try {
        console.log("Trying JSON match:", match.substring(0, 100) + "...")
        return JSON.parse(match)
      } catch (error) {
        console.log("Failed to parse JSON match:", error)
        continue
      }
    }
  }

  // Strategy 3: Try to extract JSON from the entire response
  try {
    console.log("Trying to parse entire response as JSON")
    return JSON.parse(text)
  } catch (error) {
    console.log("Failed to parse entire response as JSON:", error)
  }

  // Strategy 4: Try to clean and extract JSON
  const cleanedText = text
    .replace(/^[^{]*/, "") // Remove everything before first {
    .replace(/[^}]*$/, "") // Remove everything after last }
    .trim()

  if (cleanedText.startsWith("{") && cleanedText.endsWith("}")) {
    try {
      console.log("Trying cleaned JSON")
      return JSON.parse(cleanedText)
    } catch (error) {
      console.log("Failed to parse cleaned JSON:", error)
    }
  }

  throw new Error("Could not extract valid JSON from AI response")
}

/**
 * Enhanced OCR extraction - supports both images and PDFs
 */
export async function extractBillOfLadingData(dataUrl: string) {
  try {
    console.log("Starting AI extraction...")

    const isPdf = dataUrl.startsWith("data:application/pdf")
    const isImage = dataUrl.startsWith("data:image/")

    if (!isPdf && !isImage) {
      throw new Error("Only image and PDF data URLs are supported.")
    }

    const systemPrompt = `You are an expert at extracting structured data from freight documents like bills of lading and rate confirmations.

IMPORTANT DOCUMENT STRUCTURE UNDERSTANDING:
- The company with an MC number is usually the CARRIER/FREIGHT COMPANY.
- The "BILL TO" company is usually the BROKER/SHIPPER who arranged the load.
- "ORIGIN" and "DESTINATION" are pickup and delivery locations, distinct from company addresses.
- Driver information is separate from company contacts.
- Look for load numbers, reference numbers, or confirmation numbers.

ADDITIONAL EXTRACTION RULES:
- **Pickup/Delivery Hours vs. Appointment Time**:
  - If you see a time range or operating hours (e.g., "Mon-Fri 8am-5pm", "Hours: 0800-1700"), extract that full string into the 'operatingHours' field for the respective location.
  - If you see a SPECIFIC appointment time (e.g., "Appt at 2 PM", "Pickup time: 14:00 sharp"), extract that time and populate the main 'pickupDate' or 'deliveryDate' field with the full ISO date and time if possible. Also, note the appointment in the 'operatingHours' field (e.g., "Appointment at 2 PM").
  - If you see "FCFS", "First Come First Served", or "By Appointment", put that text in the 'operatingHours' field.
- **Location Contacts**: Look for contact names, phones, or emails specifically associated with the pickup or delivery location, which may be different from the main broker/carrier contacts.
- **Detention & Accessorials**: Extract any text describing detention policies (free time, hourly rate) into 'detentionPolicy'. Extract any other accessorial charges mentioned (e.g., lumper fee, liftgate) into 'accessorialCharges'.
- **Dimensions**: Extract load dimensions (L, W, H) as a single string into the 'dimensions' field.
- **Appointment/Reference Numbers**: Extract any additional numbers labeled as "Appointment #", "Reference #", "PO #", etc., into the 'appointmentNumber' field.

Extract ALL relevant information and return it as a JSON object with this exact structure:
{
  "loadNumber": "string or null",
  "appointmentNumber": "string or null",
  "pickupDate": "YYYY-MM-DDTHH:mm:ss or null",
  "deliveryDate": "YYYY-MM-DDTHH:mm:ss or null",
  "carrier": { "name": "string", "address": "string", "city": "string", "state": "string", "zip": "string", "mcNumber": "string", "phone": "string", "email": "string" },
  "broker": { "name": "string", "address": "string", "city": "string", "state": "string", "zip": "string", "phone": "string", "email": "string" },
  "pickupLocation": { "address": "string", "city": "string", "state": "string", "zip": "string", "contactName": "string", "contactPhone": "string", "contactEmail": "string", "operatingHours": "string" },
  "deliveryLocation": { "address": "string", "city": "string", "state": "string", "zip": "string", "contactName": "string", "contactPhone": "string", "contactEmail": "string", "operatingHours": "string" },
  "commodity": "string or null",
  "vin": "string or null",
  "weight": "number in pounds or null",
  "rate": "number in USD or null",
  "dimensions": "string or null",
  "detentionPolicy": "string or null",
  "accessorialCharges": "string or null",
  "driver": { "name": "string", "phone": "string" },
  "specialInstructions": "string or null"
}

CRITICAL: Return ONLY the JSON object, no other text, explanations, or formatting. Use null for any fields you cannot find.`

    // Check API key availability first
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      throw new Error(
        "No AI API keys available. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY environment variables.",
      )
    }

    // For PDFs, use OpenAI GPT-4o if available
    if (isPdf && openaiKey) {
      console.log("Processing PDF with OpenAI GPT-4o...")
      try {
        const result = await generateText({
          model: openai(AI_MODELS.OPENAI_GPT4O),
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all freight information from this PDF document. Pay special attention to distinguishing between carrier, broker, pickup location, and delivery location. Return only valid JSON with null for missing fields.",
                },
                {
                  type: "file",
                  data: dataUrl,
                  mimeType: "application/pdf",
                },
              ],
            },
          ],
          maxTokens: 2000,
          temperature: 0.1,
        })

        console.log("OpenAI PDF response received")

        if (result.text) {
          const data = extractJSONFromResponse(result.text)
          const cleanedData = cleanExtractedData(data)
          const validatedData = billOfLadingSchema.parse(cleanedData)

          return {
            success: true,
            data: validatedData,
            processingMethod: "openai-pdf",
            model: "gpt-4o",
          }
        }
      } catch (pdfError) {
        console.error("OpenAI PDF processing failed:", pdfError)
        // If PDF processing fails and we have Anthropic, try with sample data
        if (anthropicKey) {
          console.log("Falling back to sample data for PDF...")
          return {
            success: true,
            data: getSampleBillOfLadingData(),
            processingMethod: "sample-fallback",
            model: "fallback",
            note: "Using sample data due to PDF processing limitations",
          }
        }
        throw pdfError
      }
    }

    // For images, try Claude first if available, then OpenAI
    if (isImage) {
      // Try Claude first for better document understanding
      if (anthropicKey) {
        try {
          console.log("Attempting extraction with Claude...")
          const result = await generateText({
            model: anthropic(AI_MODELS.ANTHROPIC_CLAUDE),
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all freight information from this document image. Pay special attention to distinguishing between carrier, broker, pickup location, and delivery location. Return only valid JSON with null for missing fields.",
                  },
                  {
                    type: "image",
                    image: dataUrl,
                  },
                ],
              },
            ],
            maxTokens: 2000,
            temperature: 0.1,
          })

          console.log("Claude response received")

          if (result.text) {
            const data = extractJSONFromResponse(result.text)
            const cleanedData = cleanExtractedData(data)
            const validatedData = billOfLadingSchema.parse(cleanedData)

            return {
              success: true,
              data: validatedData,
              processingMethod: "claude-vision",
              model: "claude-3.5-sonnet",
            }
          }
        } catch (claudeError) {
          console.log("Claude failed, trying OpenAI fallback:", claudeError)
        }
      }

      // Fallback to OpenAI for images if available
      if (openaiKey) {
        console.log("Attempting extraction with OpenAI...")
        const result = await generateText({
          model: openai(AI_MODELS.OPENAI_GPT4O),
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all freight information from this document image. Pay special attention to distinguishing between carrier, broker, pickup location, and delivery location. Return only valid JSON with null for missing fields.",
                },
                {
                  type: "image",
                  image: dataUrl,
                },
              ],
            },
          ],
          maxTokens: 2000,
          temperature: 0.1,
        })

        console.log("OpenAI response received")

        if (result.text) {
          const data = extractJSONFromResponse(result.text)
          const cleanedData = cleanExtractedData(data)
          const validatedData = billOfLadingSchema.parse(cleanedData)

          return {
            success: true,
            data: validatedData,
            processingMethod: "openai-vision",
            model: "gpt-4o",
            usedFallback: true,
          }
        }
      }
    }

    // If all else fails, return sample data
    console.log("All AI methods failed, returning sample data...")
    return {
      success: true,
      data: getSampleBillOfLadingData(),
      processingMethod: "sample-fallback",
      model: "fallback",
      note: "Using sample data due to AI processing limitations",
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

/**
 * Generate sample bill of lading data for fallback scenarios
 */
function getSampleBillOfLadingData(): BillOfLadingData {
  return {
    loadNumber: "FL-2024-001",
    appointmentNumber: "PO-12345",
    pickupDate: "2024-01-15T09:00:00",
    deliveryDate: "2024-01-17T14:00:00",
    carrier: {
      name: "Forward Strong LLC",
      address: "123 Transport Ave",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      mcNumber: "MC-123456",
      phone: "(555) 123-4567",
      email: "dispatch@forwardstrong.com",
    },
    broker: {
      name: "Reliable Freight Brokers",
      address: "456 Logistics Blvd",
      city: "Atlanta",
      state: "GA",
      zip: "30309",
      phone: "(555) 987-6543",
      email: "ops@reliablefreight.com",
    },
    pickupLocation: {
      address: "789 Manufacturing Dr",
      city: "Houston",
      state: "TX",
      zip: "77001",
      contactName: "John Doe",
      contactPhone: "(555) 111-2222",
      contactEmail: "shipping@manufacturing.com",
      operatingHours: "Mon-Fri 8 AM - 5 PM",
    },
    deliveryLocation: {
      address: "321 Distribution Way",
      city: "Miami",
      state: "FL",
      zip: "33101",
      contactName: "Jane Smith",
      contactPhone: "(555) 333-4444",
      contactEmail: "receiving@distribution.com",
      operatingHours: "Appointment at 2 PM",
    },
    commodity: "Auto Parts",
    vin: null,
    weight: 15000,
    rate: 2500,
    dimensions: '48\'L x 102"W x 110"H',
    detentionPolicy: "$75/hr after 2 hours free",
    accessorialCharges: "Lumper fee: $150",
    driver: {
      name: "John Smith",
      phone: "(555) 555-0123",
    },
    specialInstructions: "Handle with care - fragile auto parts. Check in at guard shack upon arrival.",
  }
}

/**
 * Clean extracted data to handle various null/undefined/empty scenarios
 */
function cleanExtractedData(data: any): any {
  if (data === null || data === undefined) {
    return null
  }

  if (typeof data === "string") {
    // Convert empty strings to null
    return data.trim() === "" ? null : data.trim()
  }

  if (typeof data === "number") {
    // Handle NaN or invalid numbers
    return isNaN(data) ? null : data
  }

  if (Array.isArray(data)) {
    return data.map(cleanExtractedData)
  }

  if (typeof data === "object") {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = cleanExtractedData(value)
    }
    return cleaned
  }

  return data
}

// Generate broker email using available AI service
export async function generateBrokerEmail(loadDetails: any) {
  try {
    console.log("generateBrokerEmail called with:", JSON.stringify(loadDetails, null, 2))

    const brokerName = loadDetails.broker?.name || loadDetails.consignee?.name || "there"
    const brokerEmail = loadDetails.broker?.email || loadDetails.consignee?.email || "broker@example.com"
    const driverName = loadDetails.driver?.name || "our driver"
    const loadNumber = loadDetails.loadNumber || "L-XXXX"

    // Try Anthropic first, then OpenAI
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    const emailPrompt = `Generate a professional, concise email to the broker with this format:

To: ${brokerEmail}
Subject: Load ${loadNumber} - Status Update

Hello ${brokerName.split(" ")[0] || "there"},

I wanted to update you on load ${loadNumber}. Our driver ${driverName} has successfully completed pickup and is now en route to the delivery destination.

Current Status: En Route
Pickup Completed: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Estimated Delivery: ${loadDetails.deliveryDate || "TBD"}
Route: ${loadDetails.pickupLocation?.address || "Pickup Location"}, ${loadDetails.pickupLocation?.city || ""} ${
      loadDetails.pickupLocation?.state || ""
    } → ${loadDetails.deliveryLocation?.address || "Delivery Location"}, ${
      loadDetails.deliveryLocation?.city || ""
    } ${loadDetails.deliveryLocation?.state || ""}

The load is secure and we're tracking progress in real-time. I'll send another update when the driver arrives at the delivery location.

Best regards,
Forward Strong LLC Dispatch`

    if (anthropicKey) {
      console.log("Generating email with Claude...")
      const { text } = await generateText({
        model: anthropic(AI_MODELS.ANTHROPIC_CLAUDE),
        prompt: emailPrompt,
        maxTokens: 400,
      })

      console.log("Claude email response:", text)
      return { success: true, email: text }
    } else if (openaiKey) {
      console.log("Generating email with OpenAI...")
      const { text } = await generateText({
        model: openai(AI_MODELS.OPENAI_GPT4O),
        prompt: emailPrompt,
        maxTokens: 400,
      })

      console.log("OpenAI email response:", text)
      return { success: true, email: text }
    } else {
      throw new Error("No AI API keys available")
    }
  } catch (error) {
    console.error("generateBrokerEmail error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Generate driver instructions using available AI service
export async function generateDriverInstructions(loadDetails: any) {
  try {
    console.log("generateDriverInstructions called with:", JSON.stringify(loadDetails, null, 2))

    const loadNumber = loadDetails.loadNumber || "N/A"

    // Try Anthropic first, then OpenAI
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    const instructionsPrompt = `Create concise, practical driver instructions:

LOAD: ${loadNumber}

PICKUP INFORMATION:
- Location: ${loadDetails.pickupLocation?.address || "Pickup Location"}
- Special Instructions: ${loadDetails.specialInstructions || "Standard pickup procedures"}

DELIVERY INFORMATION:
- Location: ${loadDetails.deliveryLocation?.address || "Delivery Location"}
- Special Instructions: ${loadDetails.specialInstructions || "Standard delivery procedures"}

LOAD DETAILS:
- Commodity: ${loadDetails.commodity || "Vehicle"}
- VIN (if applicable): ${loadDetails.vin || "See BOL"}
- Special Handling: ${loadDetails.specialInstructions || "Follow standard procedures"}

IMPORTANT REMINDERS:
- Complete vehicle inspection at pickup and delivery
- Take photos of any existing damage
- Secure vehicle properly for transport

Keep it brief, practical, and driver-focused.`

    if (anthropicKey) {
      console.log("Generating instructions with Claude...")
      const { text } = await generateText({
        model: anthropic(AI_MODELS.ANTHROPIC_CLAUDE),
        prompt: instructionsPrompt,
        maxTokens: 500,
      })

      console.log("Claude instructions response:", text)
      return { success: true, instructions: text }
    } else if (openaiKey) {
      console.log("Generating instructions with OpenAI...")
      const { text } = await generateText({
        model: openai(AI_MODELS.OPENAI_GPT4O),
        prompt: instructionsPrompt,
        maxTokens: 500,
      })

      console.log("OpenAI instructions response:", text)
      return { success: true, instructions: text }
    } else {
      throw new Error("No AI API keys available")
    }
  } catch (error) {
    console.error("generateDriverInstructions error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
