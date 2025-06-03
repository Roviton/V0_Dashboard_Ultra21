import { type NextRequest, NextResponse } from "next/server"
import { freightAI } from "@/lib/specialized-ai-services"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, documentType } = await request.json()

    if (!imageUrl || !documentType) {
      return NextResponse.json({ error: "Missing imageUrl or documentType" }, { status: 400 })
    }

    let result

    switch (documentType) {
      case "bill-of-lading":
        result = await freightAI.extractBillOfLadingData(imageUrl)
        break
      case "delivery-receipt":
        result = await freightAI.extractDeliveryReceiptData(imageUrl)
        break
      case "invoice":
        result = await freightAI.extractInvoiceData(imageUrl)
        break
      default:
        return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Document extraction error:", error)
    return NextResponse.json({ error: "Failed to extract document data" }, { status: 500 })
  }
}
