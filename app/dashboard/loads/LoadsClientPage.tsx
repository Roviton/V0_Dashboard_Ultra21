"use client"

import { useState } from "react"
import useLoads from "@/hooks/use-loads" // Corrected: Default import
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker" // Assuming this exists
import { useModal } from "@/hooks/use-modal"
import type { DateRange } from "react-day-picker"

export default function LoadsClientPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Pass filter options to useLoads hook
  const {
    loads,
    loading,
    error,
    createLoad, // Assuming useLoads exports this
    updateLoadStatus, // Assuming useLoads exports this
    assignDriver, // Assuming useLoads exports this
    refetch: refetchLoads, // Assuming useLoads exports this
  } = useLoads({
    viewMode: statusFilter === "all" ? "all" : statusFilter === "active" ? "active" : "history",
    // Add other filters like searchTerm, dateRange if useLoads supports them
  })

  const { onOpen } = useModal()

  const handleCreateNewLoad = () => {
    onOpen("enhancedNewLoad", {
      // Pass any necessary props to the modal, e.g., a callback to refresh loads
      onLoadCreated: () => {
        if (refetchLoads) refetchLoads()
      },
    })
  }

  // Placeholder for actual update/assign functions if not directly from useLoads
  const handleUpdateStatus = async (loadId: string, newStatus: string) => {
    if (updateLoadStatus) {
      await updateLoadStatus(loadId, newStatus)
      // refetchLoads might be called automatically by the hook, or call it here
    } else {
      console.warn("updateLoadStatus function not available from useLoads hook")
    }
  }

  const handleAssignDriver = (loadId: string, driverId: string) => {
    // This would typically open the assign driver modal,
    // and the modal itself would call the assignDriver function from the hook.
    // For now, let's assume the modal handles it.
    // If assignDriver is directly called here:
    // if (assignDriver) {
    //   await assignDriver(loadId, driverId);
    // } else {
    //   console.warn("assignDriver function not available from useLoads hook");
    // }
    console.log(`Assign driver for load ${loadId} (driver ${driverId}) - typically handled by modal`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Loads Management</h1>
        <Button onClick={handleCreateNewLoad}>Create New Load</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search loads (ID, Ref, City...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:col-span-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active Loads</SelectItem>
            <SelectItem value="history">Load History</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} className="md:col-span-1" />
      </div>

      <LoadsDataTable
        loads={loads} // Pass filtered loads here eventually
        loading={loading}
        error={error}
        onUpdateStatus={handleUpdateStatus}
        // onAssignDriver is handled by the modal system via dropdown menu
      />
    </div>
  )
}
