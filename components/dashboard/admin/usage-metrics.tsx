"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Truck, Users, FileText, MessageSquare, Calendar } from "lucide-react"

const usageData = [
  {
    title: "Loads Managed",
    current: 847,
    limit: 1000,
    icon: Truck,
    description: "Monthly load limit",
    color: "bg-blue-500",
  },
  {
    title: "Active Dispatchers",
    current: 12,
    limit: 15,
    icon: Users,
    description: "User seats",
    color: "bg-green-500",
  },
  {
    title: "Reports Generated",
    current: 156,
    limit: 500,
    icon: FileText,
    description: "Monthly report limit",
    color: "bg-purple-500",
  },
  {
    title: "Messages Sent",
    current: 2847,
    limit: 5000,
    icon: MessageSquare,
    description: "Monthly message limit",
    color: "bg-orange-500",
  },
]

const monthlyUsage = [
  { month: "Nov 2024", loads: 923, revenue: 45600 },
  { month: "Dec 2024", loads: 1089, revenue: 52300 },
  { month: "Jan 2025", loads: 847, revenue: 41200 },
]

export function UsageMetrics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usageData.map((item) => {
          const percentage = (item.current / item.limit) * 100
          const Icon = item.icon

          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.current.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  of {item.limit.toLocaleString()} {item.description}
                </p>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% used</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage History</CardTitle>
          <CardDescription>Track your platform usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyUsage.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-muted-foreground">{month.loads} loads managed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${month.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue generated</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
