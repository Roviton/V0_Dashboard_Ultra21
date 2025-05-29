"use client"

import type React from "react"
import type { Load } from "@/components/dashboard/loads-data-table"

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
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewLoadModalProps {
  isOpen: boolean
  onClose: () => void
  onAddLoad?: (loadData: Omit<Load, "id" | "status" | "createdAt">) => Load | null
}

type ProcessingStatus = "idle" | "uploading" | "processing" | "success" | "error"

type ExtractedLoadData = {
  reference: string
  customer: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  rate?: string
  weight?: string
  commodity?: string
  equipment?: string
  notes?: string
}

export function NewLoadModal({ isOpen, onClose, onAddLoad }: NewLoadModalProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedLoadData | null>(null)
  const [formData, setFormData] = useState<ExtractedLoadData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return

    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    processFile(file)
  }

  // Process the uploaded file
  const processFile = async (file: File) => {
    setProcessingStatus("uploading")
    setStatusMessage("Uploading rate confirmation...")

    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setProcessingStatus("processing")
    setStatusMessage("Extracting load details...")

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Simulate extracted data
    const mockExtractedData: ExtractedLoadData = {
      reference: "RC-" + Math.floor(Math.random() * 10000),
      customer: "Global Transport Inc.",
      origin: "Chicago, IL",
      destination: "Indianapolis, IN",
      pickupDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
      deliveryDate: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
      rate: "$1,850.00",
      weight: "24,500 lbs",
      commodity: "General Merchandise",
      equipment: "Dry Van",
      notes: "Delivery appointment required. Call 2 hours before arrival.",
    }

    setExtractedData(mockExtractedData)
    setFormData(mockExtractedData)
    setProcessingStatus("success")
    setStatusMessage("Load details extracted successfully!")
    setActiveTab("review")
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle click on upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle save
  const handleSave = () => {
    if (!formData) return

    // Add the load to the table
    if (onAddLoad) {
      const newLoad = onAddLoad(formData)
      if (newLoad) {
        toast({
          title: "Load created",
          description: `New load ${newLoad.id} has been created successfully`,
        })
      }
    } else {
      toast({
        title: "Load created",
        description: "New load has been created successfully",
      })
    }

    resetForm()
    onClose()
  }

  // Reset form
  const resetForm = () => {
    setSelectedFile(null)
    setExtractedData(null)
    setFormData(null)
    setProcessingStatus("idle")
    setStatusMessage("")
    setActiveTab("upload")
  }

  // Handle modal close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Load</DialogTitle>
          <DialogDescription>Upload a rate confirmation document or enter load details manually.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="review" disabled={!extractedData}>
              Review Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center",
                isDragging ? "border-primary bg-primary/5" : "border-border",
                processingStatus !== "idle" && "pointer-events-none opacity-60",
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={processingStatus === "idle" ? handleUploadClick : undefined}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileInputChange}
                disabled={processingStatus !== "idle"}
              />

              {processingStatus === "idle" && (
                <>
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Drag & Drop Rate Confirmation</h3>
                  <p className="mb-4 text-sm text-muted-foreground">or click to browse for PDF files</p>
                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                    <FileText className="mr-2 h-4 w-4" />
                    Select PDF
                  </Button>
                </>
              )}

              {processingStatus === "uploading" && (
                <>
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <h3 className="mb-2 text-lg font-semibold">Uploading Document</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </>
              )}

              {processingStatus === "processing" && (
                <>
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <h3 className="mb-2 text-lg font-semibold">Processing Document</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </>
              )}

              {processingStatus === "success" && (
                <>
                  <CheckCircle2 className="mb-4 h-8 w-8 text-green-500" />
                  <h3 className="mb-2 text-lg font-semibold">Processing Complete</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </>
              )}

              {processingStatus === "error" && (
                <>
                  <AlertCircle className="mb-4 h-8 w-8 text-destructive" />
                  <h3 className="mb-2 text-lg font-semibold">Processing Failed</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      setProcessingStatus("idle")
                    }}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>

            {selectedFile && processingStatus !== "error" && (
              <div className="mt-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  {processingStatus === "success" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveTab("review")
                      }}
                    >
                      Review Details
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4 py-4">
            {formData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input id="reference" value={formData.reference} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input id="customer" value={formData.customer} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input id="origin" value={formData.origin} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate</Label>
                    <Input id="rate" value={formData.rate} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" value={formData.weight} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commodity">Commodity</Label>
                    <Input id="commodity" value={formData.commodity} onChange={handleInputChange} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment</Label>
                    <Input id="equipment" value={formData.equipment} onChange={handleInputChange} className="w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="min-h-[100px] w-full"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {activeTab === "review" && <Button onClick={handleSave}>Create Load</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
