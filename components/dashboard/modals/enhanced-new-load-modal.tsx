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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
    // Basic Load Information
    reference: "",
    loadNumber: "",
    customer: "",
    brokerEmail: "",
    brokerPhone: "",

    // Origin Information
    originAddress: "",
    originCity: "",
    originState: "",
    originZip: "",
    pickupDate: "",
    pickupTime: "",
    pickupContact: "",
    pickupPhone: "",

    // Destination Information
    destinationAddress: "",
    destinationCity: "",
    destinationState: "",
    destinationZip: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryContact: "",
    deliveryPhone: "",

    // Load Details
    commodity: "",
    weight: "",
    pieces: "",
    dimensions: "",
    equipment: "",
    rate: "",
    mileage: "",

    // Driver Information
    driverName: "",
    driverPhone: "",
    driverEmail: "",

    // Additional Information
    specialInstructions: "",
    notes: "",
    hazmat: false,
    temperature: "",
    vin: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      console.log("Sending document to API for processing...")

      const response = await fetch("/api/ai/extract-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataUrl }),
      })

      const result = await response.json()
      console.log("API response:", result)

      if (result.success && result.data) {
        setExtractedData(result.data)

        // Enhanced data mapping with more comprehensive field extraction
        setFormData((prev) => ({
          ...prev,
          // Basic Information
          reference: result.data.loadNumber || prev.reference,
          loadNumber: result.data.loadNumber || prev.loadNumber,
          customer: result.data.broker?.name || result.data.consignee?.name || prev.customer,
          brokerEmail: result.data.broker?.email || prev.brokerEmail,
          brokerPhone: result.data.broker?.phone || prev.brokerPhone,

          // Origin/Pickup Information
          originAddress: result.data.pickupLocation?.address || prev.originAddress,
          originCity: result.data.pickupLocation?.city || prev.originCity,
          originState: result.data.pickupLocation?.state || prev.originState,
          originZip: result.data.pickupLocation?.zip || prev.originZip,
          pickupDate: result.data.pickupDate || prev.pickupDate,
          pickupTime: extractTimeFromDate(result.data.pickupDate) || prev.pickupTime,

          // Destination/Delivery Information
          destinationAddress: result.data.deliveryLocation?.address || prev.destinationAddress,
          destinationCity: result.data.deliveryLocation?.city || prev.destinationCity,
          destinationState: result.data.deliveryLocation?.state || prev.destinationState,
          destinationZip: result.data.deliveryLocation?.zip || prev.destinationZip,
          deliveryDate: result.data.deliveryDate || prev.deliveryDate,
          deliveryTime: extractTimeFromDate(result.data.deliveryDate) || prev.deliveryTime,

          // Load Details
          commodity: result.data.commodity || prev.commodity,
          weight: result.data.weight ? `${result.data.weight} lbs` : prev.weight,
          rate: result.data.rate ? `$${result.data.rate}` : prev.rate,
          vin: result.data.vin || prev.vin,

          // Driver Information
          driverName: result.data.driver?.name || prev.driverName,
          driverPhone: result.data.driver?.phone || prev.driverPhone,

          // Additional Information
          specialInstructions: result.data.specialInstructions || prev.specialInstructions,
          notes: result.data.specialInstructions || prev.notes,
        }))

        setProcessingStatus("success")
        setStatusMessage(
          result.note
            ? `${result.note} - Review and edit the data below.`
            : "Document processed successfully! Review and edit the extracted data.",
        )
        setActiveTab("review")

        toast({
          title: "OCR Success",
          description: result.note || "Load details extracted from document",
        })
      } else {
        throw new Error(result.error || "Failed to extract data")
      }
    } catch (error) {
      console.error("Document processing error:", error)
      setProcessingStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Failed to process document")
      toast({
        title: "OCR Failed",
        description: "Could not extract data from document. Please enter details manually.",
        variant: "destructive",
      })
    }
  }

  const extractTimeFromDate = (dateString: string | null): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toTimeString().slice(0, 5) // HH:MM format
    } catch {
      return ""
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
    // Combine address fields for backward compatibility
    const processedData = {
      ...formData,
      origin: `${formData.originAddress}, ${formData.originCity}, ${formData.originState} ${formData.originZip}`.trim(),
      destination:
        `${formData.destinationAddress}, ${formData.destinationCity}, ${formData.destinationState} ${formData.destinationZip}`.trim(),
      pickupDateTime:
        formData.pickupDate && formData.pickupTime
          ? `${formData.pickupDate}T${formData.pickupTime}`
          : formData.pickupDate,
      deliveryDateTime:
        formData.deliveryDate && formData.deliveryTime
          ? `${formData.deliveryDate}T${formData.deliveryTime}`
          : formData.deliveryDate,
    }

    onSubmit(processedData)
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
      loadNumber: "",
      customer: "",
      brokerEmail: "",
      brokerPhone: "",
      originAddress: "",
      originCity: "",
      originState: "",
      originZip: "",
      pickupDate: "",
      pickupTime: "",
      pickupContact: "",
      pickupPhone: "",
      destinationAddress: "",
      destinationCity: "",
      destinationState: "",
      destinationZip: "",
      deliveryDate: "",
      deliveryTime: "",
      deliveryContact: "",
      deliveryPhone: "",
      commodity: "",
      weight: "",
      pieces: "",
      dimensions: "",
      equipment: "",
      rate: "",
      mileage: "",
      driverName: "",
      driverPhone: "",
      driverEmail: "",
      specialInstructions: "",
      notes: "",
      hazmat: false,
      temperature: "",
      vin: "",
    })
  }

  const renderFormFields = () => (
    <div className="space-y-6">
      {/* Basic Load Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Load Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number *</Label>
            <Input id="reference" value={formData.reference} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loadNumber">Load Number</Label>
            <Input id="loadNumber" value={formData.loadNumber} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Customer/Broker *</Label>
            <Input id="customer" value={formData.customer} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brokerEmail">Broker Email</Label>
            <Input id="brokerEmail" type="email" value={formData.brokerEmail} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Origin Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pickup Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="originAddress">Pickup Address *</Label>
            <Input id="originAddress" value={formData.originAddress} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originCity">City *</Label>
            <Input id="originCity" value={formData.originCity} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originState">State *</Label>
            <Select value={formData.originState} onValueChange={(value) => handleSelectChange("originState", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                <SelectItem value="HI">Hawaii</SelectItem>
                <SelectItem value="ID">Idaho</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
                <SelectItem value="KS">Kansas</SelectItem>
                <SelectItem value="KY">Kentucky</SelectItem>
                <SelectItem value="LA">Louisiana</SelectItem>
                <SelectItem value="ME">Maine</SelectItem>
                <SelectItem value="MD">Maryland</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="MN">Minnesota</SelectItem>
                <SelectItem value="MS">Mississippi</SelectItem>
                <SelectItem value="MO">Missouri</SelectItem>
                <SelectItem value="MT">Montana</SelectItem>
                <SelectItem value="NE">Nebraska</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="NH">New Hampshire</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="NM">New Mexico</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="NC">North Carolina</SelectItem>
                <SelectItem value="ND">North Dakota</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="OK">Oklahoma</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="RI">Rhode Island</SelectItem>
                <SelectItem value="SC">South Carolina</SelectItem>
                <SelectItem value="SD">South Dakota</SelectItem>
                <SelectItem value="TN">Tennessee</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="UT">Utah</SelectItem>
                <SelectItem value="VT">Vermont</SelectItem>
                <SelectItem value="VA">Virginia</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="WV">West Virginia</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="WY">Wyoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="originZip">ZIP Code</Label>
            <Input id="originZip" value={formData.originZip} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupDate">Pickup Date *</Label>
            <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input id="pickupTime" type="time" value={formData.pickupTime} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupContact">Pickup Contact</Label>
            <Input id="pickupContact" value={formData.pickupContact} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupPhone">Pickup Phone</Label>
            <Input id="pickupPhone" value={formData.pickupPhone} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Destination Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="destinationAddress">Delivery Address *</Label>
            <Input id="destinationAddress" value={formData.destinationAddress} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationCity">City *</Label>
            <Input id="destinationCity" value={formData.destinationCity} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationState">State *</Label>
            <Select
              value={formData.destinationState}
              onValueChange={(value) => handleSelectChange("destinationState", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                <SelectItem value="HI">Hawaii</SelectItem>
                <SelectItem value="ID">Idaho</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
                <SelectItem value="KS">Kansas</SelectItem>
                <SelectItem value="KY">Kentucky</SelectItem>
                <SelectItem value="LA">Louisiana</SelectItem>
                <SelectItem value="ME">Maine</SelectItem>
                <SelectItem value="MD">Maryland</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="MN">Minnesota</SelectItem>
                <SelectItem value="MS">Mississippi</SelectItem>
                <SelectItem value="MO">Missouri</SelectItem>
                <SelectItem value="MT">Montana</SelectItem>
                <SelectItem value="NE">Nebraska</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="NH">New Hampshire</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="NM">New Mexico</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="NC">North Carolina</SelectItem>
                <SelectItem value="ND">North Dakota</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="OK">Oklahoma</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="RI">Rhode Island</SelectItem>
                <SelectItem value="SC">South Carolina</SelectItem>
                <SelectItem value="SD">South Dakota</SelectItem>
                <SelectItem value="TN">Tennessee</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="UT">Utah</SelectItem>
                <SelectItem value="VT">Vermont</SelectItem>
                <SelectItem value="VA">Virginia</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="WV">West Virginia</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="WY">Wyoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationZip">ZIP Code</Label>
            <Input id="destinationZip" value={formData.destinationZip} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Delivery Date *</Label>
            <Input id="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Input id="deliveryTime" type="time" value={formData.deliveryTime} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryContact">Delivery Contact</Label>
            <Input id="deliveryContact" value={formData.deliveryContact} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryPhone">Delivery Phone</Label>
            <Input id="deliveryPhone" value={formData.deliveryPhone} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Load Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Load Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commodity">Commodity *</Label>
            <Input id="commodity" value={formData.commodity} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input id="weight" value={formData.weight} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pieces">Number of Pieces</Label>
            <Input id="pieces" value={formData.pieces} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input id="dimensions" placeholder="L x W x H" value={formData.dimensions} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Type</Label>
            <Select value={formData.equipment} onValueChange={(value) => handleSelectChange("equipment", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dry-van">Dry Van</SelectItem>
                <SelectItem value="reefer">Refrigerated</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="step-deck">Step Deck</SelectItem>
                <SelectItem value="lowboy">Lowboy</SelectItem>
                <SelectItem value="car-carrier">Car Carrier</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
                <SelectItem value="box-truck">Box Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate ($)</Label>
            <Input id="rate" value={formData.rate} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">Estimated Mileage</Label>
            <Input id="mileage" value={formData.mileage} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">VIN (if applicable)</Label>
            <Input id="vin" value={formData.vin} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Driver Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Driver Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name</Label>
            <Input id="driverName" value={formData.driverName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverPhone">Driver Phone</Label>
            <Input id="driverPhone" value={formData.driverPhone} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverEmail">Driver Email</Label>
            <Input id="driverEmail" type="email" value={formData.driverEmail} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={handleInputChange} className="min-h-[80px]" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
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
            {renderFormFields()}
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
                {renderFormFields()}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.reference || !formData.customer || !formData.originAddress || !formData.destinationAddress
            }
          >
            Create Load
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
