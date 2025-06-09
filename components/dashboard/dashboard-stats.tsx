"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Truck, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
  loads: any[]
  className?: string
}

export function DashboardStats({ loads, className }: DashboardStatsProps) {
  // Calculate stats safely
  const totalLoads = loads.length
  const activeLoads = loads.filter(
    (load) =>
      load.status === "new" ||
      load.status === "assigned" ||
      load.status === "accepted" ||
      load.status === "in_progress",
  ).length

  const completedLoads = loads.filter((load) => load.status === "completed").length

  const unassignedLoads = loads.filter((load) => !load.load_drivers || load.load_drivers.length === 0).length

  // Calculate average rate safely
  const loadsWithRates = loads.filter((load) => load.rate && typeof load.rate === "number")
  const averageRate =
    loadsWithRates.length > 0 ? loadsWithRates.reduce((sum, load) => sum + load.rate, 0) / loadsWithRates.length : 0

  // Calculate total revenue from completed loads
  const completedLoadsWithRates = loads.filter(
    (load) => load.status === "completed" && load.rate && typeof load.rate === "number",
  )
  const totalRevenue = completedLoadsWithRates.reduce((sum, load) => sum + load.rate, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const stats = [
    {
      title: "Active Loads",
      value: activeLoads.toString(),
      description: "Currently active",
      icon: Truck,
      trend: activeLoads > 0 ? "up" : "neutral",
    },
    {
      title: "Pending Assignment",
      value: unassignedLoads.toString(),
      description: "Awaiting driver assignment",
      icon: Users,
      trend: unassignedLoads > 0 ? "down" : "up",
    },
    {
      title: "Average Rate",
      value: formatCurrency(averageRate),
      description: "Per load average",
      icon: DollarSign,
      trend: "neutral",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: `From ${completedLoads} completed loads`,
      icon: TrendingUp,
      trend: totalRevenue > 0 ? "up" : "neutral",
    },
  ]

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
              {stat.trend === "down" && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
