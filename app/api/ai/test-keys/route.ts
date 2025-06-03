import { NextResponse } from "next/server"
import { testAPIKeys } from "@/lib/test-api-keys"

export async function GET() {
  try {
    const results = await testAPIKeys()

    return NextResponse.json({
      success: true,
      results,
      message:
        results.errors.length === 0 ? "All API keys are properly configured!" : "Some issues found with API keys",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test API keys",
      },
      { status: 500 },
    )
  }
}
