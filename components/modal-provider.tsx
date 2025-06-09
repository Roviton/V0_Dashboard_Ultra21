"use client"

import { useEffect, useState } from "react"
import { EnhancedNewLoadModal } from "@/components/dashboard/modals/enhanced-new-load-modal"

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <EnhancedNewLoadModal />
    </>
  )
}
