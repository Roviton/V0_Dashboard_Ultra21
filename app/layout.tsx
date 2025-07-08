import type React from "react"
import ClientLayout from "./clientLayout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}

export const metadata = {
  title: "Freight Dispatcher Dashboard",
  description: "Manage your freight dispatching operations efficiently.",
  generator: "v0.dev",
}


import './globals.css'