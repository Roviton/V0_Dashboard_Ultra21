"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import Providers from "./providers"
import { Suspense } from "react"

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Analytics />
    </Providers>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </Suspense>
  )
}
