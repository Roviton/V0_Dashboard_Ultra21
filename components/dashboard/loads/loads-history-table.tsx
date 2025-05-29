"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, FileText, Paperclip, Send, RefreshCw, MapPin, Mail, FileCheck, Edit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

// Define the Load type
interface Driver {
  name: string
  avatar: string
  phone?: string
}

interface Timeline {
  arrivedPickup: boolean
  departedPickup: boolean
  arrivedDelivery: boolean
  delivered: boolean
}

interface LoadDetails {
  originCompany: string
  originAddress: string
  pickupTime: string
  shipperContact: string
  shipperPhone: string
  pickupNumber: string
  destinationCompany: string
  destinationAddress: string
  deliveryTime: string
  consigneeContact: string
  consigneePhone: string
  deliveryNumber: string
  commodity: string
  weight: string
  quantity: string
  dimensions: string
  equipment: string
  rate: string
  distance: string
  rpm: string
  brokerContact: string
  brokerPhone: string
  brokerEmail: string
  notes?: string
}

interface Load {
  id: string
  reference: string
  customer: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: "completed" | "refused"
  driver: Driver
  timeline: Timeline
  createdAt: string
  details: LoadDetails
}

// Sample data for the table
const loadsData: Load[] = [
  {
    id: "L-1001",
    reference: "REF-12345",
    customer: "Acme Logistics",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickupDate: "16/05/2025",
    deliveryDate: "17/05/2025",
    status: "completed",
    driver: {
      name: "John Smith",
      avatar: "/intertwined-letters.png",
      phone: "555-444-3333",
    },
    timeline: {
      arrivedPickup: true,
      departedPickup: true,
      arrivedDelivery: true,
      delivered: true,
    },
    createdAt: "14/05/2025, 15:30:00",
    details: {
      originCompany: "LA Distribution Center",
      originAddress: "123 Industrial Blvd, Los Angeles, CA",
      pickupTime: "09:00-11:00",
      shipperContact: "Robert Garcia",
      shipperPhone: "555-123-4567",
      pickupNumber: "PU98765",
      destinationCompany: "Phoenix Warehouse",
      destinationAddress: "456 Desert Road, Phoenix, AZ",
      deliveryTime: "09:00-11:00",
      consigneeContact: "Maria Rodriguez",
      consigneePhone: "555-987-6543",
      deliveryNumber: "DEL54321",
      commodity: "General Freight",
      weight: "38,000 lbs",
      quantity: "16 pallets",
      dimensions: '48" x 40" x 60"',
      equipment: "Dry Van",
      rate: "$950",
      distance: "400 miles",
      rpm: "$2.38/mi",
      brokerContact: "Mike Johnson",
      brokerPhone: "555-789-0123",
      brokerEmail: "mike@acmelogistics.com",
      notes:
        "- Driver must check in at security gate\n- Lumper fee to be paid by carrier (reimbursable with receipt)\n- Hard hat and safety vest required\n- Call consignee 1 hour before arrival",
    },
  },
  {
    id: "L-1005",
    reference: "REF-56789",
    customer: "Acme Logistics",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    pickupDate: "14/05/2025",
    deliveryDate: "15/05/2025",
    status: "completed",
    driver: {
      name: "Tom Davis",
      avatar: "/abstract-geometric-TD.png",
      phone: "555-555-5555",
    },
    timeline: {
      arrivedPickup: true,
      departedPickup: true,
      arrivedDelivery: true,
      delivered: true,
    },
    createdAt: "13/05/2025, 16:30:00",
    details: {
      originCompany: "ABC Warehouse",
      originAddress: "123 Shipping Lane, Seattle, WA",
      pickupTime: "14:00-16:00",
      shipperContact: "John Smith",
      shipperPhone: "555-123-4567",
      pickupNumber: "PU12345",
      destinationCompany: "XYZ Distribution Center",
      destinationAddress: "456 Receiving Blvd, Portland, OR",
      deliveryTime: "09:00-11:00",
      consigneeContact: "Jane Doe",
      consigneePhone: "555-987-6543",
      deliveryNumber: "DEL67890",
      commodity: "General Freight",
      weight: "42,000 lbs",
      quantity: "12 pallets",
      dimensions: '48" x 40" x 60"',
      equipment: "Dry Van",
      rate: "$580",
      distance: "175 miles",
      rpm: "$3.31/mi",
      brokerContact: "Mike Johnson",
      brokerPhone: "555-789-0123",
      brokerEmail: "mike@acmelogistics.com",
      notes:
        "- Driver must check in at security gate\n- Lumper fee to be paid by carrier (reimbursable with receipt)\n- Hard hat and safety vest required\n- Call consignee 1 hour before arrival",
    },
  },
  {
    id: "L-1006",
    reference: "REF-67890",
    customer: "Global Transport Inc.",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickupDate: "15/05/2025",
    deliveryDate: "16/05/2025",
    status: "refused",
    driver: {
      name: "Sarah Johnson",
      avatar: "/stylized-letters-sj.png",
      phone: "555-222-3333",
    },
    timeline: {
      arrivedPickup: false,
      departedPickup: false,
      arrivedDelivery: false,
      delivered: false,
    },
    createdAt: "13/05/2025, 14:10:00",
    details: {
      originCompany: "Mountain Depot",
      originAddress: "789 Highland Ave, Denver, CO",
      pickupTime: "10:00-12:00",
      shipperContact: "Robert Miller",
      shipperPhone: "555-444-7777",
      pickupNumber: "PU67890",
      destinationCompany: "Valley Distribution",
      destinationAddress: "321 Lake View Dr, Salt Lake City, UT",
      deliveryTime: "13:00-15:00",
      consigneeContact: "Emily Wilson",
      consigneePhone: "555-888-9999",
      deliveryNumber: "DEL12345",
      commodity: "Electronics",
      weight: "18,000 lbs",
      quantity: "8 pallets",
      dimensions: '42" x 42" x 48"',
      equipment: "Dry Van",
      rate: "$750",
      distance: "520 miles",
      rpm: "$1.44/mi",
      brokerContact: "Lisa Thompson",
      brokerPhone: "555-333-2222",
      brokerEmail: "lisa@globaltransport.com",
      notes:
        "- High value shipment\n- Signature required upon delivery\n- Temperature sensitive cargo\n- No overnight parking at unsecured locations",
    },
  },
  {
    id: "L-1007",
    reference: "REF-78901",
    customer: "FastFreight Co.",
    origin: "Atlanta, GA",
    destination: "Nashville, TN",
    pickupDate: "12/05/2025",
    deliveryDate: "13/05/2025",
    status: "completed",
    driver: {
      name: "Mike Williams",
      avatar: "/abstract-geometric-mg.png",
      phone: "555-777-8888",
    },
    timeline: {
      arrivedPickup: true,
      departedPickup: true,
      arrivedDelivery: true,
      delivered: true,
    },
    createdAt: "11/05/2025, 13:20:00",
    details: {
      originCompany: "Southern Logistics Hub",
      originAddress: "456 Peachtree St, Atlanta, GA",
      pickupTime: "08:00-10:00",
      shipperContact: "David Brown",
      shipperPhone: "555-111-2222",
      pickupNumber: "PU23456",
      destinationCompany: "Music City Warehouse",
      destinationAddress: "789 Broadway Ave, Nashville, TN",
      deliveryTime: "14:00-16:00",
      consigneeContact: "Amanda Clark",
      consigneePhone: "555-333-4444",
      deliveryNumber: "DEL34567",
      commodity: "Auto Parts",
      weight: "28,000 lbs",
      quantity: "14 pallets",
      dimensions: '48" x 48" x 52"',
      equipment: "Dry Van",
      rate: "$620",
      distance: "250 miles",
      rpm: "$2.48/mi",
      brokerContact: "James Wilson",
      brokerPhone: "555-666-7777",
      brokerEmail: "james@fastfreight.com",
      notes:
        "- Dock appointment required\n- Driver to assist with unloading\n- Call dispatch if delayed\n- Bring pallet jack",
    },
  },
  {
    id: "L-1008",
    reference: "REF-89012",
    customer: "Prime Shipping LLC",
    origin: "Boston, MA",
    destination: "New York, NY",
    pickupDate: "10/05/2025",
    deliveryDate: "10/05/2025",
    status: "completed",
    driver: {
      name: "John Smith",
      avatar: "/intertwined-letters.png",
      phone: "555-444-3333",
    },
    timeline: {
      arrivedPickup: true,
      departedPickup: true,
      arrivedDelivery: true,
      delivered: true,
    },
    createdAt: "09/05/2025, 15:45:00",
    details: {
      originCompany: "Eastern Supply Center",
      originAddress: "123 Harbor St, Boston, MA",
      pickupTime: "07:00-09:00",
      shipperContact: "Patricia Lee",
      shipperPhone: "555-222-1111",
      pickupNumber: "PU34567",
      destinationCompany: "Manhattan Distribution",
      destinationAddress: "456 5th Ave, New York, NY",
      deliveryTime: "13:00-15:00",
      consigneeContact: "Richard Taylor",
      consigneePhone: "555-999-8888",
      deliveryNumber: "DEL45678",
      commodity: "Pharmaceuticals",
      weight: "12,000 lbs",
      quantity: "6 pallets",
      dimensions: '36" x 36" x 48"',
      equipment: "Refrigerated",
      rate: "$480",
      distance: "215 miles",
      rpm: "$2.23/mi",
      brokerContact: "Susan Martin",
      brokerPhone: "555-777-6666",
      brokerEmail: "susan@primeshipping.com",
      notes:
        "- Temperature must be maintained at 38-42°F\n- Product requires gentle handling\n- Delivery appointment required\n- Call ahead 2 hours before arrival",
    },
  },
  {
    id: "L-1009",
    reference: "REF-90123",
    customer: "Acme Logistics",
    origin: "San Francisco, CA",
    destination: "Sacramento, CA",
    pickupDate: "08/05/2025",
    deliveryDate: "08/05/2025",
    status: "refused",
    driver: {
      name: "Tom Davis",
      avatar: "/abstract-geometric-TD.png",
      phone: "555-555-5555",
    },
    timeline: {
      arrivedPickup: false,
      departedPickup: false,
      arrivedDelivery: false,
      delivered: false,
    },
    createdAt: "07/05/2025, 11:30:00",
    details: {
      originCompany: "Bay Area Fulfillment",
      originAddress: "789 Market St, San Francisco, CA",
      pickupTime: "10:00-12:00",
      shipperContact: "Michael Chen",
      shipperPhone: "555-666-5555",
      pickupNumber: "PU45678",
      destinationCompany: "Capital City Distribution",
      destinationAddress: "321 Capitol Ave, Sacramento, CA",
      deliveryTime: "15:00-17:00",
      consigneeContact: "Jennifer Lopez",
      consigneePhone: "555-444-5555",
      deliveryNumber: "DEL56789",
      commodity: "Retail Goods",
      weight: "22,000 lbs",
      quantity: "10 pallets",
      dimensions: '48" x 40" x 60"',
      equipment: "Dry Van",
      rate: "$380",
      distance: "90 miles",
      rpm: "$4.22/mi",
      brokerContact: "Daniel White",
      brokerPhone: "555-333-1111",
      brokerEmail: "daniel@acmelogistics.com",
      notes:
        "- Driver refused load due to equipment issues\n- Rescheduled for next day\n- Notify warehouse of delay\n- Special handling required for fragile items",
    },
  },
]

export function LoadsHistoryTable() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Load ID</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadsData.map((load) => (
            <>
              <TableRow key={load.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(load.id)}>
                <TableCell className="font-medium">{load.id}</TableCell>
                <TableCell>{load.reference}</TableCell>
                <TableCell>{load.customer}</TableCell>
                <TableCell>{load.origin}</TableCell>
                <TableCell>{load.destination}</TableCell>
                <TableCell>{load.pickupDate}</TableCell>
                <TableCell>{load.deliveryDate}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      load.status === "completed"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }
                  >
                    {load.status === "completed" ? "Completed" : "Refused"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={load.driver.avatar || "/placeholder.svg"} alt={load.driver.name} />
                      <AvatarFallback>
                        {load.driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{load.driver.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {load.status === "completed" ? (
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">Arrived PU</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">Departed PU</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">Arrived DL</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">Delivered</div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Arrived PU</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Departed PU</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Arrived DL</div>
                      <div className="px-0.5 text-muted-foreground">→</div>
                      <div className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Delivered</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>{load.createdAt}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {expandedRow === load.id && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={12} className="p-0">
                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                      {/* Left side - Rate Confirmation Preview */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                            <Badge variant="outline" className="ml-2">
                              {load.details.rate}
                            </Badge>
                          </div>
                          <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-md border bg-white">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center justify-center text-center">
                                <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm font-medium">Rate Confirmation PDF</p>
                                <p className="text-xs text-muted-foreground">
                                  {load.reference} - {load.customer}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span>rate-confirmation-{load.id.toLowerCase()}.pdf</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Right side - Tabs for Load Details, Communication, and Broker Updates */}
                      <Card className="overflow-hidden">
                        <Tabs defaultValue="details">
                          <TabsList className="w-full rounded-none border-b bg-muted/50">
                            <TabsTrigger
                              value="details"
                              className="flex-1 rounded-none data-[state=active]:bg-background"
                            >
                              Load Details
                            </TabsTrigger>
                            <TabsTrigger
                              value="communication"
                              className="flex-1 rounded-none data-[state=active]:bg-background"
                            >
                              Communication
                            </TabsTrigger>
                            <TabsTrigger
                              value="broker"
                              className="flex-1 rounded-none data-[state=active]:bg-background"
                            >
                              Broker Updates
                            </TabsTrigger>
                          </TabsList>

                          {/* Load Details Tab */}
                          <TabsContent value="details" className="p-0 flex-1 flex flex-col h-full">
                            <div className="p-4 h-full">
                              <ScrollArea className="h-[400px] pr-4">
                                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Load ID / Reference:
                                    </span>
                                    <p>
                                      {load.id} / {load.reference}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Broker/Customer:</span>
                                    <p>{load.customer}</p>
                                  </div>

                                  <div className="md:col-span-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Origin Name & Address:
                                    </span>
                                    <p>{load.details.originCompany}</p>
                                    <p>{load.details.originAddress}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Pickup Date & Time:
                                    </span>
                                    <p>
                                      {load.pickupDate} {load.details.pickupTime}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Shipper Contact:</span>
                                    <p>
                                      {load.details.shipperContact} • {load.details.shipperPhone}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Pickup Number (PU#):
                                    </span>
                                    <p>{load.details.pickupNumber}</p>
                                  </div>

                                  <div className="md:col-span-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Destination Name & Address:
                                    </span>
                                    <p>{load.details.destinationCompany}</p>
                                    <p>{load.details.destinationAddress}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Delivery Date & Time:
                                    </span>
                                    <p>
                                      {load.deliveryDate} {load.details.deliveryTime}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Consignee Contact:
                                    </span>
                                    <p>
                                      {load.details.consigneeContact} • {load.details.consigneePhone}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Delivery Number (DEL#):
                                    </span>
                                    <p>{load.details.deliveryNumber}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Commodity:</span>
                                    <p>{load.details.commodity}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Weight:</span>
                                    <p>{load.details.weight}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Quantity:</span>
                                    <p>{load.details.quantity}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Dimensions:</span>
                                    <p>{load.details.dimensions}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Equipment Type:</span>
                                    <p>{load.details.equipment}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Rate:</span>
                                    <p>{load.details.rate}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Distance:</span>
                                    <p>{load.details.distance}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">RPM:</span>
                                    <p>{load.details.rpm}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Status:</span>
                                    <p className="capitalize">{load.status}</p>
                                  </div>

                                  <div className="md:col-span-2">
                                    <span className="text-xs font-medium text-muted-foreground">Broker Contact:</span>
                                    <p>
                                      {load.details.brokerContact} • {load.details.brokerPhone} •{" "}
                                      {load.details.brokerEmail}
                                    </p>
                                  </div>

                                  <div className="md:col-span-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Special Instructions / Notes:
                                    </span>
                                    <p className="whitespace-pre-line">
                                      {load.details.notes || "No special instructions provided."}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                  <span className="text-xs font-medium text-muted-foreground">Assigned Driver:</span>
                                  <div className="mt-2 flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={load.driver.avatar || "/placeholder.svg"}
                                        alt={load.driver.name}
                                      />
                                      <AvatarFallback>
                                        {load.driver.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{load.driver.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {load.driver.phone || "555-555-5555"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>
                            </div>
                          </TabsContent>

                          {/* Communication Tab */}
                          <TabsContent value="communication" className="p-0">
                            <div className="flex flex-col h-[500px]">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src="/professional-driver.png" alt="Unassigned Driver" />
                                    <AvatarFallback>UD</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">Unassigned Driver</p>
                                    <p className="text-xs text-muted-foreground">via Telegram Bot</p>
                                  </div>
                                </div>
                                <Badge variant="outline">Active</Badge>
                              </div>

                              {/* Messages */}
                              <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                  {/* Dispatcher Message */}
                                  <div className="flex justify-end gap-3">
                                    <div className="max-w-[80%] rounded-lg bg-blue-600 p-4 text-white">
                                      <div className="mb-1 flex items-center justify-between">
                                        <span className="font-medium">Dispatcher</span>
                                        <span className="text-xs opacity-80">14/05/2025, 15:45:00</span>
                                      </div>
                                      <p>
                                        Hello, you have been assigned to load {load.id} from {load.origin} to{" "}
                                        {load.destination}. Pickup is scheduled for {load.pickupDate} and delivery for{" "}
                                        {load.deliveryDate}. Please confirm if you accept this assignment.
                                      </p>
                                    </div>
                                    <Avatar className="h-10 w-10 self-start">
                                      <AvatarImage src="/emergency-dispatcher.png" alt="Dispatcher" />
                                      <AvatarFallback>D</AvatarFallback>
                                    </Avatar>
                                  </div>

                                  {/* Driver Message */}
                                  <div className="flex gap-3">
                                    <Avatar className="h-10 w-10 self-start">
                                      <AvatarImage src="/professional-driver.png" alt="Driver" />
                                      <AvatarFallback>D</AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-[80%] rounded-lg bg-gray-100 p-4">
                                      <div className="mb-1 flex items-center justify-between">
                                        <span className="font-medium">Driver</span>
                                        <span className="text-xs text-muted-foreground">14/05/2025, 16:10:00</span>
                                      </div>
                                      <p>I accept the load. Will be at pickup location on time.</p>
                                    </div>
                                  </div>

                                  {/* Dispatcher Message */}
                                  <div className="flex justify-end gap-3">
                                    <div className="max-w-[80%] rounded-lg bg-blue-600 p-4 text-white">
                                      <div className="mb-1 flex items-center justify-between">
                                        <span className="font-medium">Dispatcher</span>
                                        <span className="text-xs opacity-80">14/05/2025, 16:15:00</span>
                                      </div>
                                      <p>Great! Let me know when you arrive at the pickup location.</p>
                                    </div>
                                    <Avatar className="h-10 w-10 self-start">
                                      <AvatarImage src="/emergency-dispatcher.png" alt="Dispatcher" />
                                      <AvatarFallback>D</AvatarFallback>
                                    </Avatar>
                                  </div>

                                  {/* AI Draft */}
                                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-yellow-800">AI Draft</span>
                                        <span className="text-xs text-muted-foreground">Generated just now</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <RefreshCw className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <FileCheck className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm">
                                      Hello Driver, this is a status check for load {load.id}. Are you still on schedule
                                      for delivery at {load.destination} by {load.deliveryDate} 09:00-11:00? Please
                                      confirm your ETA or let me know if you're experiencing any delays.
                                    </p>
                                  </div>
                                </div>
                              </ScrollArea>

                              {/* Message Input */}
                              <div className="border-t p-4">
                                <div className="mb-3 flex gap-2">
                                  <Button variant="outline" size="sm" className="h-8">
                                    <Mail className="mr-1 h-3 w-3" />
                                    New Message
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Status Update
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    Request Location
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Textarea
                                    placeholder="Type your message or use the AI draft above..."
                                    className="min-h-[60px]"
                                  />
                                  <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Broker Updates Tab */}
                          <TabsContent value="broker" className="p-0">
                            <div className="flex flex-col h-[500px]">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src="/broker.png" alt="Mike Johnson" />
                                    <AvatarFallback>MJ</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{load.details.brokerContact}</p>
                                    <p className="text-xs text-muted-foreground">{load.details.brokerEmail}</p>
                                  </div>
                                </div>
                                <Badge variant="outline">Email</Badge>
                              </div>

                              {/* Email List */}
                              <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                  {/* Email 1 */}
                                  <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex-1">
                                        <p className="font-medium">Load Update: {load.id} - Driver Assigned</p>
                                        <p className="text-xs text-muted-foreground">
                                          To: broker@{load.customer.toLowerCase().replace(/\s+/g, "")}.com
                                        </p>
                                      </div>
                                      <span className="text-xs text-muted-foreground">Sent: 14/05/2025, 15:50:00</span>
                                    </div>
                                  </div>

                                  {/* Email 2 */}
                                  <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex-1">
                                        <p className="font-medium">
                                          Load Update: {load.id} - Driver En Route to Pickup
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          To: broker@{load.customer.toLowerCase().replace(/\s+/g, "")}.com
                                        </p>
                                      </div>
                                      <span className="text-xs text-muted-foreground">Sent: 14/05/2025, 16:20:00</span>
                                    </div>
                                  </div>

                                  {/* AI Draft Email */}
                                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-yellow-800">AI Draft Email</span>
                                        <span className="text-xs text-muted-foreground">Generated just now</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <RefreshCw className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <FileCheck className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        Subject: Load Update: {load.id} - Driver En Route to Delivery
                                      </p>
                                      <p className="text-sm">To: {load.details.brokerEmail}</p>
                                      <div className="border-t border-yellow-200 my-2"></div>
                                      <p className="text-sm">Hello {load.details.brokerContact.split(" ")[0]},</p>
                                      <p className="text-sm">
                                        I'm writing to provide an update on load {load.id} ({load.reference}).
                                      </p>
                                      <p className="text-sm">
                                        Our driver {load.driver.name} has departed from the pickup location in{" "}
                                        {load.origin} and is currently en route to {load.destination}. Based on current
                                        traffic and conditions, the estimated time of arrival is {load.deliveryDate} at
                                        approximately 09:00.
                                      </p>
                                      <p className="text-sm">
                                        The load is secure and there are no issues to report at this time. We will
                                        notify you of any changes or upon arrival at the destination.
                                      </p>
                                      <p className="text-sm">
                                        Please let me know if you have any questions or require additional information.
                                      </p>
                                      <p className="text-sm">Best regards,</p>
                                      <p className="text-sm">Your Dispatcher</p>
                                      <p className="text-sm">Your Company Name</p>
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>

                              {/* Email Actions */}
                              <div className="border-t p-4">
                                <div className="mb-3 flex gap-2">
                                  <Button variant="outline" size="sm" className="h-8">
                                    <Mail className="mr-1 h-3 w-3" />
                                    New Email
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Status Update
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8">
                                    <FileCheck className="mr-1 h-3 w-3" />
                                    Send POD
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send AI Draft Email
                                  </Button>
                                  <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Draft
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </Card>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">6 load(s) total</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
