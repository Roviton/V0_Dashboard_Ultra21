import { ArrowRightIcon, ArrowUpIcon, Clock, DollarSign, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +8% from last week
            </span>
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-500 dark:text-amber-400 flex items-center">
              <ArrowRightIcon className="mr-1 h-4 w-4" />
              Same as yesterday
            </span>
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg RPM</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$2.85</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +$0.12 from last month
            </span>
          </p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$87,432</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +12% from last month
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
