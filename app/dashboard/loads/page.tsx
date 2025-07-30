import type { Metadata } from "next"
import LoadsClientPage from "./LoadsClientPage"

export const metadata: Metadata = {
  title: "Loads History | Freight Dispatch System",
  description: "View and manage completed and refused loads",
}

export default function LoadsPage() {
  return <LoadsClientPage />
}
