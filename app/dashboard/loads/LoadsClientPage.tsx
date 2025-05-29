"use client"

import { LoadsHistoryTable } from "@/components/dashboard/loads/loads-history-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoadsClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loads History</h1>
        <p className="text-muted-foreground">View and manage completed and refused loads</p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-medium">Filters</h2>
          <p className="text-sm text-muted-foreground">Filter loads by status and date range</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All History</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refused">Refused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Date Range</label>
              <div className="mt-1">
                <Select
                  defaultValue="all"
                  onValueChange={(value) => {
                    // This would be replaced with actual state management in a real implementation
                    const customDateContainer = document.getElementById("custom-date-container")
                    if (customDateContainer) {
                      customDateContainer.style.display = value === "custom" ? "flex" : "none"
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="last7">Last 7 days</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="last90">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom date range picker that appears when "Custom range" is selected */}
              <div
                id="custom-date-container"
                className="mt-2 flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
                style={{ display: "none" }}
              >
                <div className="flex-1">
                  <label className="text-xs font-medium">From</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium">To</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <Button className="gap-2">
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
                  className="lucide lucide-filter"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <LoadsHistoryTable />
      </div>
    </div>
  )
}
