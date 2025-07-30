"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  User,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface Load {
  id: string
  load_number?: string | null
  reference_number?: string | null
  customer?: any | null // Can be string or object
  pickup_city?: string | null
  pickup_state?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  pickup_address?: string | null
  pickup_location?: string | null
  pickup_number?: string | null
  pickup_contact_name?: string | null
  pickup_contact_phone?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_address?: string | null
  delivery_location?: string | null
  delivery_number?: string | null
  delivery_contact_name?: string | null
  delivery_contact_phone?: string | null
  status: string
  rate?: number | string | null
  commodity?: string | null
  weight?: number | null
  miles?: number | null
  load_drivers?: any[] | null // Array of driver assignments
  rate_confirmation_pdf_url?: string | null
  rate_confirmation_pdf_id?: string | null // Legacy
  // Add other fields as necessary
}

interface LoadsDataTableProps {
  loads: Load[]
  loading?: boolean
  error?: string | null
  onUpdateStatus?: (loadId: string, status: string) => void
  onAssignDriver?: (loadId: string, driverId: string) => void // Assuming this is handled by modal
  isDashboard?: boolean
}

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any
    tempDocumentStorage?: Map<string, { blobUrl: string; fileName: string }>
  }
}

export function LoadsDataTable({
  loads = [],
  loading = false,
  error = null,
  onUpdateStatus,
  // onAssignDriver, // This will be handled by the modal
  isDashboard = false,
}: LoadsDataTableProps) {
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
  const [sorting, setSorting] = useState<SortingState>([])

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

  const isActiveLoad = (status: string) => {
    return ["new", "assigned", "accepted", "in_progress"].includes(status)
  }

  const toggleRowExpansion = (loadId: string, status: string) => {
    if (!isActiveLoad(status) && !expandedRows.has(loadId)) return // Prevent expanding non-active unless already expanded

    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(loadId)) {
      newExpandedRows.delete(loadId)
    } else {
      newExpandedRows.add(loadId)
      const load = loads.find((l) => l.id === loadId)
      if (load) {
        // Only load PDF if it's an active load and has PDF capability
        if (isActiveLoad(load.status)) {
          setTimeout(() => loadPdfForLoad(load), 100)
        }
      }
    }
    setExpandedRows(newExpandedRows)
  }

  const loadPdfForLoad = async (load: Load) => {
    if (!load) return

    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id
    const canvas = canvasRefs.current.get(load.id)

    if (!canvas) {
      console.log(`Canvas for load ${load.id} not ready, will retry or skip PDF rendering.`)
      // Optionally, set a state to retry or inform the user
      return
    }

    setPdfLoaded((prev) => new Map(prev).set(load.id, false))
    setPdfErrors((prev) => new Map(prev).set(load.id, ""))
    setPdfScales((prev) => new Map(prev).set(load.id, 1.0))
    setCurrentPages((prev) => new Map(prev).set(load.id, 1))

    if (!pdfUrl) {
      console.log("No PDF URL for load:", load.id, "Rendering fallback.")
      await renderFallbackDocument(load)
      return
    }

    if (!window.pdfjsLib) {
      console.error("PDF.js not loaded. Rendering fallback.")
      await renderFallbackDocument(load)
      return
    }

    try {
      let pdfData: Uint8Array
      if (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("http")) {
        // Handle blob URLs from temp storage or direct HTTP URLs
        const response = await fetch(pdfUrl)
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`)
        const arrayBuffer = await response.arrayBuffer()
        pdfData = new Uint8Array(arrayBuffer)
      } else if (typeof window !== "undefined" && window.tempDocumentStorage) {
        // Legacy temp storage ID
        const tempDoc = window.tempDocumentStorage.get(pdfUrl)
        if (tempDoc && tempDoc.blobUrl) {
          const response = await fetch(tempDoc.blobUrl)
          if (!response.ok) throw new Error(`Failed to fetch PDF from temp storage: ${response.statusText}`)
          const arrayBuffer = await response.arrayBuffer()
          pdfData = new Uint8Array(arrayBuffer)
        } else {
          throw new Error("PDF document not found in temp storage")
        }
      } else {
        throw new Error("Unsupported PDF URL format or temp storage not available")
      }

      const loadingTask = window.pdfjsLib.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise
      pdfDocRefs.current.set(load.id, pdf)
      setTotalPages((prev) => new Map(prev).set(load.id, pdf.numPages))
      await renderPdfPage(load.id, 1)
    } catch (error: any) {
      console.error(`Error loading PDF for load ${load.id}:`, error)
      setPdfErrors((prev) => new Map(prev).set(load.id, error.message || "Failed to load PDF"))
      await renderFallbackDocument(load)
      toast({
        title: "PDF Loading Error",
        description: "Could not load PDF. Showing generated document.",
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
      const page = await pdfDoc.getPage(pageNumber)
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Could not get canvas context")

      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = canvas.parentElement?.clientWidth || 550 // Use parent width for better fit
      const fitScale = Math.min(containerWidth / viewport.width, scale) // Adjust scale to fit container
      const scaledViewport = page.getViewport({ scale: fitScale })

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.height = scaledViewport.height * devicePixelRatio
      canvas.width = scaledViewport.width * devicePixelRatio
      canvas.style.width = `${scaledViewport.width}px`
      canvas.style.height = `${scaledViewport.height}px`
      context.scale(devicePixelRatio, devicePixelRatio)

      context.clearRect(0, 0, canvas.width, canvas.height)
      const renderContext = { canvasContext: context, viewport: scaledViewport }
      await page.render(renderContext).promise

      setCurrentPages((prev) => new Map(prev).set(loadId, pageNumber))
      setPdfLoaded((prev) => new Map(prev).set(loadId, true))
      setPdfErrors((prev) => new Map(prev).set(loadId, ""))
    } catch (error: any) {
      console.error(`Error rendering PDF page for load ${loadId}:`, error)
      setPdfLoaded((prev) => new Map(prev).set(loadId, false))
      setPdfErrors((prev) => new Map(prev).set(loadId, error.message || "Failed to render PDF"))
    }
  }

  const renderFallbackDocument = async (load: Load) => {
    const canvas = canvasRefs.current.get(load.id)
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = pdfScales.get(load.id) || 1.0
    const baseWidth = 612
    const baseHeight = 792
    canvas.width = baseWidth * scale
    canvas.height = baseHeight * scale
    canvas.style.width = `${Math.min(canvas.parentElement?.clientWidth || 550, baseWidth * scale)}px`
    canvas.style.height = "auto"

    ctx.scale(scale, scale)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, baseWidth, baseHeight)

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 28px Arial"
    ctx.textAlign = "center"
    ctx.fillText("RATE CONFIRMATION", baseWidth / 2, 50)
    ctx.font = "18px Arial"
    ctx.fillText("TFI Transportation Services", baseWidth / 2, 85)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("123 Logistics Way, Transport City, TX 75001", baseWidth / 2, 105)
    ctx.fillText("Phone: (555) 123-4567 | Email: dispatch@tfi.com", baseWidth / 2, 125)

    ctx.textAlign = "left"
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 150)
    ctx.lineTo(562, 150)
    ctx.stroke()

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
    loadInfo.forEach((info, index) => ctx.fillText(info, 50, 210 + index * 25))

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
    pickupInfo.forEach((info, index) => ctx.fillText(info, 50, 410 + index * 25))

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
    deliveryInfo.forEach((info, index) => ctx.fillText(info, 50, 600 + index * 25))

    ctx.fillStyle = "#059669"
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`TOTAL RATE: ${formatCurrency(load.rate)}`, baseWidth / 2, 730)
    ctx.font = "12px Arial"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("This rate confirmation is valid for 24 hours.", baseWidth / 2, 755)
    ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, baseWidth / 2, 775)

    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(25, 25, baseWidth - 50, baseHeight - 50)

    setPdfLoaded((prev) => new Map(prev).set(load.id, true))
    setTotalPages((prev) => new Map(prev).set(load.id, 1))
    setCurrentPages((prev) => new Map(prev).set(load.id, 1))
  }

  const handlePdfZoom = async (loadId: string, newScale: number) => {
    setPdfScales((prev) => new Map(prev).set(loadId, newScale))
    const currentPage = currentPages.get(loadId) || 1
    const pdfDoc = pdfDocRefs.current.get(loadId)
    if (pdfDoc) await renderPdfPage(loadId, currentPage)
    else {
      const load = loads.find((l) => l.id === loadId)
      if (load) await renderFallbackDocument(load)
    }
  }

  const handlePageChange = async (loadId: string, direction: "next" | "previous") => {
    const currentPage = currentPages.get(loadId) || 1
    const total = totalPages.get(loadId) || 1
    let newPage = currentPage
    if (direction === "next" && currentPage < total) newPage = currentPage + 1
    else if (direction === "previous" && currentPage > 1) newPage = currentPage - 1
    else return
    await renderPdfPage(loadId, newPage)
  }

  const handleDownloadPDF = (load: Load) => {
    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id
    if (pdfUrl && (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("http"))) {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.download = `rate-confirmation-${load.reference_number || load.load_number}.pdf`
      a.target = "_blank" // Open in new tab for direct URLs to avoid issues
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }
    if (pdfUrl && typeof window !== "undefined" && window.tempDocumentStorage) {
      const tempDoc = window.tempDocumentStorage.get(pdfUrl)
      if (tempDoc && tempDoc.blobUrl) {
        const a = document.createElement("a")
        a.href = tempDoc.blobUrl
        a.download = `rate-confirmation-${load.reference_number || load.load_number}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }
    }
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

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    } catch {
      // MM/DD/YYYY
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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numAmount)
  }

  const getCustomerDisplay = (customer: any): string => {
    if (!customer) return "N/A"
    if (typeof customer === "string") return customer
    if (typeof customer === "object") return customer.name || customer.company_name || customer.customer_name || "N/A"
    return "N/A"
  }

  const getCustomerSubDisplay = (customer: any): string => {
    // For the second line in customer cell, could be same as main or a different detail
    if (!customer) return ""
    if (typeof customer === "string") return customer // Or an empty string if it's meant to be different
    if (typeof customer === "object") return customer.name || customer.company_name || customer.customer_name || ""
    return ""
  }

  const getDriverDisplay = (loadDrivers: any[] | null | undefined): string => {
    if (!loadDrivers || loadDrivers.length === 0) return "Unassigned"
    return loadDrivers.map((ld) => ld.driver?.name || "Unknown").join(", ")
  }

  const columns: ColumnDef<Load>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const load = row.original
        const canExpand = isActiveLoad(load.status) || expandedRows.has(load.id)
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(load.id, load.status)}
            disabled={!canExpand && !isActiveLoad(load.status)} // Disable if not active and not already expanded
            className="w-8 h-8 p-0 data-[state=open]:bg-muted"
            aria-label={expandedRows.has(load.id) ? "Collapse row" : "Expand row"}
          >
            {expandedRows.has(load.id) ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "load_number",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Load # <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const load = row.original
        return (
          <div>
            <div className="font-medium">{load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`}</div>
            {load.reference_number && <div className="text-xs text-muted-foreground">Ref: {load.reference_number}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Customer <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const customer = row.original.customer
        return (
          <div>
            <div>{getCustomerDisplay(customer)}</div>
            <div className="text-xs text-muted-foreground">{getCustomerSubDisplay(customer)}</div>
          </div>
        )
      },
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => {
        const load = row.original
        return (
          <div className="flex flex-col text-sm">
            <div className="flex items-center">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              {load.pickup_city}, {load.pickup_state}
            </div>
            <div className="flex items-center">
              <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
              {load.delivery_city}, {load.delivery_state}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "pickup_date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Pickup Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.pickup_date),
    },
    {
      accessorKey: "delivery_date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Delivery Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.delivery_date),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.original.status
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"
        if (status === "new") badgeVariant = "default" // Using default for "New" as per screenshot (light gray)
        if (status === "assigned") badgeVariant = "default" // Using default for "Assigned" as per screenshot (blue)
        if (status === "completed") badgeVariant = "default"
        if (["cancelled", "refused"].includes(status)) badgeVariant = "destructive"

        // Custom styling for badges to match screenshot
        const statusStyles: Record<string, string> = {
          new: "bg-gray-200 text-gray-800 hover:bg-gray-300", // Light gray for "New"
          assigned: "bg-blue-500 text-white hover:bg-blue-600", // Blue for "Assigned"
          // Add other statuses if needed
        }

        return (
          <Badge variant={badgeVariant} className={cn("capitalize", statusStyles[status] || "")}>
            {status.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "rate",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rate <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.original.rate),
    },
    {
      accessorKey: "load_drivers",
      header: "Driver",
      cell: ({ row }) => getDriverDisplay(row.original.load_drivers),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const load = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen("loadDetailsDialog", { data: load })}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {isActiveLoad(load.status) && (
                <DropdownMenuItem onClick={() => onOpen("assignDriver", { data: load })}>
                  <User className="mr-2 h-4 w-4" /> Assign Driver
                </DropdownMenuItem>
              )}
              {load.status === "in_progress" || load.status === "assigned" || load.status === "accepted" ? (
                <DropdownMenuItem onClick={() => onUpdateStatus?.(load.id, "completed")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                </DropdownMenuItem>
              ) : null}
              {load.status !== "completed" && load.status !== "cancelled" && (
                <DropdownMenuItem onClick={() => onUpdateStatus?.(load.id, "cancelled")}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Load
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: loads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading loads...</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>Error loading loads: {error}</p>
      </div>
    )
  }

  const renderExpandedContent = (load: Load) => {
    const showRateConfirmation = isActiveLoad(load.status)
    const pdfUrl = load.rate_confirmation_pdf_url || load.rate_confirmation_pdf_id
    const hasUploadedPdf = pdfUrl && pdfLoaded.get(load.id) && !pdfErrors.get(load.id)

    return (
      <TableRow key={`${load.id}-expanded`} className="bg-muted/20 hover:bg-muted/30">
        <TableCell colSpan={columns.length} className="p-0">
          <div className="border-t">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                        <Badge variant="outline">{formatCurrency(load.rate)}</Badge>
                        {hasUploadedPdf && <Badge variant="secondary">Original PDF</Badge>}
                        {!hasUploadedPdf && !pdfErrors.get(load.id) && <Badge variant="outline">Generated</Badge>}
                        {pdfErrors.get(load.id) && <Badge variant="destructive">Error</Badge>}
                      </div>
                      <div className="border rounded-lg bg-white min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              Rate Conf - {load.reference_number || load.load_number}
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
                        <div className="flex-1 overflow-auto bg-gray-50 p-4" style={{ maxHeight: "600px" }}>
                          <div className="flex justify-center min-h-full">
                            {!pdfLoaded.get(load.id) && !pdfErrors.get(load.id) && (
                              <div className="flex items-center justify-center w-full h-96 bg-white border border-gray-300 rounded">
                                <div className="text-center">
                                  <Loader2 className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-spin" />
                                  <p className="text-sm text-gray-500">
                                    {pdfUrl ? "Loading PDF..." : "Generating document..."}
                                  </p>
                                </div>
                              </div>
                            )}
                            {pdfErrors.get(load.id) &&
                              !pdfLoaded.get(load.id) && ( // Show error if loading failed before canvas render
                                <div className="flex items-center justify-center w-full h-96 bg-white border border-gray-300 rounded text-red-500">
                                  <AlertCircle className="h-8 w-8 mr-2" /> Failed to load/render document.
                                </div>
                              )}
                            <canvas
                              ref={(el) => {
                                if (el) canvasRefs.current.set(load.id, el)
                              }}
                              className={cn(
                                "border border-gray-300 shadow-lg bg-white rounded",
                                !pdfLoaded.get(load.id) || pdfErrors.get(load.id) ? "hidden" : "",
                              )}
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                          </div>
                        </div>
                        {pdfLoaded.get(load.id) && !pdfErrors.get(load.id) && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(load.id, "previous")}
                                disabled={(currentPages.get(load.id) || 1) <= 1}
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
                                disabled={(currentPages.get(load.id) || 1) >= (totalPages.get(load.id) || 1)}
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
                              >
                                <ZoomOut className="h-3 w-3" />
                              </Button>
                              <span className="text-xs px-3 py-1 bg-white border rounded">
                                {Math.round((pdfScales.get(load.id) || 1) * 100)}%
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePdfZoom(load.id, Math.min(3, (pdfScales.get(load.id) || 1) + 0.25))
                                }
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Load Summary</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Load ID / Reference</label>
                            <p className="font-medium">
                              {load.load_number || `L-${load.id.substring(0, 8).toUpperCase()}`}
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
                {" "}
                {/* Content for Load Details */}{" "}
              </TabsContent>
              <TabsContent value="communication" className="p-6">
                {" "}
                {/* Content for Communication */}{" "}
              </TabsContent>
              <TabsContent value="timeline" className="p-6">
                {" "}
                {/* Content for Timeline */}{" "}
              </TabsContent>
            </Tabs>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={expandedRows.has(row.original.id) ? "border-b-0" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && renderExpandedContent(row.original)}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No loads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
