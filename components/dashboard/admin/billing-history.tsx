"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const invoices = [
  {
    id: "INV-2025-001",
    date: "2025-01-01",
    amount: 299.0,
    status: "paid",
    period: "January 2025",
    dueDate: "2025-01-15",
  },
  {
    id: "INV-2024-012",
    date: "2024-12-01",
    amount: 299.0,
    status: "paid",
    period: "December 2024",
    dueDate: "2024-12-15",
  },
  {
    id: "INV-2024-011",
    date: "2024-11-01",
    amount: 299.0,
    status: "paid",
    period: "November 2024",
    dueDate: "2024-11-15",
  },
  {
    id: "INV-2024-010",
    date: "2024-10-01",
    amount: 299.0,
    status: "paid",
    period: "October 2024",
    dueDate: "2024-10-15",
  },
  {
    id: "INV-2024-009",
    date: "2024-09-01",
    amount: 299.0,
    status: "paid",
    period: "September 2024",
    dueDate: "2024-09-15",
  },
]

export function BillingHistory() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.period}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Your payment history at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">$1,495</p>
              <p className="text-sm text-muted-foreground">Total Paid (Last 5 months)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">$299</p>
              <p className="text-sm text-muted-foreground">Average Monthly</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">$299</p>
              <p className="text-sm text-muted-foreground">Next Payment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
