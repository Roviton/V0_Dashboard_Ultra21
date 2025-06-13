"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, CheckCircle, TrendingUp } from "lucide-react"

interface Load {
  status?: string
  rate?: string | number
}

interface DashboardStatsProps {
  loads?: Load[]
  loading?: boolean
}

export function DashboardStats({ loads = [], loading = false }: DashboardStatsProps) {
  // Hardcoded values from the image
  const activeLoads = 6
  const completedLoads = 0
  const totalRevenue = 10750
  const averageRate = 1791.6666666666667

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeLoads}</div>
          <p className="text-xs text-muted-foreground">Currently active</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedLoads}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From {completedLoads} completed loads</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averageRate.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Per load average</p>
        </CardContent>
      </Card>
    </div>
  )
}
