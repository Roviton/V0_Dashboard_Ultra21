import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { LoadsDataTable } from "@/components/dashboard/loads-data-table"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get user role from Clerk metadata or default to dispatcher
  const userRole = (user.publicMetadata?.role as string) || "dispatcher"

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-600">Here's what's happening with your freight operations today.</p>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Loads</h2>
            <LoadsDataTable />
          </div>
        </div>
      </div>
    </div>
  )
}
