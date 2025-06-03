"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractBillOfLadingData } from "@/lib/ai-service"

interface EnhancedNewLoadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (loadData: any) => void
}

export function EnhancedNewLoadModal({ isOpen, onClose, onSubmit }: EnhancedNewLoadModalProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [processingStatus, setProcessingStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">(
    "idle",
  )
  const [statusMessage, setStatusMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [extractedData, setExtractedData] = useState<any>(null)
  const [formData, setFormData] = useState({
    reference: "",
    customer: "",
    origin: "",
    destination: "",
    pickupDate: "",
    deliveryDate: "",
    rate: "",
    weight: "",
    commodity: "",
    equipment: "",
    notes: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleFileSelect = (file: File) => {
    if (!file) return

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    // Convert file to URL for processing
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        processDocument(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const processDocument = async (dataUrl: string) => {
    setProcessingStatus("processing")
    setStatusMessage("Extracting load details from document...")

    try {
      const result = await extractBillOfLadingData(dataUrl)

      if (result.success && result.data) {
        setExtractedData(result.data)

        // Auto-fill form with extracted data
        setFormData((prev) => ({
          ...prev,
          reference: result.data.loadNumber || prev.reference,
          customer: result.data.consignee?.name || prev.customer,
          origin: result.data.shipper
            ? `${result.data.shipper.city || ""}, ${result.data.shipper.state || ""}`.trim().replace(/^,\s*/, "")
            : prev.origin,
          destination: result.data.consignee
            ? `${result.data.consignee.city || ""}, ${result.data.consignee.state || ""}`.trim().replace(/^,\s*/, "")
            : prev.destination,
          commodity: result.data.commodity || prev.commodity,
          weight: result.data.weight ? `${result.data.weight} lbs` : prev.weight,
          rate: result.data.rate ? `$${result.data.rate}` : prev.rate,
          notes: result.data.specialInstructions || prev.notes,
        }))

        setProcessingStatus("success")
        setStatusMessage("Document processed successfully! Review and edit the extracted data.")
        setActiveTab("review")

        toast({
          title: "OCR Success",
          description: "Load details extracted from document",
        })
      } else {
        throw new Error(result.error || "Failed to extract data")
      }
    } catch (error) {
      setProcessingStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Failed to process document")
      toast({
        title: "OCR Failed",
        description: "Could not extract data from document. Please enter details manually.",
        variant: "destructive",
      })
    }
  }

  const processImageUrl = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter an image URL",
        variant: "destructive",
      })
      return
    }

    await processDocument(imageUrl.trim())
  }

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
  }

  const handleSubmit = () => {
    onSubmit(formData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setActiveTab("manual")
    setProcessingStatus("idle")
    setStatusMessage("")
    setSelectedFile(null)
    setImageUrl("")
    setExtractedData(null)
    setFormData({
      reference: "",
      customer: "",
      origin: "",
      destination: "",
      pickupDate: "",
      deliveryDate: "",
      rate: "",
      weight: "",
      commodity: "",
      equipment: "",
      notes: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Load</DialogTitle>
          <DialogDescription>
            Upload a document for automatic data extraction or enter details manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="review" disabled={!extractedData}>
              Review & Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input id="reference" value={formData.reference} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" value={formData.customer} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={formData.origin} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={formData.destination} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input id="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Rate</Label>
                <Input id="rate" value={formData.rate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" value={formData.weight} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commodity">Commodity</Label>
                <Input id="commodity" value={formData.commodity} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment Type</Label>
                <Input id="equipment" value={formData.equipment} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={handleInputChange} className="min-h-[100px]" />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  processingStatus === "processing" && "pointer-events-none opacity-60",
                )}
                {...handleDragEvents}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {processingStatus === "idle" && (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-semibold">Upload Bill of Lading</h3>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to select PDF/image files</p>
                  </>
                )}

                {processingStatus === "processing" && (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Processing Document</h3>
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  </>
                )}

                {processingStatus === "success" && (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    <h3 className="text-lg font-semibold">Success!</h3>
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  </>
                )}

                {processingStatus === "error" && (
                  <>
                    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                    <h3 className="text-lg font-semibold">Processing Failed</h3>
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  </>
                )}
              </div>

              {/* URL Input Alternative */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Or enter image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/bill-of-lading.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button onClick={processImageUrl} disabled={processingStatus === "processing"}>
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 py-4">
            {extractedData && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Data Extracted Successfully</h4>
                  <p className="text-sm text-green-700">
                    Review the extracted information below and make any necessary corrections before creating the load.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input id="reference" value={formData.reference} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input id="customer" value={formData.customer} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input id="origin" value={formData.origin} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" value={formData.destination} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input id="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate</Label>
                    <Input id="rate" value={formData.rate} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" value={formData.weight} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commodity">Commodity</Label>
                    <Input id="commodity" value={formData.commodity} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment Type</Label>
                    <Input id="equipment" value={formData.equipment} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={handleInputChange} className="min-h-[100px]" />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.reference || !formData.customer}>
            Create Load
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
