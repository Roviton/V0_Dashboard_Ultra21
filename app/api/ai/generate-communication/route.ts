import { type NextRequest, NextResponse } from "next/server"
import { freightAI } from "@/lib/specialized-ai-services"

export async function POST(request: NextRequest) {
  try {
    const { type, loadDetails, customPrompt } = await request.json()

    let result

    switch (type) {
      case "broker-email":
        result = await freightAI.generateBrokerEmail(loadDetails)
        break
      case "driver-instructions":
        result = await freightAI.generateDriverInstructions(loadDetails)
        break
      default:
        return NextResponse.json({ error: "Invalid communication type" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Communication generation error:", error)
    return NextResponse.json({ error: "Failed to generate communication" }, { status: 500 })
  }
}
