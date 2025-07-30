"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, CheckCircle2, AlertCircle, Wand2, X, FileText, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedNewLoadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (loadData: any) => void
}

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
  }
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
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [pdfScale, setPdfScale] = useState(1.0)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [pdfRenderPending, setPdfRenderPending] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<any>(null)
  const pendingPdfDataRef = useRef<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null) // Store Vercel Blob URL
  const [formData, setFormData] = useState({
    // Basic Load Information
    reference: "",
    loadNumber: "",
    appointmentNumber: "",
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
    pickupContactName: "",
    pickupContactPhone: "",
    pickupContactEmail: "",
    pickupOperatingHours: "",

    // Destination Information
    destinationAddress: "",
    destinationCity: "",
    destinationState: "",
    destinationZip: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryContactName: "",
    deliveryContactPhone: "",
    deliveryContactEmail: "",
    deliveryOperatingHours: "",

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
    detentionPolicy: "",
    accessorialCharges: "",
    hazmat: false,
    temperature: "",
    vin: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load PDF.js when component mounts
  useEffect(() => {
    const loadPDFJS = async () => {
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        try {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
              console.log("PDF.js loaded successfully")
            }
          }
          script.onerror = () => {
            console.error("Failed to load PDF.js")
          }
          document.head.appendChild(script)
        } catch (error) {
          console.error("Error loading PDF.js:", error)
        }
      }
    }

    loadPDFJS()
  }, [])

  // Effect to handle pending PDF rendering when canvas becomes available
  useEffect(() => {
    if (canvasRef.current && pdfRenderPending && pendingPdfDataRef.current) {
      console.log("Canvas is now available, rendering pending PDF...")
      displayPDFPreview(pendingPdfDataRef.current)
      setPdfRenderPending(false)
      pendingPdfDataRef.current = null
    }
  }, [documentPreview, pdfRenderPending])

  const uploadToBlob = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/blob/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to upload file")
    }

    return result.data.url
  }

  const displayPDFPreview = useCallback(
    async (dataUrlOrBlobUrl: string) => {
      console.log("Starting PDF preview display...")

      if (!window.pdfjsLib) {
        console.error("PDF.js not loaded")
        toast({
          title: "PDF Viewer Error",
          description: "PDF.js library not loaded. Please refresh and try again.",
          variant: "destructive",
        })
        return
      }

      if (!canvasRef.current) {
        console.log("Canvas ref not available yet, storing PDF data for later rendering...")
        pendingPdfDataRef.current = dataUrlOrBlobUrl
        setPdfRenderPending(true)
        return
      }

      try {
        console.log("Processing PDF data...")

        let pdfData: Uint8Array

        if (dataUrlOrBlobUrl.startsWith("data:")) {
          // Handle data URL (base64)
          const base64Data = dataUrlOrBlobUrl.includes(",") ? dataUrlOrBlobUrl.split(",")[1] : dataUrlOrBlobUrl
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          pdfData = bytes
        } else {
          // Handle blob URL - fetch the data
          const response = await fetch(dataUrlOrBlobUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`)
          }
          const arrayBuffer = await response.arrayBuffer()
          pdfData = new Uint8Array(arrayBuffer)
        }

        console.log("PDF bytes length:", pdfData.length)

        // Load PDF document
        console.log("Loading PDF document...")
        const loadingTask = window.pdfjsLib.getDocument({
          data: pdfData,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        })

        const pdf = await loadingTask.promise
        console.log("PDF loaded, pages:", pdf.numPages)
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)

        // Get first page
        console.log("Getting first page...")
        const page = await pdf.getPage(1)
        console.log("Page loaded")

        // Set up canvas
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) {
          throw new Error("Could not get canvas context")
        }

        // Calculate scale to fit container with better quality
        const viewport = page.getViewport({ scale: 1.0 })
        const containerWidth = 550
        const scale = Math.min(containerWidth / viewport.width, pdfScale)
        const scaledViewport = page.getViewport({ scale })

        // Set device pixel ratio for better quality
        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.height = scaledViewport.height * devicePixelRatio
        canvas.width = scaledViewport.width * devicePixelRatio
        canvas.style.width = scaledViewport.width + "px"
        canvas.style.height = scaledViewport.height + "px"

        // Scale the context for high DPI displays
        context.scale(devicePixelRatio, devicePixelRatio)

        console.log("Viewport:", { width: scaledViewport.width, height: scaledViewport.height, scale })

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height)

        // Render page
        console.log("Rendering page...")
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        }

        await page.render(renderContext).promise
        console.log("PDF rendered successfully")
        setPdfLoaded(true)
        setPdfScale(scale)
      } catch (error) {
        console.error("Error rendering PDF:", error)
        setPdfLoaded(false)

        // Show fallback message
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const context = canvas.getContext("2d")
          if (context) {
            canvas.width = 300
            canvas.height = 200
            context.fillStyle = "#f3f4f6"
            context.fillRect(0, 0, canvas.width, canvas.height)
            context.fillStyle = "#6b7280"
            context.font = "14px Arial"
            context.textAlign = "center"
            context.fillText("PDF Preview Unavailable", canvas.width / 2, canvas.height / 2 - 10)
            context.fillText("Data extraction completed", canvas.width / 2, canvas.height / 2 + 10)
          }
        }

        toast({
          title: "PDF Rendering Error",
          description: "Could not display PDF preview, but data extraction was successful.",
          variant: "destructive",
        })
      }
    },
    [pdfScale, toast],
  )

  const handlePDFZoom = async (newScale: number) => {
    if (!pdfDocRef.current || !canvasRef.current) {
      console.error("PDF document or canvas not available for zoom")
      return
    }

    console.log("Zooming to scale:", newScale)

    try {
      const page = await pdfDocRef.current.getPage(currentPage)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      const viewport = page.getViewport({ scale: newScale })

      // Set device pixel ratio for better quality
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = viewport.height * devicePixelRatio
      canvas.width = viewport.width * devicePixelRatio
      canvas.style.width = viewport.width + "px"
      canvas.style.height = viewport.height + "px"

      // Scale the context for high DPI displays
      context.scale(devicePixelRatio, devicePixelRatio)

      // Clear and render
      context.clearRect(0, 0, canvas.width, canvas.height)

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
      setPdfScale(newScale)
      console.log("PDF zoom completed to:", newScale)
    } catch (error) {
      console.error("Error zooming PDF:", error)
      toast({
        title: "Zoom Error",
        description: "Could not zoom PDF preview",
        variant: "destructive",
      })
    }
  }

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

  const handleFileSelect = async (file: File) => {
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
    setProcessingStatus("uploading")
    setStatusMessage("Uploading file to cloud storage...")

    try {
      // Upload to Vercel Blob
      const uploadedBlobUrl = await uploadToBlob(file)
      setBlobUrl(uploadedBlobUrl)
      console.log("File uploaded to blob:", uploadedBlobUrl)

      // Create preview for images and PDFs
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setDocumentPreview(e.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      } else if (file.type === "application/pdf") {
        setDocumentPreview("PDF_DOCUMENT")
        // Use the blob URL for PDF preview
        setTimeout(() => {
          displayPDFPreview(uploadedBlobUrl)
        }, 100)
      }

      // Process document for data extraction
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          processDocument(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      setProcessingStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Failed to upload file")
      toast({
        title: "Upload Failed",
        description: "Could not upload file to cloud storage",
        variant: "destructive",
      })
    }
  }

  const processDocument = async (dataUrl: string) => {
    setProcessingStatus("processing")
    setStatusMessage("Extracting load details from document...")
    setMissingFields([])

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

        // Enhanced data mapping with better time extraction
        setFormData((prev) => ({
          ...prev,
          // Basic Information
          reference: result.data.loadNumber || prev.reference,
          loadNumber: result.data.loadNumber || prev.loadNumber,
          appointmentNumber: result.data.appointmentNumber || prev.appointmentNumber,
          customer: result.data.broker?.name || result.data.consignee?.name || prev.customer,
          brokerEmail: result.data.broker?.email || prev.brokerEmail,
          brokerPhone: result.data.broker?.phone || prev.brokerPhone,

          // Origin/Pickup Information
          originAddress: result.data.pickupLocation?.address || prev.originAddress,
          originCity: result.data.pickupLocation?.city || prev.originCity,
          originState: result.data.pickupLocation?.state || prev.originState,
          originZip: result.data.pickupLocation?.zip || prev.originZip,
          pickupDate: extractDateOnly(result.data.pickupDate) || prev.pickupDate,
          pickupTime:
            extractTimeOnly(result.data.pickupDate) ||
            extractTimeFromInstructions(result.data.pickupLocation?.operatingHours, "pickup") ||
            "",
          pickupContactName: result.data.pickupLocation?.contactName || prev.pickupContactName,
          pickupContactPhone: result.data.pickupLocation?.contactPhone || prev.pickupContactPhone,
          pickupContactEmail: result.data.pickupLocation?.contactEmail || prev.pickupContactEmail,
          pickupOperatingHours: result.data.pickupLocation?.operatingHours || prev.pickupOperatingHours,

          // Destination/Delivery Information
          destinationAddress: result.data.deliveryLocation?.address || prev.destinationAddress,
          destinationCity: result.data.deliveryLocation?.city || prev.destinationCity,
          destinationState: result.data.deliveryLocation?.state || prev.destinationState,
          destinationZip: result.data.deliveryLocation?.zip || prev.destinationZip,
          deliveryDate: extractDateOnly(result.data.deliveryDate) || prev.deliveryDate,
          deliveryTime:
            extractTimeOnly(result.data.deliveryDate) ||
            extractTimeFromInstructions(result.data.deliveryLocation?.operatingHours, "delivery") ||
            "",
          deliveryContactName: result.data.deliveryLocation?.contactName || prev.deliveryContactName,
          deliveryContactPhone: result.data.deliveryLocation?.contactPhone || prev.deliveryContactPhone,
          deliveryContactEmail: result.data.deliveryLocation?.contactEmail || prev.deliveryContactEmail,
          deliveryOperatingHours: result.data.deliveryLocation?.operatingHours || prev.deliveryOperatingHours,

          // Load Details
          commodity: result.data.commodity || prev.commodity,
          weight: result.data.weight ? `${result.data.weight}` : prev.weight,
          rate: result.data.rate ? `${result.data.rate}` : prev.rate,
          vin: result.data.vin || prev.vin,
          dimensions: result.data.dimensions || prev.dimensions,

          // Driver Information
          driverName: result.data.driver?.name || prev.driverName,
          driverPhone: result.data.driver?.phone || prev.driverPhone,

          // Additional Information
          specialInstructions: result.data.specialInstructions || prev.specialInstructions,
          notes: result.data.specialInstructions || prev.notes,
          detentionPolicy: result.data.detentionPolicy || prev.detentionPolicy,
          accessorialCharges: result.data.accessorialCharges || prev.accessorialCharges,
        }))

        // Check for missing fields
        const missing: string[] = []
        if (!result.data.pickupLocation?.operatingHours) missing.push("Pickup Hours")
        if (!result.data.deliveryLocation?.operatingHours) missing.push("Delivery Hours")
        if (!result.data.detentionPolicy) missing.push("Detention Policy")
        if (!result.data.dimensions) missing.push("Dimensions")
        setMissingFields(missing)

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

  // Enhanced time extraction functions
  const extractDateOnly = (dateString: string | null): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        const dateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (dateMatch) {
          const [, month, day, year] = dateMatch
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        }
        return ""
      }
      return date.toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  const extractTimeOnly = (dateString: string | null): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const hours = date.getHours()
        const minutes = date.getMinutes()
        if (hours !== 0 || minutes !== 0) {
          return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        }
      }

      const timePatterns = [/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i, /(\d{1,2}):(\d{2})/, /(\d{1,2})\s*(AM|PM|am|pm)/i]

      for (const pattern of timePatterns) {
        const match = dateString.match(pattern)
        if (match) {
          let hour = Number.parseInt(match[1])
          const minute = match[2] ? Number.parseInt(match[2]) : 0
          const ampm = match[3]

          if (ampm && ampm.toLowerCase() === "pm" && hour !== 12) {
            hour += 12
          } else if (ampm && ampm.toLowerCase() === "am" && hour === 12) {
            hour = 0
          }

          return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        }
      }

      return ""
    } catch {
      return ""
    }
  }

  const extractTimeFromInstructions = (instructions: string | null, type: "pickup" | "delivery"): string => {
    if (!instructions) return ""

    const apptPatterns = [
      /appt at (\d{1,2}:?\d{2}\s*[ap]m)/i,
      /appointment at (\d{1,2}:?\d{2}\s*[ap]m)/i,
      /(\d{1,2}:?\d{2}\s*[ap]m) appt/i,
    ]

    for (const pattern of apptPatterns) {
      const match = instructions.match(pattern)
      if (match && match[1]) {
        return extractTimeOnly(match[1])
      }
    }

    return ""
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

    setDocumentPreview(imageUrl.trim())
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
      blobUrl: blobUrl, // Include the Vercel Blob URL
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
    setMissingFields([])
    setDocumentPreview(null)
    setPdfDataUrl(null)
    setPdfScale(1.0)
    setPdfLoaded(false)
    setPdfRenderPending(false)
    pdfDocRef.current = null
    pendingPdfDataRef.current = null
    setCurrentPage(1)
    setTotalPages(1)
    setBlobUrl(null)

    setFormData({
      reference: "",
      loadNumber: "",
      appointmentNumber: "",
      customer: "",
      brokerEmail: "",
      brokerPhone: "",
      originAddress: "",
      originCity: "",
      originState: "",
      originZip: "",
      pickupDate: "",
      pickupTime: "",
      pickupContactName: "",
      pickupContactPhone: "",
      pickupContactEmail: "",
      pickupOperatingHours: "",
      destinationAddress: "",
      destinationCity: "",
      destinationState: "",
      destinationZip: "",
      deliveryDate: "",
      deliveryTime: "",
      deliveryContactName: "",
      deliveryContactPhone: "",
      deliveryContactEmail: "",
      deliveryOperatingHours: "",
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
      detentionPolicy: "",
      accessorialCharges: "",
      hazmat: false,
      temperature: "",
      vin: "",
    })
  }

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return

    try {
      const page = await pdfDocRef.current.getPage(pageNumber)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = 550
      const scale = Math.min(containerWidth / viewport.width, pdfScale)
      const scaledViewport = page.getViewport({ scale })

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = scaledViewport.height * devicePixelRatio
      canvas.width = scaledViewport.width * devicePixelRatio
      canvas.style.width = scaledViewport.width + "px"
      canvas.style.height = scaledViewport.height + "px"

      context.scale(devicePixelRatio, devicePixelRatio)
      context.clearRect(0, 0, canvas.width, canvas.height)

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      }

      await page.render(renderContext).promise
      setCurrentPage(pageNumber)
      setPdfLoaded(true)
      setPdfScale(scale)
    } catch (error) {
      console.error("Error rendering PDF:", error)
      setPdfLoaded(false)

      if (canvasRef.current) {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (context) {
          canvas.width = 300
          canvas.height = 200
          context.fillStyle = "#f3f4f6"
          context.fillRect(0, 0, canvas.width, canvas.height)
          context.fillStyle = "#6b7280"
          context.font = "14px Arial"
          context.textAlign = "center"
          context.fillText("PDF Preview Unavailable", canvas.width / 2, canvas.height / 2 - 10)
          context.fillText("Data extraction completed", canvas.width / 2, canvas.height / 2 + 10)
        }
      }

      toast({
        title: "PDF Rendering Error",
        description: "Could not display PDF preview, but data extraction was successful.",
        variant: "destructive",
      })
    }
  }

  const renderDocumentPreview = () => {
    if (!documentPreview) return null

    return (
      <div className="w-[600px] border-r bg-gray-50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Document Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDocumentPreview(null)
              setPdfDataUrl(null)
              setPdfLoaded(false)
              setPdfRenderPending(false)
              pdfDocRef.current = null
              pendingPdfDataRef.current = null
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          {documentPreview === "PDF_DOCUMENT" ? (
            <div className="w-full h-full bg-white rounded-lg border overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 truncate">{selectedFile?.name}</span>
                  {blobUrl && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Uploaded</span>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDocumentPreview(null)
                    setPdfDataUrl(null)
                    setPdfLoaded(false)
                    setPdfRenderPending(false)
                    pdfDocRef.current = null
                    pendingPdfDataRef.current = null
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ maxHeight: "600px" }}>
                <div className="flex justify-center min-h-full">
                  {!pdfLoaded && !pdfRenderPending && (
                    <div className="flex items-center justify-center w-72 h-96 bg-white border border-gray-300 rounded">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Loading PDF...</p>
                      </div>
                    </div>
                  )}
                  {pdfRenderPending && (
                    <div className="flex items-center justify-center w-72 h-96 bg-white border border-gray-300 rounded">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Preparing canvas...</p>
                      </div>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className={cn("border border-gray-300 shadow-lg bg-white rounded", !pdfLoaded && "hidden")}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      display: pdfLoaded ? "block" : "none",
                    }}
                  />
                </div>
              </div>

              {documentPreview === "PDF_DOCUMENT" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => renderPage(Math.max(1, currentPage - 1))}
                      disabled={!pdfLoaded || currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => renderPage(Math.min(totalPages, currentPage + 1))}
                      disabled={!pdfLoaded || currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePDFZoom(Math.max(0.5, pdfScale - 0.25))
                      }}
                      disabled={!pdfLoaded}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <span className="text-xs px-3 py-1 bg-white border rounded">{Math.round(pdfScale * 100)}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePDFZoom(Math.min(3, pdfScale + 0.25))
                      }}
                      disabled={!pdfLoaded}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-lg border">
              <img
                src={documentPreview || "/placeholder.svg"}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>✅ Document uploaded successfully</p>
          <p>📊 Data extraction {processingStatus === "success" ? "completed" : "in progress"}</p>
          {blobUrl && <p>☁️ Stored in cloud storage</p>}
          {documentPreview === "PDF_DOCUMENT" && <p>🔍 Use zoom controls to adjust view</p>}
        </div>
      </div>
    )
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
            <Label htmlFor="appointmentNumber">Appointment Number</Label>
            <Input id="appointmentNumber" value={formData.appointmentNumber} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Customer/Broker *</Label>
            <Input id="customer" value={formData.customer} onChange={handleInputChange} />
          </div>
          <div className="space-y-2 col-span-2">
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
            <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input
              id="pickupTime"
              type="time"
              value={formData.pickupTime}
              onChange={handleInputChange}
              placeholder="HH:MM"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="pickupOperatingHours">Pickup Hours</Label>
            <Input
              id="pickupOperatingHours"
              value={formData.pickupOperatingHours}
              onChange={handleInputChange}
              placeholder="e.g., Mon-Fri 8 AM - 5 PM, FCFS"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupContactName">Pickup Contact Name</Label>
            <Input id="pickupContactName" value={formData.pickupContactName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupContactPhone">Pickup Contact Phone</Label>
            <Input id="pickupContactPhone" value={formData.pickupContactPhone} onChange={handleInputChange} />
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
            <Input id="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Input
              id="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={handleInputChange}
              placeholder="HH:MM"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="deliveryOperatingHours">Delivery Hours</Label>
            <Input
              id="deliveryOperatingHours"
              value={formData.deliveryOperatingHours}
              onChange={handleInputChange}
              placeholder="e.g., Mon-Fri 8 AM - 5 PM, Appt. Only"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryContactName">Delivery Contact Name</Label>
            <Input id="deliveryContactName" value={formData.deliveryContactName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryContactPhone">Delivery Contact Phone</Label>
            <Input id="deliveryContactPhone" value={formData.deliveryContactPhone} onChange={handleInputChange} />
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
            <Label htmlFor="detentionPolicy">Detention Policy</Label>
            <Input
              id="detentionPolicy"
              value={formData.detentionPolicy}
              onChange={handleInputChange}
              placeholder="e.g., $75/hr after 2 hours free"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessorialCharges">Accessorial Charges</Label>
            <Input
              id="accessorialCharges"
              value={formData.accessorialCharges}
              onChange={handleInputChange}
              placeholder="e.g., Lumper fee: $150"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              className="min-h-[80px]"
              placeholder="Include pickup/delivery hours, special requirements, etc."
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
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[80vh]">
          {/* Document Preview - Left Side */}
          {documentPreview && renderDocumentPreview()}

          {/* Form Content - Right Side */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle>Create New Load</DialogTitle>
              <DialogDescription>
                Upload a document for automatic data extraction or enter details manually
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Document</TabsTrigger>
                  <TabsTrigger value="review" disabled={!extractedData}>
                    Review & Edit
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="manual" className="space-y-4 py-4 mt-0">
                    {renderFormFields()}
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4 py-4 mt-0">
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
                            <p className="text-sm text-muted-foreground">
                              Drag & drop or click to select PDF/image files
                            </p>
                          </>
                        )}

                        {processingStatus === "uploading" && (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <h3 className="text-lg font-semibold">Uploading to Cloud</h3>
                            <p className="text-sm text-muted-foreground">{statusMessage}</p>
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

                  <TabsContent value="review" className="space-y-4 py-4 mt-0">
                    {extractedData && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">✅ Data Extracted Successfully</h4>
                          <p className="text-sm text-green-700">
                            Review the extracted information below and make any necessary corrections before creating
                            the load.
                          </p>
                        </div>
                        {missingFields.length > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Missing Information</AlertTitle>
                            <AlertDescription>
                              The AI could not find the following fields. Please review the document and fill them in
                              manually: {missingFields.join(", ")}.
                            </AlertDescription>
                          </Alert>
                        )}
                        {renderFormFields()}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <DialogFooter className="p-6 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.reference ||
                  !formData.originAddress ||
                  !formData.destinationAddress ||
                  !formData.pickupDate ||
                  !formData.deliveryDate ||
                  !formData.commodity
                }
              >
                Create Load
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
