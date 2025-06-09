"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useLoads } from "@/hooks/use-loads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { ModalProvider } from "@/components/modal-provider"

export default function DashboardPage() {
  const [isNewLoadModalOpen, setIsNewLoadModalOpen] = useState(false)
  // This instance of useLoads is for the 'active' view
  const { loads, loading, error, createLoad, updateLoadStatus, assignDriver } = useLoads({ viewMode: "active" })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/dashboard/admin")
    }
  }, [user, router])

  const handleEditLoad = (load: any) => {
    console.log("Edit load:", load)
    // TODO: Implement edit functionality
  }

  const handleDeleteLoad = async (load: any) => {
    try {
      await updateLoadStatus(load.id, "cancelled")
      toast({
        title: "Load cancelled",
        description: `Load ${load.load_number} has been cancelled.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel load. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAssignDriver = async (loadId: string, driverId: string) => {
    try {
      await assignDriver(loadId, driverId)
      toast({
        title: "Driver assigned",
        description: "Driver has been successfully assigned to the load",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign driver. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading dashboard data: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsNewLoadModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Load
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <DashboardStats loads={loads} />
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Loads</CardTitle>
            <CardDescription>
              Manage your active loads - assign drivers, update status, and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <LoadsDataTable
                loads={loads}
                loading={loading}
                error={error}
                onUpdateStatus={updateLoadStatus}
                onAssignDriver={handleAssignDriver}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <EnhancedNewLoadModal
        isOpen={isNewLoadModalOpen}
        onClose={() => setIsNewLoadModalOpen(false)}
        onSubmit={createLoad}
      />

      <ModalProvider />
    </div>
  )
}
