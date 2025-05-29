"use client"

import { useState, useRef } from "react"
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
import { ArrowUpDown, Check, ChevronDown, Filter, MessageCircle, MoreHorizontal, Phone, X } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Define the Driver type
export type Driver = {
  id: string
  name: string
  avatar: string
  phone: string
  email: string
  location: string
  status: "AVAILABLE" | "ON_DUTY" | "OFF_DUTY" | "ON_BREAK"
  licenseType: string
  experience: number // years
  joinDate: string
  performance: {
    totalMiles: number
    totalRevenue: number
    totalLoads: number
    averageRPM: number
    onTimeDelivery: number // percentage
    loadAcceptanceRate: number // percentage
  }
  messaging: {
    telegram: boolean
    whatsapp: boolean
    sms: boolean
  }
  notes?: string
}

// Sample data
const initialData: Driver[] = [
  {
    id: "D-1001",
    name: "John Smith",
    avatar: "/javascript-code.png",
    phone: "(555) 123-4567",
    email: "john.smith@example.com",
    location: "Los Angeles, CA",
    status: "AVAILABLE",
    licenseType: "Class A CDL",
    experience: 5,
    joinDate: "2022-03-15",
    performance: {
      totalMiles: 24500,
      totalRevenue: 78400,
      totalLoads: 42,
      averageRPM: 3.2,
      onTimeDelivery: 98,
      loadAcceptanceRate: 95,
    },
    messaging: {
      telegram: true,
      whatsapp: true,
      sms: true,
    },
    notes: "Prefers longer hauls. Available for weekend work with advance notice.",
  },
  {
    id: "D-1002",
    name: "Sarah Johnson",
    avatar: "/stylized-letters-sj.png",
    phone: "(555) 234-5678",
    email: "sarah.johnson@example.com",
    location: "Phoenix, AZ",
    status: "ON_DUTY",
    licenseType: "Class A CDL",
    experience: 3,
    joinDate: "2023-01-10",
    performance: {
      totalMiles: 18700,
      totalRevenue: 62300,
      totalLoads: 35,
      averageRPM: 3.33,
      onTimeDelivery: 100,
      loadAcceptanceRate: 92,
    },
    messaging: {
      telegram: true,
      whatsapp: false,
      sms: true,
    },
    notes: "Very reliable. Prefers routes in the Southwest region.",
  },
  {
    id: "D-1003",
    name: "Mike Williams",
    avatar: "/intertwined-letters.png",
    phone: "(555) 345-6789",
    email: "mike.williams@example.com",
    location: "San Diego, CA",
    status: "ON_DUTY",
    licenseType: "Class A CDL",
    experience: 7,
    joinDate: "2021-06-22",
    performance: {
      totalMiles: 31200,
      totalRevenue: 93600,
      totalLoads: 56,
      averageRPM: 3.0,
      onTimeDelivery: 95,
      loadAcceptanceRate: 98,
    },
    messaging: {
      telegram: false,
      whatsapp: true,
      sms: true,
    },
    notes: "Excellent with difficult deliveries. Has requested time off next month (June 15-22).",
  },
  {
    id: "D-1004",
    name: "Tom Davis",
    avatar: "/abstract-geometric-TD.png",
    phone: "(555) 456-7890",
    email: "tom.davis@example.com",
    location: "Las Vegas, NV",
    status: "OFF_DUTY",
    licenseType: "Class A CDL",
    experience: 2,
    joinDate: "2023-08-05",
    performance: {
      totalMiles: 12800,
      totalRevenue: 38400,
      totalLoads: 24,
      averageRPM: 3.0,
      onTimeDelivery: 92,
      loadAcceptanceRate: 90,
    },
    messaging: {
      telegram: false,
      whatsapp: false,
      sms: true,
    },
    notes: "New driver, still in training phase. Needs more experience with mountain routes.",
  },
  {
    id: "D-1005",
    name: "Lisa Brown",
    avatar: "/stylized-letter-lb.png",
    phone: "(555) 567-8901",
    email: "lisa.brown@example.com",
    location: "Denver, CO",
    status: "AVAILABLE",
    licenseType: "Class A CDL",
    experience: 4,
    joinDate: "2022-11-18",
    performance: {
      totalMiles: 19500,
      totalRevenue: 68250,
      totalLoads: 39,
      averageRPM: 3.5,
      onTimeDelivery: 97,
      loadAcceptanceRate: 94,
    },
    messaging: {
      telegram: true,
      whatsapp: true,
      sms: true,
    },
    notes: "Specializes in refrigerated loads. Very detail-oriented.",
  },
  {
    id: "D-1006",
    name: "Robert Chen",
    avatar: "/remote-control-collection.png",
    phone: "(555) 678-9012",
    email: "robert.chen@example.com",
    location: "Seattle, WA",
    status: "ON_BREAK",
    licenseType: "Class A CDL",
    experience: 6,
    joinDate: "2021-09-30",
    performance: {
      totalMiles: 28700,
      totalRevenue: 86100,
      totalLoads: 48,
      averageRPM: 3.0,
      onTimeDelivery: 96,
      loadAcceptanceRate: 97,
    },
    messaging: {
      telegram: true,
      whatsapp: false,
      sms: true,
    },
    notes: "Excellent communication skills. Prefers Pacific Northwest routes.",
  },
  {
    id: "D-1007",
    name: "Maria Garcia",
    avatar: "/abstract-geometric-mg.png",
    phone: "(555) 789-0123",
    email: "maria.garcia@example.com",
    location: "San Antonio, TX",
    status: "AVAILABLE",
    licenseType: "Class A CDL",
    experience: 8,
    joinDate: "2020-05-12",
    performance: {
      totalMiles: 35600,
      totalRevenue: 106800,
      totalLoads: 62,
      averageRPM: 3.0,
      onTimeDelivery: 99,
      loadAcceptanceRate: 96,
    },
    messaging: {
      telegram: false,
      whatsapp: true,
      sms: true,
    },
    notes: "Very experienced. Mentor for new drivers. Fluent in Spanish and English.",
  },
  {
    id: "D-1008",
    name: "David Wilson",
    avatar: "/abstract-dw.png",
    phone: "(555) 890-1234",
    email: "david.wilson@example.com",
    location: "Chicago, IL",
    status: "OFF_DUTY",
    licenseType: "Class A CDL",
    experience: 3,
    joinDate: "2023-02-28",
    performance: {
      totalMiles: 16800,
      totalRevenue: 50400,
      totalLoads: 30,
      averageRPM: 3.0,
      onTimeDelivery: 94,
      loadAcceptanceRate: 91,
    },
    messaging: {
      telegram: true,
      whatsapp: true,
      sms: false,
    },
    notes: "Often late to pickups. Needs improvement in time management.",
  },
]

// Status badge component
function StatusBadge({ status }: { status: Driver["status"] }) {
  const statusConfig = {
    AVAILABLE: { variant: "outline" as const, label: "Available" },
    ON_DUTY: { variant: "default" as const, label: "On Duty" },
    OFF_DUTY: { variant: "secondary" as const, label: "Off Duty" },
    ON_BREAK: { variant: "secondary" as const, label: "On Break" },
  }

  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Messaging Integration component
function MessagingIntegration({
  driver,
  onUpdate,
}: {
  driver: Driver
  onUpdate: (driverId: string, platform: keyof Driver["messaging"], value: boolean) => void
}) {
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
          {driver.messaging.telegram ? (
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
            checked={driver.messaging.telegram}
            onCheckedChange={(checked) => onUpdate(driver.id, "telegram", checked)}
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
          {driver.messaging.whatsapp ? (
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
            checked={driver.messaging.whatsapp}
            onCheckedChange={(checked) => onUpdate(driver.id, "whatsapp", checked)}
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
          {driver.messaging.sms ? (
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
          <Switch checked={driver.messaging.sms} onCheckedChange={(checked) => onUpdate(driver.id, "sms", checked)} />
        </div>
      </div>
    </div>
  )
}

// Performance Metrics component
function PerformanceMetrics({ driver }: { driver: Driver }) {
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
            <div className="mt-1 text-2xl font-bold">{formatNumber(driver.performance.totalMiles)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(driver.performance.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Loads</div>
            <div className="mt-1 text-2xl font-bold">{driver.performance.totalLoads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Average RPM</div>
            <div className="mt-1 text-2xl font-bold">${driver.performance.averageRPM.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium">On-Time Delivery</div>
            <div className="text-sm font-medium">{driver.performance.onTimeDelivery}%</div>
          </div>
          <Progress value={driver.performance.onTimeDelivery} className="h-2" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium">Load Acceptance Rate</div>
            <div className="text-sm font-medium">{driver.performance.loadAcceptanceRate}%</div>
          </div>
          <Progress value={driver.performance.loadAcceptanceRate} className="h-2" />
        </div>
      </div>
    </div>
  )
}

// Inline Editable Notes component
function InlineEditableNotes({
  initialValue,
  driverId,
  onSave,
}: {
  initialValue?: string
  driverId: string
  onSave: (driverId: string, notes: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const handleSave = () => {
    onSave(driverId, value)
    setIsEditing(false)
    toast({
      title: "Notes saved",
      description: "Driver notes have been updated successfully",
    })
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[100px] w-full text-sm"
          placeholder="Add notes about this driver..."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="cursor-pointer rounded-md p-2 text-sm hover:bg-muted/50" onClick={() => setIsEditing(true)}>
      {value ? value : <span className="text-muted-foreground italic">Add notes about this driver...</span>}
    </div>
  )
}

export function DriversTable() {
  const [data, setData] = useState<Driver[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const { toast } = useToast()

  // Handle messaging integration update
  const handleMessagingUpdate = (driverId: string, platform: keyof Driver["messaging"], value: boolean) => {
    setData((prevData) =>
      prevData.map((driver) =>
        driver.id === driverId
          ? {
              ...driver,
              messaging: {
                ...driver.messaging,
                [platform]: value,
              },
            }
          : driver,
      ),
    )

    toast({
      title: value ? "Integration connected" : "Integration disconnected",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} has been ${
        value ? "connected" : "disconnected"
      } for this driver`,
    })
  }

  // Handle notes update
  const handleNotesUpdate = (driverId: string, notes: string) => {
    setData((prevData) => prevData.map((driver) => (driver.id === driverId ? { ...driver, notes } : driver)))
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
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
              <AvatarFallback>
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{driver.name}</div>
              <div className="text-xs text-muted-foreground">{driver.id}</div>
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
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{driver.phone}</span>
            </div>
            <div className="text-xs text-muted-foreground">{driver.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "experience",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Experience
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const experience = row.getValue("experience") as number
        return (
          <div>
            {experience} {experience === 1 ? "year" : "years"}
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
        const connectedCount = Object.values(driver.messaging).filter(Boolean).length
        const totalPlatforms = Object.keys(driver.messaging).length

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
      accessorKey: "notes",
      header: "Manager Notes",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex w-full max-w-[200px] items-center justify-start truncate text-left",
                  !driver.notes && "text-muted-foreground",
                )}
              >
                {driver.notes ? (
                  <span className="truncate">{driver.notes}</span>
                ) : (
                  <span className="italic">Add notes...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              <div className="space-y-4 p-2">
                <h4 className="font-medium">Manager Notes</h4>
                <InlineEditableNotes initialValue={driver.notes} driverId={driver.id} onSave={handleNotesUpdate} />
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver.id)}>
                Copy driver ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Edit driver</DropdownMenuItem>
              <DropdownMenuItem>View assigned loads</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Contact driver</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply filters
  const filteredData = [...initialData].filter((driver) => {
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
        driver.location.toLowerCase().includes(searchTerm) ||
        driver.email.toLowerCase().includes(searchTerm) ||
        driver.phone.toLowerCase().includes(searchTerm) ||
        false
      )
    }

    return true
  })

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
                checked={statusFilter.includes("AVAILABLE")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "AVAILABLE"] : prev.filter((s) => s !== "AVAILABLE")))
                }}
              >
                Available
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("ON_DUTY")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "ON_DUTY"] : prev.filter((s) => s !== "ON_DUTY")))
                }}
              >
                On Duty
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("OFF_DUTY")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "OFF_DUTY"] : prev.filter((s) => s !== "OFF_DUTY")))
                }}
              >
                Off Duty
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("ON_BREAK")}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) => (checked ? [...prev, "ON_BREAK"] : prev.filter((s) => s !== "ON_BREAK")))
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
                  No results.
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
    </div>
  )
}
