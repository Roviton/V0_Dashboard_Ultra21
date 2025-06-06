"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Play, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal"
import { AssignDriverModal } from "@/components/dashboard/modals/assign-driver-modal"

interface LoadsDataTableProps {
  loads: any[]
  loading: boolean
  error: string | null
  onUpdateStatus?: (loadId: string, status: string) => void
  onAssignDriver?: (loadId: string, driverId: string) => void
}

export function LoadsDataTable({ loads, loading, error, onUpdateStatus, onAssignDriver }: LoadsDataTableProps) {
  console.log("LoadsDataTable received loads:", loads)
  console.log("LoadsDataTable loading:", loading)
  console.log("LoadsDataTable error:", error)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { onOpen } = useModal()

  const [assignDriverModal, setAssignDriverModal] = useState<{
    isOpen: boolean
    load: any | null
  }>({
    isOpen: false,
    load: null,
  })

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
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
          <CardTitle>Loads</CardTitle>
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
        <CardTitle>Loads ({filteredLoads.length})</CardTitle>
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
                  <TableRow key={load.id}>
                    <TableCell className="font-medium">
                      {load.load_number || `LOAD-${String(load.id || "").slice(-6)}`}
                      {load.reference_number && (
                        <div className="text-xs text-muted-foreground">Ref: {load.reference_number}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getCustomerDisplay(load.customer)}</div>
                        {getCustomerContact(load.customer) && (
                          <div className="text-xs text-muted-foreground">{getCustomerContact(load.customer)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {load.pickup_city || "N/A"}, {load.pickup_state || "N/A"}
                        </div>
                        <div className="text-muted-foreground">↓</div>
                        <div>
                          {load.delivery_city || "N/A"}, {load.delivery_state || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(load.pickup_date)}</TableCell>
                    <TableCell>{formatDate(load.delivery_date)}</TableCell>
                    <TableCell>{getStatusBadge(String(load.status || "new"))}</TableCell>
                    <TableCell>{formatCurrency(load.rate)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{getDriverDisplay(load.load_drivers)}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onOpen("loadDetails", { load })}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignDriver(load)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Driver
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onOpen("editLoad", { load })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Load
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(load, "in_progress")}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Load
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(load, "completed")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Load
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(load, "cancelled")}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Load
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {assignDriverModal.load && (
        <AssignDriverModal
          isOpen={assignDriverModal.isOpen}
          onClose={handleCloseAssignDriver}
          load={assignDriverModal.load}
          onAssign={handleDriverAssigned}
        />
      )}
    </Card>
  )
}
