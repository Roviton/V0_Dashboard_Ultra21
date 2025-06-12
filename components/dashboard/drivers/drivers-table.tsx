"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Phone,
  X,
  Eye,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getDrivers, updateDriverStatus, updateDriverMessaging, deleteDriver } from "@/actions/driver-actions"
import { DriverProfileModal } from "./driver-profile-modal"

// Define the Driver type based on our database schema
export type Driver = {
  id: string
  name: string
  email?: string
  phone?: string
  date_of_birth?: string
  address_line_1?: string
  city?: string
  state?: string
  status: "available" | "on_duty" | "off_duty" | "on_break"
  driver_type: string
  license_number?: string
  equipment_preferences?: string[]
  truck_number?: string
  trailer_number?: string
  hire_date?: string
  notes?: string
  avatar_url?: string
  driver_performance?: Array<{
    total_miles: number
    total_revenue: number
    total_loads: number
    on_time_delivery_rate: number
    load_acceptance_rate: number
    average_rpm: number
  }>
  driver_messaging?: Array<{
    telegram_enabled: boolean
    whatsapp_enabled: boolean
    sms_enabled: boolean
    email_enabled: boolean
  }>
  driver_documents?: Array<{
    id: string
    document_type: string
    expiration_date?: string
    status: string
  }>
}

// Status badge component
function StatusBadge({ status }: { status: Driver["status"] }) {
  const statusConfig = {
    available: {
      variant: "outline" as const,
      label: "Available",
      className: "border-green-500 text-green-700 bg-green-50",
    },
    on_duty: { variant: "default" as const, label: "On Duty", className: "bg-blue-500 text-white" },
    off_duty: { variant: "secondary" as const, label: "Off Duty", className: "bg-gray-500 text-white" },
    on_break: { variant: "secondary" as const, label: "On Break", className: "bg-yellow-500 text-white" },
  }

  const config = statusConfig[status] || statusConfig.off_duty

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

// Messaging Integration component
function MessagingIntegration({
  driver,
  onUpdate,
}: {
  driver: Driver
  onUpdate: (driverId: string, platform: string, value: boolean) => void
}) {
  const messaging = driver.driver_messaging?.[0] || {
    telegram_enabled: false,
    whatsapp_enabled: false,
    sms_enabled: true,
    email_enabled: true,
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span className="text-sm font-medium">Telegram</span>
        </div>
        <div className="flex items-center gap-2">
          {messaging.telegram_enabled ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <X className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          )}
          <Switch
            checked={messaging.telegram_enabled}
            onCheckedChange={(checked) => onUpdate(driver.id, "telegram_enabled", checked)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-500"
          >
            <path d="M3.51 12.84a1 1 0 0 0-.32.76v3a1 1 0 0 0 1 1h1.62a10 10 0 0 0 4.13-1.5" />
            <path d="M12.06 11.27a10 10 0 0 0 1.88-4.77v-.5a1 1 0 0 0-1-1h-3a1 1 0 0 0-.76.32" />
            <path d="M12.01 22a10 10 0 0 0 7.99-10" />
            <path d="M16.01 18a1 1 0 0 0 1-1v-1.62a10 10 0 0 0-1.17-4.2" />
            <path d="m9 16 3.5 3.5L21 11" />
          </svg>
          <span className="text-sm font-medium">WhatsApp</span>
        </div>
        <div className="flex items-center gap-2">
          {messaging.whatsapp_enabled ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <X className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          )}
          <Switch
            checked={messaging.whatsapp_enabled}
            onCheckedChange={(checked) => onUpdate(driver.id, "whatsapp_enabled", checked)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="text-sm font-medium">SMS</span>
        </div>
        <div className="flex items-center gap-2">
          {messaging.sms_enabled ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <X className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          )}
          <Switch
            checked={messaging.sms_enabled}
            onCheckedChange={(checked) => onUpdate(driver.id, "sms_enabled", checked)}
          />
        </div>
      </div>
    </div>
  )
}

// Performance Metrics component
function PerformanceMetrics({ driver }: { driver: Driver }) {
  const performance = driver.driver_performance?.[0]

  if (!performance) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No performance data available</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Miles</div>
            <div className="mt-1 text-2xl font-bold">{formatNumber(performance.total_miles)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(performance.total_revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Loads</div>
            <div className="mt-1 text-2xl font-bold">{performance.total_loads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Average RPM</div>
            <div className="mt-1 text-2xl font-bold">${performance.average_rpm.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium">On-Time Delivery</div>
            <div className="text-sm font-medium">{performance.on_time_delivery_rate}%</div>
          </div>
          <Progress value={performance.on_time_delivery_rate} className="h-2" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium">Load Acceptance Rate</div>
            <div className="text-sm font-medium">{performance.load_acceptance_rate}%</div>
          </div>
          <Progress value={performance.load_acceptance_rate} className="h-2" />
        </div>
      </div>
    </div>
  )
}

export function DriversTable() {
  const [data, setData] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { toast } = useToast()

  // Load drivers data
  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      const result = await getDrivers()
      if (result.success) {
        setData(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error("Error loading drivers:", error)
      setData([]) // Set empty array on error
      toast({
        title: "Error loading drivers",
        description: error.message || "Failed to load drivers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle messaging integration update
  const handleMessagingUpdate = useCallback(
    async (driverId: string, platform: string, value: boolean) => {
      try {
        const result = await updateDriverMessaging(driverId, { [platform]: value })
        if (result.success) {
          // Update local state immediately for better UX
          setData((prevData) =>
            prevData.map((driver) =>
              driver.id === driverId
                ? {
                    ...driver,
                    driver_messaging: [
                      {
                        ...driver.driver_messaging?.[0],
                        [platform]: value,
                      },
                    ],
                  }
                : driver,
            ),
          )

          toast({
            title: value ? "Integration connected" : "Integration disconnected",
            description: `${platform.replace("_enabled", "").charAt(0).toUpperCase() + platform.replace("_enabled", "").slice(1)} has been ${
              value ? "connected" : "disconnected"
            } for this driver`,
          })
        } else {
          throw new Error(result.error)
        }
      } catch (error: any) {
        toast({
          title: "Error updating messaging",
          description: error.message,
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Handle status update
  const handleStatusUpdate = async (driverId: string, newStatus: string) => {
    try {
      const result = await updateDriverStatus(driverId, newStatus)
      if (result.success) {
        await loadDrivers() // Reload data
        toast({
          title: "Status updated",
          description: "Driver status has been updated successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle driver deletion
  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deleteDriver(driverId)
      if (result.success) {
        await loadDrivers() // Reload data
        toast({
          title: "Driver deleted",
          description: "Driver has been removed from your fleet",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error deleting driver",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Driver
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const driver = row.original
        const initials = driver.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={driver.avatar_url || "/placeholder.svg"} alt={driver.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{driver.name}</div>
              <div className="text-xs text-muted-foreground">{driver.id.slice(0, 8)}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const driver = row.original
        return <div>{driver.city && driver.state ? `${driver.city}, ${driver.state}` : "Not provided"}</div>
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="space-y-1">
            {driver.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{driver.phone}</span>
              </div>
            )}
            {driver.email && <div className="text-xs text-muted-foreground">{driver.email}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "driver_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("driver_type") as string
        return (
          <Badge variant="outline">
            {type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Company"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "equipment",
      header: "Equipment",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="text-sm">
            {driver.truck_number && <div>Truck: {driver.truck_number}</div>}
            {driver.trailer_number && (
              <div className="text-xs text-muted-foreground">Trailer: {driver.trailer_number}</div>
            )}
            {!driver.truck_number && !driver.trailer_number && (
              <span className="text-muted-foreground">Not assigned</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "performance",
      header: "Performance",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                View Metrics
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              <div className="space-y-4 p-2">
                <h4 className="font-medium">Performance Metrics</h4>
                <PerformanceMetrics driver={driver} />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      accessorKey: "messaging",
      header: "Messaging",
      cell: ({ row }) => {
        const driver = row.original
        const messaging = driver.driver_messaging?.[0]
        const connectedCount = messaging ? Object.values(messaging).filter(Boolean).length : 1 // Default SMS enabled
        const totalPlatforms = 4 // telegram, whatsapp, sms, email

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>
                  {connectedCount}/{totalPlatforms}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4 p-2">
                <h4 className="font-medium">Messaging Integrations</h4>
                <MessagingIntegration driver={driver} onUpdate={handleMessagingUpdate} />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDriverId(driver.id)
                  setShowProfileModal(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver.id)}>
                Copy driver ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusUpdate(driver.id, "available")}>
                Set Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(driver.id, "off_duty")}>
                Set Off Duty
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteDriver(driver.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Driver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((driver) => {
      // Apply status filter
      if (statusFilter.length > 0 && !statusFilter.includes(driver.status)) {
        return false
      }

      // Apply global filter (search)
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase()
        return (
          driver.name.toLowerCase().includes(searchTerm) ||
          driver.id.toLowerCase().includes(searchTerm) ||
          driver.email?.toLowerCase().includes(searchTerm) ||
          driver.phone?.toLowerCase().includes(searchTerm) ||
          `${driver.city}, ${driver.state}`.toLowerCase().includes(searchTerm) ||
          false
        )
      }

      return true
    })
  }, [data, statusFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search drivers..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Status
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("available")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "available"] : prev.filter((s) => s !== "available")))
                }}
              >
                Available
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("on_duty")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "on_duty"] : prev.filter((s) => s !== "on_duty")))
                }}
              >
                On Duty
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("off_duty")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "off_duty"] : prev.filter((s) => s !== "off_duty")))
                }}
              >
                Off Duty
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("on_break")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "on_break"] : prev.filter((s) => s !== "on_break")))
                }}
              >
                On Break
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter([])} className="justify-center text-center">
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                View
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Table Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "name" ? "Driver" : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No drivers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} driver(s) total
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Driver Profile Modal */}
      <DriverProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedDriverId(null)
        }}
        driverId={selectedDriverId}
      />
    </div>
  )
}
