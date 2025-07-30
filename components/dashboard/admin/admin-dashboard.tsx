"use client"

import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  Settings,
  Sliders,
  UserCog,
  Search,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"

// Mock data
const dispatcherPerformance = [
  {
    name: "Sarah Johnson",
    avatar: "/emergency-dispatcher.png",
    loads: 128,
    responseTime: 8,
    onTimeRate: 94.2,
    rating: 4.8,
    rpm: 2.92,
  },
  {
    name: "John Smith",
    avatar: "/abstract-geometric-DR.png",
    loads: 112,
    responseTime: 10,
    onTimeRate: 91.5,
    rating: 4.6,
    rpm: 2.78,
  },
  {
    name: "Maria Rodriguez",
    avatar: "/abstract-geometric-TD.png",
    loads: 145,
    responseTime: 7,
    onTimeRate: 95.8,
    rating: 4.9,
    rpm: 3.05,
  },
  {
    name: "Alex Johnson",
    avatar: "/abstract-dw.png",
    loads: 98,
    responseTime: 12,
    onTimeRate: 89.3,
    rating: 4.4,
    rpm: 2.65,
  },
]

const driverPerformance = [
  {
    name: "Michael Brown",
    avatar: "/professional-driver.png",
    loads: 32,
    onTimeRate: 96.5,
    incidents: 0,
    availability: 92,
  },
  {
    name: "David Wilson",
    avatar: "/abstract-geometric-DR.png",
    loads: 28,
    onTimeRate: 94.2,
    incidents: 1,
    availability: 88,
  },
  {
    name: "Lisa Garcia",
    avatar: "/abstract-geometric-TD.png",
    loads: 35,
    onTimeRate: 97.1,
    incidents: 0,
    availability: 95,
  },
  { name: "Robert Taylor", avatar: "/abstract-dw.png", loads: 30, onTimeRate: 93.8, incidents: 2, availability: 90 },
]

const customerActivity = [
  { name: "Acme Logistics", logo: "/acme-logistics-logo.png", loads: 45, revenue: 128500, profitability: 22.5 },
  { name: "Global Transport", logo: "/global-transport-logo.png", loads: 38, revenue: 112300, profitability: 19.8 },
  { name: "FastFreight", logo: "/fastfreight-logo.png", loads: 52, revenue: 156000, profitability: 24.2 },
  { name: "Prime Shipping", logo: "/prime-shipping-logo.png", loads: 29, revenue: 87000, profitability: 18.5 },
]

const revenueData = [
  { month: "Jan", revenue: 210000, target: 200000 },
  { month: "Feb", revenue: 225000, target: 210000 },
  { month: "Mar", revenue: 240000, target: 220000 },
  { month: "Apr", revenue: 255000, target: 230000 },
  { month: "May", revenue: 270000, target: 240000 },
]

const loadVolumeData = [
  { month: "Jan", loads: 420, target: 400 },
  { month: "Feb", loads: 450, target: 425 },
  { month: "Mar", loads: 480, target: 450 },
  { month: "Apr", loads: 510, target: 475 },
  { month: "May", loads: 540, target: 500 },
]

const rpmData = [
  { month: "Jan", rpm: 2.65, target: 2.6 },
  { month: "Feb", rpm: 2.72, target: 2.65 },
  { month: "Mar", rpm: 2.78, target: 2.7 },
  { month: "Apr", rpm: 2.85, target: 2.75 },
  { month: "May", rpm: 2.92, target: 2.8 },
]

export function AdminDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="may2023">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="may2023">May 2023</SelectItem>
              <SelectItem value="apr2023">April 2023</SelectItem>
              <SelectItem value="mar2023">March 2023</SelectItem>
              <SelectItem value="q22023">Q2 2023</SelectItem>
              <SelectItem value="q12023">Q1 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">542</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average RPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.92</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">$0.07 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">1.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$270,000</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">5.9% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Card */}
      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <CardTitle>Attention Required</CardTitle>
              <CardDescription>The following items require your attention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5" />
              <span>
                Dispatcher <strong>Alex Johnson</strong> is below target achievement (82%).{" "}
                <Link href="/dashboard/admin/dispatchers/disp-004" className="text-primary font-medium">
                  View profile
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5" />
              <span>
                Driver <strong>Robert Taylor</strong> has 2 incidents reported this month.{" "}
                <Link href="#" className="text-primary font-medium">
                  Review incidents
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5" />
              <span>
                3 loads are currently delayed and at risk of late delivery.{" "}
                <Link href="#" className="text-primary font-medium">
                  View loads
                </Link>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="targets">Targets & Goals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="management">User Management</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dispatcher Performance */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dispatcher Performance</CardTitle>
                    <CardDescription>Comparative metrics across dispatchers</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/admin/dispatchers">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispatcher</TableHead>
                      <TableHead>Loads</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>On-Time</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>RPM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispatcherPerformance.map((dispatcher) => (
                      <TableRow key={dispatcher.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={dispatcher.avatar || "/placeholder.svg"} alt={dispatcher.name} />
                              <AvatarFallback>
                                {dispatcher.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{dispatcher.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{dispatcher.loads}</TableCell>
                        <TableCell>{dispatcher.responseTime} min</TableCell>
                        <TableCell>{dispatcher.onTimeRate}%</TableCell>
                        <TableCell>{dispatcher.rating}</TableCell>
                        <TableCell>${dispatcher.rpm}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Driver Performance */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Driver Performance</CardTitle>
                    <CardDescription>Top performing drivers this month</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/admin/drivers">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Loads</TableHead>
                      <TableHead>On-Time</TableHead>
                      <TableHead>Incidents</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverPerformance.map((driver) => (
                      <TableRow key={driver.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                              <AvatarFallback>
                                {driver.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{driver.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{driver.loads}</TableCell>
                        <TableCell>{driver.onTimeRate}%</TableCell>
                        <TableCell>{driver.incidents}</TableCell>
                        <TableCell>{driver.availability}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Customer Activity */}
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Activity</CardTitle>
                  <CardDescription>Top customers by volume and revenue</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/admin/customers">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Loads</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profitability</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerActivity.map((customer) => (
                    <TableRow key={customer.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer.logo || "/placeholder.svg"} alt={customer.name} />
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{customer.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.loads}</TableCell>
                      <TableCell>${customer.revenue.toLocaleString()}</TableCell>
                      <TableCell>{customer.profitability}%</TableCell>
                      <TableCell>
                        <div className="w-[80px] h-[24px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { value: 20 },
                                { value: 40 },
                                { value: 30 },
                                { value: 70 },
                                { value: 50 },
                                { value: 80 },
                              ]}
                            >
                              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Loads</DropdownMenuItem>
                            <DropdownMenuItem>View Invoices</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targets & Goals Tab */}
        <TabsContent value="targets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue Target */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Target</CardTitle>
                <CardDescription>Monthly revenue vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                      target: {
                        label: "Target",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Progress</span>
                    <span className="text-sm font-medium">112.5%</span>
                  </div>
                  <Progress value={112.5} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Revenue is currently $30,000 above the monthly target.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Load Volume Target */}
            <Card>
              <CardHeader>
                <CardTitle>Load Volume Target</CardTitle>
                <CardDescription>Monthly loads vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      loads: {
                        label: "Loads",
                        color: "hsl(var(--chart-3))",
                      },
                      target: {
                        label: "Target",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={loadVolumeData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="loads" fill="var(--color-loads)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Progress</span>
                    <span className="text-sm font-medium">108%</span>
                  </div>
                  <Progress value={108} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Load volume is currently 40 loads above the monthly target.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* RPM Target */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Per Mile Target</CardTitle>
                <CardDescription>Monthly RPM vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      rpm: {
                        label: "RPM",
                        color: "hsl(var(--chart-5))",
                      },
                      target: {
                        label: "Target",
                        color: "hsl(var(--chart-6))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rpmData}>
                        <XAxis dataKey="month" />
                        <YAxis domain={[2.5, 3]} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="rpm" stroke="var(--color-rpm)" strokeWidth={2} />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="var(--color-target)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Progress</span>
                    <span className="text-sm font-medium">104.3%</span>
                  </div>
                  <Progress value={104.3} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Average RPM is currently $0.12 above the monthly target.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Target Settings</CardTitle>
              <CardDescription>Configure company-wide and dispatcher-specific targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Company Revenue Target</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border px-3 py-2">$240,000</div>
                      <Button variant="outline" size="sm">
                        <Sliders className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Company Load Volume Target</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border px-3 py-2">500</div>
                      <Button variant="outline" size="sm">
                        <Sliders className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Company RPM Target</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border px-3 py-2">$2.80</div>
                      <Button variant="outline" size="sm">
                        <Sliders className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Dispatcher-Specific Targets</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dispatcher</TableHead>
                        <TableHead>Revenue Target</TableHead>
                        <TableHead>Load Volume Target</TableHead>
                        <TableHead>RPM Target</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispatcherPerformance.map((dispatcher) => (
                        <TableRow key={dispatcher.name}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={dispatcher.avatar || "/placeholder.svg"} alt={dispatcher.name} />
                                <AvatarFallback>
                                  {dispatcher.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{dispatcher.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 rounded-md border px-3 py-1 text-sm">
                                ${(dispatcher.loads * dispatcher.rpm * 250).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 rounded-md border px-3 py-1 text-sm">{dispatcher.loads}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 rounded-md border px-3 py-1 text-sm">${dispatcher.rpm}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Sliders className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between w-full">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Target Settings</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Load Reports</CardTitle>
              <CardDescription>Generate and download load reports for accounting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Report Period</h3>
                    <Select defaultValue="may2023">
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="may2023">May 2023</SelectItem>
                        <SelectItem value="apr2023">April 2023</SelectItem>
                        <SelectItem value="mar2023">March 2023</SelectItem>
                        <SelectItem value="feb2023">February 2023</SelectItem>
                        <SelectItem value="jan2023">January 2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Report Type</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Loads</SelectItem>
                        <SelectItem value="completed">Completed Loads</SelectItem>
                        <SelectItem value="inprogress">In-Progress Loads</SelectItem>
                        <SelectItem value="cancelled">Cancelled Loads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Export Format</h3>
                    <Select defaultValue="excel">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Report Fields</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-loadid" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-loadid" className="text-sm">
                        Load ID
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-pickup" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-pickup" className="text-sm">
                        Pick Up Location
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-pickdate" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-pickdate" className="text-sm">
                        Pick Up Date
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-delivery" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-delivery" className="text-sm">
                        Delivery Location
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-deldate" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-deldate" className="text-sm">
                        Delivery Date
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-driver" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-driver" className="text-sm">
                        Driver Name/ID
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-customer" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-customer" className="text-sm">
                        Customer (Broker)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-rate" className="rounded border-gray-300" checked readOnly />
                      <label htmlFor="field-rate" className="text-sm">
                        Quoted Rate
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-miles" className="rounded border-gray-300" />
                      <label htmlFor="field-miles" className="text-sm">
                        Total Miles
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-rpm" className="rounded border-gray-300" />
                      <label htmlFor="field-rpm" className="text-sm">
                        Rate Per Mile
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-dispatcher" className="rounded border-gray-300" />
                      <label htmlFor="field-dispatcher" className="text-sm">
                        Assigned Dispatcher
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="field-status" className="rounded border-gray-300" />
                      <label htmlFor="field-status" className="text-sm">
                        Load Status
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Report Preview</h3>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Load ID</TableHead>
                          <TableHead>Pick Up</TableHead>
                          <TableHead>Pick Date</TableHead>
                          <TableHead>Delivery</TableHead>
                          <TableHead>Del. Date</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>LD-4392</TableCell>
                          <TableCell>Chicago, IL</TableCell>
                          <TableCell>05/20/2023</TableCell>
                          <TableCell>Indianapolis, IN</TableCell>
                          <TableCell>05/22/2023</TableCell>
                          <TableCell>Michael Brown</TableCell>
                          <TableCell>Acme Logistics</TableCell>
                          <TableCell>$2,850</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>LD-4401</TableCell>
                          <TableCell>Detroit, MI</TableCell>
                          <TableCell>05/21/2023</TableCell>
                          <TableCell>Columbus, OH</TableCell>
                          <TableCell>05/23/2023</TableCell>
                          <TableCell>Lisa Garcia</TableCell>
                          <TableCell>Global Transport</TableCell>
                          <TableCell>$3,200</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>LD-4415</TableCell>
                          <TableCell>St. Louis, MO</TableCell>
                          <TableCell>05/20/2023</TableCell>
                          <TableCell>Nashville, TN</TableCell>
                          <TableCell>05/21/2023</TableCell>
                          <TableCell>Robert Taylor</TableCell>
                          <TableCell>FastFreight</TableCell>
                          <TableCell>$1,950</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Showing 3 of 542 loads. Full report will include all loads for the selected period.
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="schedule-report" className="rounded border-gray-300" />
                  <label htmlFor="schedule-report" className="text-sm">
                    Schedule this report monthly
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Search users..." className="pl-8 w-[250px]" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <UserCog className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">John Doe</div>
                        </div>
                      </TableCell>
                      <TableCell>john.doe@example.com</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>Just now</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/emergency-dispatcher.png" alt="Sarah Johnson" />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">Sarah Johnson</div>
                        </div>
                      </TableCell>
                      <TableCell>sarah.johnson@example.com</TableCell>
                      <TableCell>Dispatcher</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>10 minutes ago</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>MR</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">Maria Rodriguez</div>
                        </div>
                      </TableCell>
                      <TableCell>maria.rodriguez@example.com</TableCell>
                      <TableCell>Dispatcher</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>1 hour ago</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>RW</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">Robert Williams</div>
                        </div>
                      </TableCell>
                      <TableCell>robert.williams@example.com</TableCell>
                      <TableCell>Accountant</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>2 days ago</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>JW</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">Jessica Williams</div>
                        </div>
                      </TableCell>
                      <TableCell>jessica.williams@example.com</TableCell>
                      <TableCell>Dispatcher</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                      <TableCell>2 weeks ago</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Activate User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
