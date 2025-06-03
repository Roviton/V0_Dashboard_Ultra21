import { type NextRequest, NextResponse } from "next/server"
import { generateDriverInstructions } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { loadData } = await request.json()

    if (!loadData) {
      return NextResponse.json({ success: false, error: "Load data is required" }, { status: 400 })
    }

    const result = await generateDriverInstructions(loadData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        instructions: result.content,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to generate instructions",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Driver instructions API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
