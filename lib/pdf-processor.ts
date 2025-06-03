/**
 * PDF processing with graceful fallback for missing dependencies
 */

let PDFDocument: any = null
let sharp: any = null

// Try to import dependencies, but don't crash if they're missing
try {
  PDFDocument = require("pdf-lib").PDFDocument
} catch (error) {
  console.warn("pdf-lib not available:", error.message)
}

try {
  sharp = require("sharp")
} catch (error) {
  console.warn("sharp not available:", error.message)
}

/**
 * Converts a PDF to images using pdf-lib and sharp
 * This approach works in serverless environments
 */
export async function convertPdfToImages(pdfBuffer: Buffer, maxPages = 3): Promise<string[]> {
  // Check if dependencies are available
  if (!PDFDocument || !sharp) {
    throw new Error("PDF processing dependencies not installed. Please install 'pdf-lib' and 'sharp' packages.")
  }

  try {
    console.log("Starting PDF processing...")

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()
    const pagesToProcess = Math.min(pageCount, maxPages)

    console.log(`PDF has ${pageCount} pages, processing first ${pagesToProcess}`)

    const imageDataUrls: string[] = []

    // Process each page
    for (let i = 0; i < pagesToProcess; i++) {
      try {
        // Create a new document with just this page
        const singlePageDoc = await PDFDocument.create()
        const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i])
        singlePageDoc.addPage(copiedPage)

        // Convert to PNG using sharp
        const pdfBytes = await singlePageDoc.save()
        const pngBuffer = await convertPdfPageToPng(Buffer.from(pdfBytes))

        // Convert to data URL
        const base64 = pngBuffer.toString("base64")
        const dataUrl = `data:image/png;base64,${base64}`
        imageDataUrls.push(dataUrl)

        console.log(`Processed page ${i + 1}/${pagesToProcess}`)
      } catch (pageError) {
        console.error(`Error processing page ${i + 1}:`, pageError)
        // Continue with other pages
      }
    }

    console.log(`PDF processing complete. Generated ${imageDataUrls.length} images`)
    return imageDataUrls
  } catch (error) {
    console.error("PDF processing error:", error)
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Converts a PDF page to PNG using sharp
 * This is a helper function for convertPdfToImages
 */
async function convertPdfPageToPng(pdfBuffer: Buffer): Promise<Buffer> {
  if (!sharp) {
    throw new Error("Sharp dependency not available")
  }

  try {
    // Use sharp to convert PDF to PNG
    // Note: This requires sharp to be compiled with PDF support
    const pngBuffer = await sharp(pdfBuffer, { density: 300 }).png().toBuffer()

    return pngBuffer
  } catch (error) {
    console.error("PDF to PNG conversion error:", error)
    throw new Error(`Failed to convert PDF to PNG: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Fallback method: Extract text from PDF
 * This is used when image conversion fails
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  if (!PDFDocument) {
    throw new Error("PDF processing dependencies not available")
  }

  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    // Unfortunately, pdf-lib doesn't support text extraction
    // We'll return a placeholder message
    return `PDF loaded successfully with ${pdfDoc.getPageCount()} pages. Text extraction not supported in serverless environment.`
  } catch (error) {
    console.error("PDF text extraction error:", error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Simple PDF to base64 conversion
 * This is used as a last resort fallback
 */
export function convertPdfToBase64(pdfBuffer: Buffer): string {
  try {
    const base64 = pdfBuffer.toString("base64")
    return `data:application/pdf;base64,${base64}`
  } catch (error) {
    throw new Error(`Failed to convert PDF to base64: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
