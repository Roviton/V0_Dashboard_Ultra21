import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { billOfLadingSchema, deliveryReceiptSchema, invoiceSchema, rateConfirmationSchema } from "./ocr-schemas"

export type DocumentType = "bill-of-lading" | "delivery-receipt" | "invoice" | "rate-confirmation"

export class DocumentOCRService {
  private getSchema(documentType: DocumentType) {
    switch (documentType) {
      case "bill-of-lading":
        return billOfLadingSchema
      case "delivery-receipt":
        return deliveryReceiptSchema
      case "invoice":
        return invoiceSchema
      case "rate-confirmation":
        return rateConfirmationSchema
      default:
        throw new Error(`Unsupported document type: ${documentType}`)
    }
  }

  private getPrompt(documentType: DocumentType) {
    const prompts = {
      "bill-of-lading":
        "Extract all information from this bill of lading document. Pay special attention to shipper/consignee details, commodity information, weights, and any special handling instructions.",
      "delivery-receipt":
        "Extract delivery information from this proof of delivery document. Include delivery date/time, who received the shipment, condition of goods, and any damage or shortage notes.",
      invoice:
        "Extract billing information from this freight invoice. Include all line items, rates, surcharges, and total amounts.",
      "rate-confirmation":
        "Extract rate and load details from this rate confirmation document. Include origin/destination, commodity, rates, and pickup/delivery dates.",
    }
    return prompts[documentType]
  }

  async extractData(imageUrl: string, documentType: DocumentType, useHighAccuracy = true) {
    const schema = this.getSchema(documentType)
    const prompt = this.getPrompt(documentType)

    // Use GPT-4o for high accuracy, Claude for complex documents
    const model = useHighAccuracy ? openai("gpt-4o") : anthropic("claude-3-5-sonnet-20241022")

    try {
      const { object } = await generateObject({
        model,
        schema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image",
                image: imageUrl,
              },
            ],
          },
        ],
      })

      return {
        success: true,
        data: object,
        documentType,
      }
    } catch (error) {
      console.error("OCR extraction failed:", error)
      return {
        success: false,
        error: error.message,
        documentType,
      }
    }
  }

  async extractWithFallback(imageUrl: string, documentType: DocumentType) {
    // Try GPT-4o first
    let result = await this.extractData(imageUrl, documentType, true)

    if (!result.success) {
      // Fallback to Claude if GPT-4o fails
      result = await this.extractData(imageUrl, documentType, false)
    }

    return result
  }
}

export const documentOCR = new DocumentOCRService()
