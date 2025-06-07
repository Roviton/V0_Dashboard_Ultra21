"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserPlus,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Building,
  ZoomIn,
  ZoomOut,
  X,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal"
import { AssignDriverModal } from "@/components/dashboard/modals/assign-driver-modal"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface LoadsDataTableProps {
  loads: any[]
  loading: boolean
  error: string | null
  onUpdateStatus?: (loadId: string, status: string) => void
  onAssignDriver?: (loadId: string, driverId: string) => void
}

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
    tempDocumentStorage: any
  }
}

export function LoadsDataTable({ loads, loading, error, onUpdateStatus, onAssignDriver }: LoadsDataTableProps) {
  console.log("LoadsDataTable received loads:", loads)
  console.log("LoadsDataTable loading:", loading)
  console.log("LoadsDataTable error:", error)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const { onOpen } = useModal()
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const pdfDocRefs = useRef<Map<string, any>>(new Map())
  const [pdfScales, setPdfScales] = useState<Map<string, number>>(new Map())
  const [pdfLoaded, setPdfLoaded] = useState<Map<string, boolean>>(new Map())
  const [currentPages, setCurrentPages] = useState<Map<string, number>>(new Map())
  const [totalPages, setTotalPages] = useState<Map<string, number>>(new Map())
  const [pdfErrors, setPdfErrors] = useState<Map<string, string>>(new Map())
  const { toast } = useToast()

  const [assignDriverModal, setAssignDriverModal] = useState<{
    isOpen: boolean
    load: any | null
  }>({
    isOpen: false,
    load: null,
  })

  // Load PDF.js when component mounts
  useEffect(() => {
    const loadPDFJS = async () => {
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        try {
          // Load PDF.js from CDN
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

  // Filter loads based on search term and status
  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      String(load.load_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(load.reference_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(load.pickup_city || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(load.delivery_city || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(load.commodity || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || load.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const isActiveLoad = (status: string) => {
    return ["new", "assigned", "accepted", "in_progress"].includes(status)
  }

  const toggleRowExpansion = (loadId: string, status: string) => {
    // Only allow expansion for active loads
    if (!isActiveLoad(status)) return

    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(loadId)) {
      newExpandedRows.delete(loadId)
    } else {
      newExpandedRows.add(loadId)

      // Load the PDF when expanding
      setTimeout(() => {
        const load = loads.find((l) => l.id === loadId)
        loadPdfForLoad(load)
      }, 100)
    }
    setExpandedRows(newExpandedRows)
  }

  const loadPdfForLoad = async (load: any) => {
    if (!load) return

    console.log("Loading PDF for load:", load.id, "PDF ID:", load.rate_confirmation_pdf_id)

    const canvas = canvasRefs.current.get(load.id)
    if (!canvas) {
      console.log(`Canvas for load ${load.id} not ready`)
      return
    }

    try {
      // Set initial loading state
      setPdfLoaded((prev) => new Map(prev).set(load.id, false))
      setPdfErrors((prev) => new Map(prev).set(load.id, ""))
      setPdfScales((prev) => new Map(prev).set(load.id, 1.0))
      setCurrentPages((prev) => new Map(prev).set(load.id, 1))

      // Check if we have a PDF reference
      if (!load.rate_confirmation_pdf_id) {
        console.log("No PDF reference found for load:", load.id)
        await renderFallbackDocument(load)
        return
      }

      // Check if tempDocumentStorage is available
      if (!window.tempDocumentStorage) {
        console.log("tempDocumentStorage not available")
        await renderFallbackDocument(load)
        return
      }

      // Get the PDF from storage
      const pdfDocument = window.tempDocumentStorage.get(load.rate_confirmation_pdf_id)
      if (!pdfDocument) {
        console.log("PDF document not found in storage:", load.rate_confirmation_pdf_id)
        await renderFallbackDocument(load)
        return
      }

      console.log("Found PDF document:", pdfDocument)

      // Check if PDF.js is loaded
      if (!window.pdfjsLib) {
        console.error("PDF.js not loaded")
        await renderFallbackDocument(load)
        return
      }

      // Load the PDF using the blob URL
      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfDocument.blobUrl,
        httpHeaders: {},
        withCredentials: false,
      })

      const pdf = await loadingTask.promise
      console.log("PDF loaded successfully, pages:", pdf.numPages)

      // Store the PDF document reference
      pdfDocRefs.current.set(load.id, pdf)

      // Update total pages
      setTotalPages((prev) => new Map(prev).set(load.id, pdf.numPages))

      // Render the first page
      await renderPdfPage(load.id, 1)
    } catch (error) {
      console.error(`Error loading PDF for load ${load.id}:`, error)
      setPdfErrors((prev) => new Map(prev).set(load.id, error.message || "Failed to load PDF"))

      // Render fallback document
      await renderFallbackDocument(load)

      toast({
        title: "PDF Loading Error",
        description: "Could not load the uploaded PDF. Showing generated document instead.",
        variant: "destructive",
      })
    }
  }

  const renderPdfPage = async (loadId: string, pageNumber: number) => {
    const pdfDoc = pdfDocRefs.current.get(loadId)
    const canvas = canvasRefs.current.get(loadId)
    const scale = pdfScales.get(loadId) || 1.0

    if (!pdfDoc || !canvas) return

    try {
      // Get the page
      const page = await pdfDoc.getPage(pageNumber)
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      // Calculate scale to fit container
      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = 550
      const fitScale = Math.min(containerWidth / viewport.width, scale)
      const scaledViewport = page.getViewport({ scale: fitScale })

      // Set device pixel ratio for better quality
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = scaledViewport.height * devicePixelRatio
      canvas.width = scaledViewport.width * devicePixelRatio
      canvas.style.width = scaledViewport.width + "px"
      canvas.style.height = scaledViewport.height + "px"

      // Scale the context for high DPI displays
      context.scale(devicePixelRatio, devicePixelRatio)

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      }

      await page.render(renderContext).promise

      // Update state
      setCurrentPages((prev) => new Map(prev).set(loadId, pageNumber))
      setPdfLoaded((prev) => new Map(prev).set(loadId, true))
      setPdfErrors((prev) => new Map(prev).set(loadId, ""))

      console.log(`PDF page ${pageNumber} rendered successfully for load ${loadId}`)
    } catch (error) {
      console.error(`Error rendering PDF page for load ${loadId}:`, error)
      setPdfLoaded((prev) => new Map(prev).set(loadId, false))
      setPdfErrors((prev) => new Map(prev).set(loadId, error.message || "Failed to render PDF"))
    }
  }

  const renderFallbackDocument = async (load: any) => {
    const canvas = canvasRefs.current.get(load.id)
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = pdfScales.get(load.id) || 1.0

    // Set canvas size based on scale
    const baseWidth = 612
    const baseHeight = 792
    canvas.width = baseWidth * scale
    canvas.height = baseHeight * scale
    canvas.style.width = Math.min(550, baseWidth * scale) + "px"
    canvas.style.height = "auto"

    // Scale the context
    ctx.scale(scale, scale)

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, baseWidth, baseHeight)

    // Header section
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 28px Arial"
    ctx.textAlign = "center"
    ctx.fillText("RATE CONFIRMATION", baseWidth / 2, 50)

    // Company info
    ctx.font = "18px Arial"
    ctx.fillText("TFI Transportation Services", baseWidth / 2, 85)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("123 Logistics Way, Transport City, TX 75001", baseWidth / 2, 105)
    ctx.fillText("Phone: (555) 123-4567 | Email: dispatch@tfi.com", baseWidth / 2, 125)

    // Reset text alignment
    ctx.textAlign = "left"

    // Horizontal line
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 150)
    ctx.lineTo(562, 150)
    ctx.stroke()

    // Load information section
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("LOAD INFORMATION", 50, 180)

    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const loadInfo = [
      `Load Number: ${load.load_number || "N/A"}`,
      `Reference: ${load.reference_number || "N/A"}`,
      `Customer: ${getCustomerDisplay(load.customer)}`,
      `Rate: ${formatCurrency(load.rate)}`,
      `Commodity: ${load.commodity || "General Freight"}`,
      `Weight: ${load.weight ? load.weight + " lbs" : "N/A"}`,
    ]

    loadInfo.forEach((info, index) => {
      ctx.fillText(info, 50, 210 + index * 25)
    })

    // Pickup information section
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("PICKUP INFORMATION", 50, 380)

    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const pickupInfo = [
      `Location: ${load.pickup_city || "N/A"}, ${load.pickup_state || "N/A"}`,
      `Address: ${load.pickup_address || "N/A"}`,
      `Date: ${load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : "N/A"}`,
      `Time: ${load.pickup_time || "N/A"}`,
      `Contact: ${load.pickup_contact_name || "N/A"}`,
      `Phone: ${load.pickup_contact_phone || "(555) 123-4567"}`,
    ]

    pickupInfo.forEach((info, index) => {
      ctx.fillText(info, 50, 410 + index * 25)
    })

    // Delivery information section
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.fillText("DELIVERY INFORMATION", 50, 570)

    ctx.font = "14px Arial"
    ctx.fillStyle = "#374151"
    const deliveryInfo = [
      `Location: ${load.delivery_city || "N/A"}, ${load.delivery_state || "N/A"}`,
      `Address: ${load.delivery_address || "N/A"}`,
      `Date: ${load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "N/A"}`,
      `Time: ${load.delivery_time || "N/A"}`,
      `Contact: ${load.delivery_contact_name || "N/A"}`,
      `Phone: ${load.delivery_contact_phone || "(555) 987-6543"}`,
    ]

    deliveryInfo.forEach((info, index) => {
      ctx.fillText(info, 50, 600 + index * 25)
    })

    // Footer section
    ctx.fillStyle = "#059669"
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`TOTAL RATE: ${formatCurrency(load.rate)}`, baseWidth / 2, 730)

    ctx.font = "12px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("This rate confirmation is valid for 24 hours from the time of issue.", baseWidth / 2, 755)
    ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, baseWidth / 2, 775)

    // Add border
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(25, 25, baseWidth - 50, baseHeight - 50)

    // Mark as loaded
    setPdfLoaded((prev) => new Map(prev).set(load.id, true))
    setTotalPages((prev) => new Map(prev).set(load.id, 1))
    setCurrentPages((prev) => new Map(prev).set(load.id, 1))

    console.log(`Fallback document rendered for load ${load.id}`)
  }

  const handlePdfZoom = async (loadId: string, newScale: number) => {
    setPdfScales((prev) => new Map(prev).set(loadId, newScale))
    const currentPage = currentPages.get(loadId) || 1

    // Check if we have a real PDF or fallback
    const pdfDoc = pdfDocRefs.current.get(loadId)
    if (pdfDoc) {
      await renderPdfPage(loadId, currentPage)
    } else {
      const load = loads.find((l) => l.id === loadId)
      if (load) {
        await renderFallbackDocument(load)
      }
    }
  }

  const handlePageChange = async (loadId: string, direction: "next" | "previous") => {
    const currentPage = currentPages.get(loadId) || 1
    const totalPagesForLoad = totalPages.get(loadId) || 1

    let newPage = currentPage
    if (direction === "next" && currentPage < totalPagesForLoad) {
      newPage = currentPage + 1
    } else if (direction === "previous" && currentPage > 1) {
      newPage = currentPage - 1
    } else {
      return // No change needed
    }

    await renderPdfPage(loadId, newPage)
  }

  const handleDownloadPDF = (load: any) => {
    // First try to download the original PDF if available
    if (load.rate_confirmation_pdf_id && window.tempDocumentStorage) {
      const pdfDocument = window.tempDocumentStorage.get(load.rate_confirmation_pdf_id)
      if (pdfDocument && pdfDocument.blobUrl) {
        // Create a download link for the original PDF
        const a = document.createElement("a")
        a.href = pdfDocument.blobUrl
        a.download = `rate-confirmation-${load.reference_number || load.load_number}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }
    }

    // Fallback to canvas download
    const canvas = canvasRefs.current.get(load.id)
    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rate-confirmation-${load.reference_number || load.load_number}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New", variant: "secondary" as const },
      assigned: { label: "Assigned", variant: "default" as const },
      accepted: { label: "Accepted", variant: "default" as const },
      refused: { label: "Refused", variant: "destructive" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return "$0.00"
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (isNaN(numAmount)) return "$0.00"

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount)
  }

  const getCustomerDisplay = (customer: any): string => {
    if (!customer) return "Unknown Customer"

    // Handle if customer is a string (customer name directly)
    if (typeof customer === "string") {
      return customer
    }

    // Handle if customer is an object
    if (typeof customer === "object") {
      // Try different possible field names
      const name = customer.name || customer.company_name || customer.customer_name
      if (typeof name === "string") {
        return name
      }
      // If no valid string name found, return default
      return "Unknown Customer"
    }

    return "Unknown Customer"
  }

  const getCustomerContact = (customer: any): string => {
    if (!customer || typeof customer !== "object") return ""

    const contact = customer.contact_name || customer.contact_person || customer.contact
    if (typeof contact === "string") {
      return contact
    }

    return ""
  }

  const getDriverDisplay = (loadDrivers: any): string => {
    if (!loadDrivers) return "Unassigned"

    // Ensure loadDrivers is an array
    const driversArray = Array.isArray(loadDrivers) ? loadDrivers : []

    if (driversArray.length === 0) return "Unassigned"

    const driverNames = driversArray.map((assignment: any) => {
      if (!assignment) return "Unknown Driver"

      let driverName = "Unknown Driver"

      // Handle if driver is a string directly
      if (typeof assignment.driver === "string") {
        driverName = assignment.driver
      }
      // Handle if driver is an object
      else if (assignment.driver && typeof assignment.driver === "object") {
        driverName = assignment.driver.name || "Unknown Driver"
      }

      const isPrimary = assignment.is_primary ? " (Primary)" : ""
      return `${driverName}${isPrimary}`
    })

    return driverNames.join(", ")
  }

  const handleAssignDriver = (load: any) => {
    setAssignDriverModal({ isOpen: true, load })
  }

  const handleUpdateStatus = (load: any, newStatus: string) => {
    console.log("Update status:", load.id, newStatus)
    onUpdateStatus?.(load.id, newStatus)
  }

  const handleCloseAssignDriver = () => {
    setAssignDriverModal({ isOpen: false, load: null })
  }

  const handleDriverAssigned = (loadId: string, driverId: string) => {
    console.log("Driver assigned:", loadId, driverId)
    onAssignDriver?.(loadId, driverId)
    handleCloseAssignDriver()
  }

  const renderExpandedContent = (load: any) => {
    const isActive = isActiveLoad(load.status)

    // Always show Rate Confirmation tab for active loads
    const showRateConfirmation = isActive

    // Get PDF reference number for display
    const pdfRefNumber = load.reference_number || load.load_number || "PDF"

    // Check if we have an uploaded PDF
    const hasUploadedPdf =
      load.rate_confirmation_pdf_id &&
      window.tempDocumentStorage?.get(load.rate_confirmation_pdf_id) &&
      pdfLoaded.get(load.id) && // Ensure it's actually loaded, not just referenced
      !pdfErrors.get(load.id) // And no errors during loading
    return (
      <TableRow>
        <TableCell colSpan={10} className="p-0">
          <div className="border-t bg-muted/30">
            <Tabs defaultValue={showRateConfirmation ? "rate-confirmation" : "load-details"} className="w-full">
              <div className="px-6 pt-4">
                <TabsList
                  className="grid w-full"
                  style={{ gridTemplateColumns: showRateConfirmation ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }}
                >
                  {showRateConfirmation && <TabsTrigger value="rate-confirmation">Rate Confirmation</TabsTrigger>}
                  <TabsTrigger value="load-details">Load Details</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
              </div>

              {showRateConfirmation && (
                <TabsContent value="rate-confirmation" className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PDF Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                        <Badge variant="outline">{formatCurrency(load.rate)}</Badge>
                        {hasUploadedPdf && <Badge variant="secondary">Original PDF</Badge>}
                        {!hasUploadedPdf && <Badge variant="outline">Generated</Badge>}
                      </div>
                      <div className="border rounded-lg bg-white min-h-[400px] flex flex-col">
                        {/* PDF Header */}
                        <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              Rate Confirmation - {pdfRefNumber}
                            </span>
                            {pdfErrors.get(load.id) && (
                              <AlertCircle className="h-4 w-4 text-amber-500" title={pdfErrors.get(load.id)} />
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(load)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>

                        {/* PDF Canvas Container */}
                        <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ maxHeight: "600px" }}>
                          <div className="flex justify-center min-h-full">
                            {/* Loading indicator */}
                            {!pdfLoaded.get(load.id) && (
                              <div className="flex items-center justify-center w-full h-96 bg-white border border-gray-300 rounded">
                                <div className="text-center">
                                  <Loader2 className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-spin" />
                                  <p className="text-sm text-gray-500">
                                    {hasUploadedPdf ? "Loading uploaded PDF..." : "Generating document..."}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Canvas for PDF rendering */}
                            <canvas
                              ref={(el) => {
                                if (el) canvasRefs.current.set(load.id, el)
                              }}
                              className={`border border-gray-300 shadow-lg bg-white rounded ${
                                !pdfLoaded.get(load.id) ? "hidden" : ""
                              }`}
                              style={{
                                maxWidth: "100%",
                                height: "auto",
                              }}
                            />
                          </div>
                        </div>

                        {/* PDF Controls */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(load.id, "previous")}
                              disabled={!pdfLoaded.get(load.id) || (currentPages.get(load.id) || 1) <= 1}
                            >
                              Previous
                            </Button>
                            <span className="text-xs px-2">
                              Page {currentPages.get(load.id) || 1} of {totalPages.get(load.id) || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(load.id, "next")}
                              disabled={
                                !pdfLoaded.get(load.id) ||
                                (currentPages.get(load.id) || 1) >= (totalPages.get(load.id) || 1)
                              }
                            >
                              Next
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePdfZoom(load.id, Math.max(0.5, (pdfScales.get(load.id) || 1) - 0.25))
                              }
                              disabled={!pdfLoaded.get(load.id)}
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-xs px-3 py-1 bg-white border rounded">
                              {Math.round((pdfScales.get(load.id) || 1) * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePdfZoom(load.id, Math.min(3, (pdfScales.get(load.id) || 1) + 0.25))}
                              disabled={!pdfLoaded.get(load.id)}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Load Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Load Summary</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Load ID / Reference</label>
                            <p className="font-medium">
                              {load.load_number || `LOAD-${String(load.id || "").slice(-6)}`}
                            </p>
                            {load.reference_number && (
                              <p className="text-sm text-muted-foreground">REF: {load.reference_number}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Broker/Customer</label>
                            <p className="font-medium">{getCustomerDisplay(load.customer)}</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Origin Name & Address</label>
                          <p className="font-medium">{load.pickup_location || "Pickup Location"}</p>
                          <p className="text-sm">
                            {load.pickup_address || `${load.pickup_city || "N/A"}, ${load.pickup_state || "N/A"}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Pickup Date & Time</label>
                            <p>{formatDateTime(load.pickup_date)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Pickup Number (PU#)</label>
                            <p>{load.pickup_number || "N/A"}</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Destination Name & Address
                          </label>
                          <p className="font-medium">{load.delivery_location || "Delivery Location"}</p>
                          <p className="text-sm">
                            {load.delivery_address || `${load.delivery_city || "N/A"}, ${load.delivery_state || "N/A"}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Delivery Date & Time</label>
                            <p>{formatDateTime(load.delivery_date)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Delivery Number (DEL#)</label>
                            <p>{load.delivery_number || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="load-details" className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Route Information
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Pickup</span>
                        </div>
                        <p className="text-sm">
                          {load.pickup_city}, {load.pickup_state}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(load.pickup_date)}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium">Delivery</span>
                        </div>
                        <p className="text-sm">
                          {load.delivery_city}, {load.delivery_state}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(load.delivery_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Load Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Commodity</label>
                        <p>{load.commodity || "General Freight"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Weight</label>
                        <p>{load.weight ? `${load.weight} lbs` : "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rate</label>
                        <p className="font-semibold text-green-600">{formatCurrency(load.rate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div>{getStatusBadge(load.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="communication" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Communication
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Shipper Contact</h4>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <User className="h-4 w-4 inline mr-2" />
                          {getCustomerContact(load.customer) || "Contact Name"}
                        </p>
                        <p className="text-sm">
                          <Phone className="h-4 w-4 inline mr-2" />
                          555-123-4567
                        </p>
                        <p className="text-sm">
                          <Mail className="h-4 w-4 inline mr-2" />
                          contact@example.com
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Consignee Contact</h4>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <User className="h-4 w-4 inline mr-2" />
                          Consignee Name
                        </p>
                        <p className="text-sm">
                          <Phone className="h-4 w-4 inline mr-2" />
                          555-987-6543
                        </p>
                        <p className="text-sm">
                          <Mail className="h-4 w-4 inline mr-2" />
                          consignee@example.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Load Timeline
                  </h3>
                  <div className="space-y-3">
                    {load.status === "completed" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-green-800">Delivered</p>
                            <p className="text-sm text-green-600">{formatDateTime(load.updated_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Departed Pickup</p>
                            <p className="text-sm text-muted-foreground">Previous status update</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <div>
                            <p className="font-medium">Arrived at Pickup</p>
                            <p className="text-sm text-muted-foreground">Load started</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Timeline will be updated as the load progresses</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading loads...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Loads ({filteredLoads.length})</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search loads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLoads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loads.length === 0 ? "No loads found. Create your first load!" : "No loads match your search criteria."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Load #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.map((load) => (
                  <>
                    <TableRow
                      key={load.id}
                      className={`${isActiveLoad(load.status) ? "cursor-pointer hover:bg-muted/50" : ""}`}
                      onClick={() => toggleRowExpansion(load.id, load.status)}
                    >
                      <TableCell>
                        {isActiveLoad(load.status) && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {expandedRows.has(load.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {load.load_number || `LOAD-${String(load.id || "").slice(-6)}`}
                        {load.reference_number && (
                          <div className="text-xs text-muted-foreground">Ref: {load.reference_number}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getCustomerDisplay(load.customer)}</div>
                          <div className="text-xs text-muted-foreground">{getCustomerContact(load.customer)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            {load.pickup_city}, {load.pickup_state}
                          </span>
                          <span className="text-xs">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            {load.delivery_city}, {load.delivery_state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(load.pickup_date)}</TableCell>
                      <TableCell>{formatDate(load.delivery_date)}</TableCell>
                      <TableCell>{getStatusBadge(load.status)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(load.rate)}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">{getDriverDisplay(load.load_drivers)}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpen("load-details", { load })
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssignDriver(load)
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Driver
                            </DropdownMenuItem>
                            {load.status !== "completed" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateStatus(load, "completed")
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {load.status === "new" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateStatus(load, "cancelled")
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Load
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(load.id) && renderExpandedContent(load)}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {assignDriverModal.isOpen && (
        <AssignDriverModal
          isOpen={assignDriverModal.isOpen}
          onClose={handleCloseAssignDriver}
          onAssign={handleDriverAssigned}
          load={assignDriverModal.load}
        />
      )}
    </Card>
  )
}
