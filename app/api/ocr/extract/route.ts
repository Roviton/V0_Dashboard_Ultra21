import { type NextRequest, NextResponse } from "next/server"
import { documentOCR, type DocumentType } from "@/lib/document-ocr-service"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, documentType } = await request.json()

    if (!imageUrl || !documentType) {
      return NextResponse.json({ error: "Missing imageUrl or documentType" }, { status: 400 })
    }

    const result = await documentOCR.extractWithFallback(imageUrl, documentType as DocumentType)

    return NextResponse.json(result)
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
