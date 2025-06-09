"use client"

import { useState, useMemo } from "react"
import { LoadsHistoryTable } from "@/components/dashboard/loads/loads-history-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLoads } from "@/hooks/use-loads"
import { LoadDetailsDialog } from "@/components/dashboard/modals/load-details-dialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { Loader2, Search } from "lucide-react"

export default function LoadsClientPage() {
  const { loads: allHistoryLoads, loading, error, refetch } = useLoads({ viewMode: "history" })
  const [selectedLoad, setSelectedLoad] = useState<any | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90), // Default to last 90 days
    to: new Date(),
  })

  const handleViewDetails = (load: any) => {
    setSelectedLoad(load)
    setIsDetailsModalOpen(true)
  }

  const filteredLoads = useMemo(() => {
    let filtered = allHistoryLoads

    // Filter by search term (Load # or Customer Name)
    if (searchTerm) {
      filtered = filtered.filter(
        (load) =>
          load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((load) => load.status === statusFilter)
    }

    // Filter by date range (using 'completed_at' or 'updated_at' as fallback)
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((load) => {
        const loadDate = load.completed_at || load.updated_at || load.created_at
        if (!loadDate) return false
        const date = new Date(loadDate)
        return date >= (dateRange.from as Date) && date <= (dateRange.to as Date)
      })
    }
    return filtered
  }, [allHistoryLoads, searchTerm, statusFilter, dateRange])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading historical loads...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
        <h3 className="font-semibold">Error loading data</h3>
        <p>{error}</p>
        <Button onClick={refetch} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loads History</h1>
        <p className="text-muted-foreground">View and manage completed, cancelled, and other archived loads.</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Load # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Archived Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refused">Refused</SelectItem>
              <SelectItem value="other_archived">Other Archived</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <DateRangePicker
              range={dateRange}
              onRangeChange={setDateRange}
              className="w-full"
              placeholder="Filter by date range"
            />
          </div>
        </div>
        {/* The Apply Filters button might not be strictly necessary if filters apply live,
       but can be kept if preferred for explicit action. For now, assuming live filtering. */}
      </div>

      <LoadsHistoryTable loads={filteredLoads} onViewDetails={handleViewDetails} />

      {selectedLoad && (
        <LoadDetailsDialog
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          load={selectedLoad}
          // We might need a prop here like `showPdfFeatures={false}` if the dialog has PDF actions
        />
      )}
    </div>
  )
}
