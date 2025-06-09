"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoadsPage() {
  const { onOpen } = useModal()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()

  const handleCreateNewLoad = () => {
    console.log("🚛 Create New Load clicked")
    console.log("👤 Current user:", user)

    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Authentication is still loading...",
      })
      return
    }

    if (!user) {
      console.error("❌ No user found")
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a load.",
        variant: "destructive",
      })
      return
    }

    console.log("🏢 User companyId:", user.companyId)

    if (!user.companyId) {
      console.error("❌ User missing companyId")
      toast({
        title: "Authentication Error",
        description: "User company information is missing. Cannot create load.",
        variant: "destructive",
      })
      return
    }

    console.log("✅ All checks passed, opening modal")
    onOpen("enhancedNewLoad")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loads Management</h1>
        <Button onClick={handleCreateNewLoad} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Create New Load"}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p>Loads will be displayed here.</p>
      </div>
    </div>
  )
}
