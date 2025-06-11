// Ensure this import is at the VERY TOP of the file, before any other imports if possible.
import "@/lib/monaco-environment"
;("use client")
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ModalProvider } from "@/components/modal-provider"

// Import Monaco environment setup
// import "@/lib/monaco-environment"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
          <ModalProvider />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
