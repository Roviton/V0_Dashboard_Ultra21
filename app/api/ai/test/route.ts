import { type NextRequest, NextResponse } from "next/server"
import { freightAI } from "@/lib/freight-ai"

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    let result

    switch (action) {
      case "generateBrokerEmail":
        result = await freightAI.generateBrokerEmail(data.loadDetails)
        break

      case "generateDriverInstructions":
        result = await freightAI.generateDriverInstructions(data.loadDetails)
        break

      case "extractBillOfLadingData":
        if (!data.imageUrl) {
          throw new Error("Image URL is required for OCR processing")
        }
        result = await freightAI.extractBillOfLadingData(data.imageUrl)
        break

      case "analyzeLoadEfficiency":
        result = await freightAI.analyzeLoadEfficiency(data.loadData)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error("AI API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while processing the AI request",
      },
      { status: 500 },
    )
  }
}
