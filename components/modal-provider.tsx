"use client"

import { useModal } from "@/hooks/use-modal"
import { LoadDetailsDialog } from "@/components/dashboard/modals/load-details-dialog"
import { EnhancedLoadDetailsModal } from "@/components/dashboard/modals/enhanced-load-details-modal"

export function ModalProvider() {
  const { type, data, isOpen, onClose } = useModal()

  if (!isOpen) return null

  switch (type) {
    case "loadDetails":
      return <LoadDetailsDialog isOpen={isOpen} onClose={onClose} load={data.load} />
    case "enhancedLoadDetails":
      return <EnhancedLoadDetailsModal isOpen={isOpen} onClose={onClose} load={data.load} />
    default:
      return null
  }
}
