import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service-manager"

export async function GET() {
  try {
    const config = aiService.getConfig()
    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get AI configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json()
    aiService.updateConfig(updates)

    return NextResponse.json({
      success: true,
      message: "AI configuration updated",
      config: aiService.getConfig(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update AI configuration" }, { status: 500 })
  }
}
