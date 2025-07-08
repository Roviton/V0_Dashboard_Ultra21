import type React from "react"
import ClientLayout from "./client-layout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export const metadata = {
  title: "Freight Dispatcher Dashboard",
  description: "Manage your freight dispatching operations efficiently.",
  generator: "v0.dev",
}


import './globals.css'