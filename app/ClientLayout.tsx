"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import Providers from "./providers"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Providers>
        {children}
        <Analytics />
      </Providers>
    </Suspense>
  )
}
