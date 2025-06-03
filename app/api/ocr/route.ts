import { type NextRequest, NextResponse } from "next/server"
import { extractBillOfLadingData } from "@/lib/ai-service"
import { convertPdfToImages, convertPdfToBase64 } from "@/lib/pdf-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Check file type - supporting images and PDFs
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload an image (JPEG, PNG, WebP) or PDF.",
        },
        { status: 400 },
      )
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let dataUrls: string[] = []
    let processingMethod = "image"

    if (file.type === "application/pdf") {
      try {
        console.log("Processing PDF file...")
        processingMethod = "pdf-to-image"

        // Convert PDF to images
        dataUrls = await convertPdfToImages(buffer)
        console.log(`PDF converted to ${dataUrls.length} images`)

        if (dataUrls.length === 0) {
          throw new Error("PDF conversion failed - no images generated")
        }
      } catch (pdfError) {
        console.error("PDF processing error:", pdfError)

        // Fallback: Try direct base64 approach
        try {
          console.log("Falling back to direct PDF base64 approach...")
          processingMethod = "pdf-direct"
          const pdfBase64 = convertPdfToBase64(buffer)

          return NextResponse.json(
            {
              success: false,
              error:
                "PDF processing requires conversion to images. Please convert your PDF to an image format (PNG, JPG) for best results.",
              suggestion: "Take a screenshot of your PDF or use an online PDF-to-image converter.",
              isPdfError: true,
            },
            { status: 400 },
          )
        } catch (fallbackError) {
          return NextResponse.json(
            {
              success: false,
              error: `PDF processing failed: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}. Please try converting to an image first.`,
            },
            { status: 500 },
          )
        }
      }
    } else {
      // Handle image files
      const base64 = buffer.toString("base64")
      const mimeType = file.type
      dataUrls = [`data:${mimeType};base64,${base64}`]
    }

    if (dataUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No data extracted from file",
        },
        { status: 500 },
      )
    }

    // Process the first image/page
    console.log(`Extracting data using ${processingMethod} method...`)
    const result = await extractBillOfLadingData(dataUrls[0])

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        usedFallback: result.usedFallback || false,
        message: `Document processed successfully (${processingMethod})`,
        fileType: file.type,
        processingMethod,
        pagesProcessed: dataUrls.length,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to extract data from document",
          originalError: result.originalError,
          rawResponse: result.rawResponse,
          processingMethod,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("OCR API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
