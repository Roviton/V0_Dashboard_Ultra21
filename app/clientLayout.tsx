"use client"

import type React from "react"
import Providers from "./providers"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>{children}</Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
