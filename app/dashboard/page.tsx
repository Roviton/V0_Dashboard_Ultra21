"use client"

import { useState, useRef, useEffect } from "react"
import { LoadsDataTable, type Load } from "@/components/dashboard/loads-data-table"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [showNewLoadModal, setShowNewLoadModal] = useState(false)
  const loadsDataTableRef = useRef<{ addNewLoad: (loadData: Omit<Load, "id" | "status" | "createdAt">) => Load }>(null)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/dashboard/admin")
    }
  }, [user, router])

  const handleAddNewLoad = (loadData: Omit<Load, "id" | "status" | "createdAt">) => {
    if (loadsDataTableRef.current) {
      const newLoad = loadsDataTableRef.current.addNewLoad(loadData)
      return newLoad
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Active loads and new assignments. Completed loads move to Loads page when driver gets a new assignment.
          </p>
        </div>
      </div>

      <DashboardStats />

      <DashboardFilters onNewLoad={() => setShowNewLoadModal(true)} />

      {/* Main dashboard shows only NEW and ACTIVE loads */}
      <LoadsDataTable ref={loadsDataTableRef} isDashboard={true} />

      <EnhancedNewLoadModal
        isOpen={showNewLoadModal}
        onClose={() => setShowNewLoadModal(false)}
        onSubmit={handleAddNewLoad}
      />
    </div>
  )
}
