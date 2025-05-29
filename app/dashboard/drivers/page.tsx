"use client"

import { useState } from "react"
import { DriversTable } from "@/components/dashboard/drivers/drivers-table"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AddDriverModal } from "@/components/dashboard/drivers/add-driver-modal"

export default function DriversPage() {
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
        <Button onClick={() => setShowAddDriverModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <DriversTable />
        </div>
      </div>

      <AddDriverModal isOpen={showAddDriverModal} onClose={() => setShowAddDriverModal(false)} />
    </div>
  )
}
