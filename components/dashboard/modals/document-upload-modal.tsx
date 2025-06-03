"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Loader2 } from "lucide-react"
import type { DocumentType } from "@/lib/document-ocr-service"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onDataExtracted: (data: any, documentType: DocumentType) => void
}

export function DocumentUploadModal({ isOpen, onClose, onDataExtracted }: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>("bill-of-lading")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleExtractData = async () => {
    if (!selectedFile) return

    setIsProcessing(true)

    try {
      // Convert file to base64 or upload to your storage service
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Upload file and get URL (implement your file upload logic)
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const { imageUrl } = await uploadResponse.json()

      // Extract data using OCR
      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          documentType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setExtractedData(result.data)
        onDataExtracted(result.data, documentType)
      } else {
        console.error("OCR extraction failed:", result.error)
      }
    } catch (error) {
      console.error("Error processing document:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Document for Data Extraction</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bill-of-lading">Bill of Lading</SelectItem>
                <SelectItem value="delivery-receipt">Delivery Receipt</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="rate-confirmation">Rate Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </label>
              {selectedFile && (
                <div className="mt-4 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleExtractData} disabled={!selectedFile || isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              "Extract Data"
            )}
          </Button>

          {extractedData && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
