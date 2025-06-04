"use client"

import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react"
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
import { ArrowUpDown, MoreHorizontal, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssignDriverModal } from "./modals/assign-driver-modal"
import { LoadDetailsModal } from "./modals/load-details-modal"
import { cn } from "@/lib/utils"
import { ExpandedLoadDetails } from "./expanded-load-details"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

// Define the Load type
export type Load = {
  id: string
  reference: string
  customer: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: "NEW" | "ASSIGNED" | "ACCEPTED" | "REFUSED" | "IN_PROGRESS" | "COMPLETED"
  driver?: {
    name: string
    avatar: string
  }
  timeline?: {
    arrivedPickup?: string
    departedPickup?: string
    arrivedDelivery?: string
    delivered?: string
  }
  rate?: string
  weight?: string
  commodity?: string
  equipment?: string
  notes?: string
  comments?: string // Manager comments field
  dispatcher?: string // Dispatcher who created the load
  createdAt?: string
  distance?: number
  rpm?: number
}

// Sample data
const initialData: Load[] = [
  {
    id: "L-1001",
    reference: "REF-12345",
    customer: "Acme Logistics",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-17",
    status: "NEW",
    createdAt: "2025-05-14T14:30:00",
    distance: 370,
    rpm: 3.2,
    dispatcher: "Sarah Johnson",
  },
  {
    id: "L-1002",
    reference: "REF-23456",
    customer: "Global Transport Inc.",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    pickupDate: "2025-05-16",
    deliveryDate: "2025-05-16",
    status: "ASSIGNED",
    driver: {
      name: "John Smith",
      avatar: "/javascript-code.png",
    },
    createdAt: "2025-05-14T12:15:00",
    distance: 180,
    rpm: 3.5,
    dispatcher: "Tom Davis",
  },
  {
    id: "L-1003",
    reference: "REF-34567",
    customer: "FastFreight Co.",
    origin: "Dallas, TX",
    destination: "Houston, TX",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-15",
    status: "ACCEPTED",
    driver: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
    },
    timeline: {
      arrivedPickup: "2025-05-15T08:30:00",
    },
    createdAt: "2025-05-14T10:45:00",
    distance: 240,
    rpm: 2.9,
    dispatcher: "Mike Reynolds",
    comments: "Driver prefers this route. Good broker relationship.",
  },
  {
    id: "L-1004",
    reference: "REF-45678",
    customer: "Prime Shipping LLC",
    origin: "Miami, FL",
    destination: "Orlando, FL",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-16",
    status: "IN_PROGRESS",
    driver: {
      name: "Mike Williams",
      avatar: "/intertwined-letters.png",
    },
    timeline: {
      arrivedPickup: "2025-05-15T09:15:00",
      departedPickup: "2025-05-15T10:30:00",
    },
    createdAt: "2025-05-14T09:20:00",
    distance: 235,
    rpm: 3.1,
    dispatcher: "Sarah Johnson",
  },
  {
    id: "L-1005",
    reference: "REF-56789",
    customer: "Acme Logistics",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    pickupDate: "2025-05-14",
    deliveryDate: "2025-05-15",
    status: "COMPLETED",
    driver: {
      name: "Tom Davis",
      avatar: "/abstract-geometric-TD.png",
    },
    timeline: {
      arrivedPickup: "2025-05-14T08:00:00",
      departedPickup: "2025-05-14T09:30:00",
      arrivedDelivery: "2025-05-15T11:00:00",
      delivered: "2025-05-15T11:45:00",
    },
    createdAt: "2025-05-13T16:30:00",
    distance: 175,
    rpm: 3.4,
    dispatcher: "Mike Reynolds",
    comments: "Excellent job. Customer was very satisfied with delivery timing.",
  },
  {
    id: "L-1006",
    reference: "REF-67890",
    customer: "Global Transport Inc.",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickupDate: "2025-05-15",
    deliveryDate: "2025-05-16",
    status: "REFUSED",
    driver: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
    },
    createdAt: "2025-05-13T14:10:00",
    distance: 520,
    rpm: 2.8,
    dispatcher: "Tom Davis",
    comments: "Rate too low for the distance. Need to negotiate better terms with this broker.",
  },
]

// Add the InlineComment component before the LoadsDataTable component definition
function InlineComment({
  comment,
  loadId,
  onSaveComment,
  isManager = false,
}: {
  comment?: string
  loadId: string
  onSaveComment: (loadId: string, comment: string) => void
  isManager?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [commentText, setCommentText] = useState(comment || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onSaveComment(loadId, commentText)
    setIsEditing(false)
    toast({
      title: "Comment saved",
      description: "Your comment has been added to this load",
    })
  }

  if (!isManager) {
    // Only show comments for non-managers if a comment exists
    return comment ? <div className="rounded-md border border-muted bg-muted/30 p-2 text-sm">{comment}</div> : null // Return null if no comment exists
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your comment..."
          className="min-h-[80px]"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCommentText(comment || "")
              setIsEditing(false)
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // If there's no comment, don't show anything
  if (!comment) return null

  // Only show if there's an actual comment
  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer rounded-md border border-muted bg-muted/30 p-2 text-sm"
    >
      {comment}
    </div>
  )
}

// Define StatusBadge and Timeline components
function StatusBadge({ status }: { status: Load["status"] }) {
  let badgeText = ""
  let badgeVariant: "new" | "assigned" | "accepted" | "inProgress" | "completed" | "refused" | "cancelled" = "new"

  switch (status) {
    case "NEW":
      badgeText = "New"
      badgeVariant = "new"
      break
    case "ASSIGNED":
      badgeText = "Assigned"
      badgeVariant = "assigned"
      break
    case "ACCEPTED":
      badgeText = "Accepted"
      badgeVariant = "accepted"
      break
    case "REFUSED":
      badgeText = "Refused"
      badgeVariant = "refused"
      break
    case "IN_PROGRESS":
      badgeText = "In Progress"
      badgeVariant = "inProgress"
      break
    case "COMPLETED":
      badgeText = "Completed"
      badgeVariant = "completed"
      break
    default:
      badgeText = "Unknown"
      badgeVariant = "new"
  }

  return <Badge variant={badgeVariant}>{badgeText}</Badge>
}

function Timeline({ load }: { load: Load }) {
  return (
    <div className="grid gap-1 text-sm text-muted-foreground">
      {load.timeline?.arrivedPickup && (
        <div>Arrived Pickup: {new Date(load.timeline.arrivedPickup).toLocaleTimeString()}</div>
      )}
      {load.timeline?.departedPickup && (
        <div>Departed Pickup: {new Date(load.timeline.departedPickup).toLocaleTimeString()}</div>
      )}
      {load.timeline?.arrivedDelivery && (
        <div>Arrived Delivery: {new Date(load.timeline.arrivedDelivery).toLocaleTimeString()}</div>
      )}
      {load.timeline?.delivered && <div>Delivered: {new Date(load.timeline.delivered).toLocaleTimeString()}</div>}
    </div>
  )
}

export const LoadsDataTable = forwardRef<
  { addNewLoad: (loadData: Omit<Load, "id" | "status" | "createdAt">) => Load },
  { isDashboard?: boolean; isHistoryView?: boolean }
>((props, ref) => {
  const { isDashboard = false, isHistoryView = false } = props
  const [data, setData] = useState<Load[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [statusFilter, setStatusFilter] = useState<Load["status"][]>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Function to add a new load
  const addNewLoad = (loadData: Omit<Load, "id" | "status" | "createdAt">) => {
    const newLoad: Load = {
      ...loadData,
      id: `L-${1000 + data.length + 1}`, // Generate a new ID
      status: "NEW",
      createdAt: new Date().toISOString(),
    }

    setData((prevData) => [newLoad, ...prevData])
    return newLoad
  }

  // Expose the addNewLoad function via ref
  useImperativeHandle(ref, () => ({
    addNewLoad,
  }))

  // Apply filters
  useEffect(() => {
    let filteredData = [...initialData]

    // For dashboard: only show NEW, ASSIGNED, ACCEPTED, and IN_PROGRESS loads
    // Completed/Refused loads stay here until driver gets a new assignment
    if (isDashboard) {
      filteredData = filteredData.filter(
        (load) =>
          load.status === "NEW" ||
          load.status === "ASSIGNED" ||
          load.status === "ACCEPTED" ||
          load.status === "IN_PROGRESS",
      )
    }

    // For history view (Loads page): show completed and refused loads
    // These are loads where drivers have been assigned new work
    if (isHistoryView) {
      filteredData = filteredData.filter((load) => load.status === "COMPLETED" || load.status === "REFUSED")
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filteredData = filteredData.filter((load) => statusFilter.includes(load.status))
    }

    setData(filteredData)
  }, [statusFilter, isDashboard, isHistoryView])

  // Toggle row expansion
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  const saveComment = (loadId: string, comment: string) => {
    setData((prevData) => prevData.map((load) => (load.id === loadId ? { ...load, comments: comment } : load)))
  }

  const columns: ColumnDef<Load>[] = [
    {
      accessorKey: "id",
      header: "Load ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "reference",
      header: "Reference",
    },
    {
      accessorKey: "customer",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "origin",
      header: "Origin",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "pickupDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Pickup
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("pickupDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery",
      cell: ({ row }) => {
        const date = new Date(row.getValue("deliveryDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original.driver

        if (!driver) {
          return (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedLoad(row.original)
                setShowAssignModal(true)
              }}
            >
              <UserPlus className="mr-2 h-3.5 w-3.5" />
              Assign
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
              <AvatarFallback>
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span>{driver.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "dispatcher",
      header: "Dispatcher",
      cell: ({ row }) => <div>{row.getValue("dispatcher") || "Unassigned"}</div>,
    },
    {
      id: "timeline",
      header: "Timeline",
      cell: ({ row }) => <Timeline load={row.original} />,
    },
    {
      id: "comments",
      header: "Manager Comments",
      cell: ({ row }) => (
        <InlineComment
          comment={row.original.comments}
          loadId={row.original.id}
          onSaveComment={saveComment}
          isManager={true} // In a real app, this would check user role
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div className="text-sm text-muted-foreground">{date.toLocaleString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const load = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedLoad(load)
                  setShowDetailsModal(true)
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {load.status === "NEW" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedLoad(load)
                    setShowAssignModal(true)
                  }}
                >
                  Assign driver
                </DropdownMenuItem>
              )}
              {load.status === "ASSIGNED" && <DropdownMenuItem>Send reminder</DropdownMenuItem>}
              {(load.status === "ACCEPTED" || load.status === "IN_PROGRESS") && (
                <DropdownMenuItem>Contact driver</DropdownMenuItem>
              )}
              {load.status === "REFUSED" && <DropdownMenuItem>Reassign load</DropdownMenuItem>}
              <DropdownMenuItem>Edit load</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
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
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      row.original.status === "REFUSED"
                        ? "row-status-refused"
                        : row.original.status === "COMPLETED"
                          ? "row-status-completed"
                          : row.original.id === data[0].id
                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                            : "",
                      "cursor-pointer hover:bg-muted/50",
                    )}
                    onClick={() => toggleRowExpansion(row.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>

                  {expandedRows[row.id] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={columns.length} className="p-0">
                        <ExpandedLoadDetails load={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
          {table.getFilteredRowModel().rows.length} load(s) total
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

      {/* Modals */}
      {selectedLoad && (
        <>
          <AssignDriverModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} load={selectedLoad} />
          <LoadDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} load={selectedLoad} />
        </>
      )}
    </div>
  )
})
