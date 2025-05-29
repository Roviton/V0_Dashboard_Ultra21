"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const paymentMethods = [
  {
    id: "1",
    type: "Visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "2026",
    isDefault: true,
  },
  {
    id: "2",
    type: "Mastercard",
    last4: "8888",
    expiryMonth: "08",
    expiryYear: "2025",
    isDefault: false,
  },
]

export function PaymentMethods() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-md">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {method.type} •••• {method.last4}
                    </p>
                    {method.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!method.isDefault && <DropdownMenuItem>Set as default</DropdownMenuItem>}
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Company details for invoicing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <p className="text-sm text-muted-foreground mt-1">Acme Freight Solutions</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tax ID</label>
              <p className="text-sm text-muted-foreground mt-1">12-3456789</p>
            </div>
            <div>
              <label className="text-sm font-medium">Billing Address</label>
              <p className="text-sm text-muted-foreground mt-1">
                123 Logistics Way
                <br />
                Freight City, FC 12345
                <br />
                United States
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Billing Email</label>
              <p className="text-sm text-muted-foreground mt-1">billing@acmefreight.com</p>
            </div>
          </div>
          <Button variant="outline">Edit Billing Information</Button>
        </CardContent>
      </Card>
    </div>
  )
}
