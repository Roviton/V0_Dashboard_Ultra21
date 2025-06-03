import { type NextRequest, NextResponse } from "next/server"
import { generateBrokerEmail } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { loadData } = await request.json()

    if (!loadData) {
      return NextResponse.json({ success: false, error: "Load data is required" }, { status: 400 })
    }

    const result = await generateBrokerEmail(loadData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        email: result.content,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to generate email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Broker email API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
