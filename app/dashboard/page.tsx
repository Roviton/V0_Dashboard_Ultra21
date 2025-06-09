"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import useLoads from "@/hooks/use-loads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { ModalProvider } from "@/components/modal-provider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useModal } from "@/hooks/use-modal"
import type { DateRange } from "react-day-picker"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  const [isNewLoadModalOpen, setIsNewLoadModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"active" | "history" | "all">("active")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const {
    loads,
    loading,
    error,
    createLoad,
    updateLoadStatus,
    assignDriver,
    refetch: refetchLoads,
  } = useLoads({
    viewMode: statusFilter,
  })

  const { user, loading: authLoading } = useAuth() // Destructure loading as authLoading
  const router = useRouter()
  const pathname = usePathname() // Get current pathname
  const { toast } = useToast()
  const { onOpen } = useModal()

  useEffect(() => {
    // Redirect admin users to the admin dashboard
    if (!authLoading) {
      // Ensure auth state is resolved
      if (user?.role === "admin") {
        if (pathname !== "/dashboard/admin") {
          // Check if not already on the target page
          router.push("/dashboard/admin")
        }
      }
    }
  }, [user, authLoading, router, pathname])

  const handleCreateNewLoad = () => {
    onOpen("enhancedNewLoad", {
      onSubmit: async (formData: any) => {
        try {
          await createLoad(formData)
          if (refetchLoads) refetchLoads()
          toast({ title: "Load Created", description: "New load has been successfully created." })
        } catch (err) {
          console.error("Failed to create load from modal:", err)
          toast({ title: "Error", description: "Failed to create load.", variant: "destructive" })
        }
      },
    })
  }

  const filteredLoads = loads.filter((load) => {
    if (!searchTerm) return true
    const lowerSearchTerm = searchTerm.toLowerCase()
    const customerName =
      typeof load.customer === "object" && load.customer !== null ? load.customer.name : String(load.customer)

    return (
      load.load_number?.toLowerCase().includes(lowerSearchTerm) ||
      load.reference_number?.toLowerCase().includes(lowerSearchTerm) ||
      customerName?.toLowerCase().includes(lowerSearchTerm) ||
      load.pickup_city?.toLowerCase().includes(lowerSearchTerm) ||
      load.delivery_city?.toLowerCase().includes(lowerSearchTerm)
    )
  })

  if (error && !loading && loads.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>Error loading dashboard data: {error}</p>
              <Button onClick={() => (refetchLoads ? refetchLoads() : window.location.reload())} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your dispatch operations.</p>
        </div>
        <Button onClick={handleCreateNewLoad} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New Load
        </Button>
      </div>

      <DashboardStats loads={loads} loading={loading} />

      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "active" && "Active Loads"}
              {statusFilter === "history" && "Load History"}
              {statusFilter === "all" && "All Loads"}
            </CardTitle>
            <CardDescription>Manage your loads - assign drivers, update status, and track progress.</CardDescription>
            <div className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="Search loads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="lg:col-span-1"
                />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "active" | "history" | "all")}
                >
                  <SelectTrigger className="lg:col-span-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Loads</SelectItem>
                    <SelectItem value="all">All Loads</SelectItem>
                    <SelectItem value="history">Load History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && loads.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <LoadsDataTable
                loads={filteredLoads}
                loading={loading && loads.length === 0}
                error={error}
                onUpdateStatus={updateLoadStatus}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <EnhancedNewLoadModal
        isOpen={isNewLoadModalOpen}
        onClose={() => setIsNewLoadModalOpen(false)}
        onSubmit={async (formData: any) => {
          try {
            await createLoad(formData)
            setIsNewLoadModalOpen(false)
            if (refetchLoads) refetchLoads()
            toast({ title: "Load Created", description: "New load has been successfully created." })
          } catch (err) {
            console.error("Failed to create load:", err)
            toast({ title: "Error", description: "Failed to create load.", variant: "destructive" })
          }
        }}
      />
      <ModalProvider />
    </div>
  )
}
