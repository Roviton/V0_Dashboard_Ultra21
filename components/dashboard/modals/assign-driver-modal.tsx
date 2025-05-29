"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Sample driver data
const drivers = [
  {
    id: "D1",
    name: "John Smith",
    avatar: "/javascript-code.png",
    status: "Available",
    location: "Los Angeles, CA",
    lastDelivery: "2 hours ago",
    rating: 4.8,
  },
  {
    id: "D2",
    name: "Sarah Johnson",
    avatar: "/stylized-letters-sj.png",
    status: "Available",
    location: "Phoenix, AZ",
    lastDelivery: "3 hours ago",
    rating: 4.9,
  },
  {
    id: "D3",
    name: "Mike Williams",
    avatar: "/intertwined-letters.png",
    status: "On Delivery",
    location: "San Diego, CA",
    lastDelivery: "In progress",
    rating: 4.7,
  },
  {
    id: "D4",
    name: "Tom Davis",
    avatar: "/abstract-geometric-TD.png",
    status: "Available",
    location: "Las Vegas, NV",
    lastDelivery: "Yesterday",
    rating: 4.6,
  },
]

type Load = {
  id: string
  reference: string
  customer: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: string
  driver?: {
    name: string
    avatar: string
  }
}

interface AssignDriverModalProps {
  isOpen: boolean
  onClose: () => void
  load: Load
}

export function AssignDriverModal({ isOpen, onClose, load }: AssignDriverModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [messageTab, setMessageTab] = useState<string>("ai-generated")
  const [messageText, setMessageText] = useState<string>(
    `Hello, you have been assigned to load ${load.id} from ${load.origin} to ${load.destination}. Pickup is scheduled for ${new Date(load.pickupDate).toLocaleDateString()} and delivery for ${new Date(load.deliveryDate).toLocaleDateString()}. Please confirm if you accept this assignment.`,
  )
  const { toast } = useToast()

  const handleAssign = () => {
    if (!selectedDriver) {
      toast({
        title: "Error",
        description: "Please select a driver",
        variant: "destructive",
      })
      return
    }

    // Here you would call your API to assign the driver and send notification
    toast({
      title: "Driver assigned",
      description: `Notification sent to driver for load ${load.id}`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Driver to Load {load.id}</DialogTitle>
          <DialogDescription>
            Select a driver to assign to this load from {load.origin} to {load.destination}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Load Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span> {load.customer}
              </div>
              <div>
                <span className="text-muted-foreground">Reference:</span> {load.reference}
              </div>
              <div>
                <span className="text-muted-foreground">Origin:</span> {load.origin}
              </div>
              <div>
                <span className="text-muted-foreground">Destination:</span> {load.destination}
              </div>
              <div>
                <span className="text-muted-foreground">Pickup:</span> {new Date(load.pickupDate).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Delivery:</span>{" "}
                {new Date(load.deliveryDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select Driver</h3>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        <AvatarFallback>
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{driver.name}</span>
                      <Badge variant={driver.status === "Available" ? "outline" : "secondary"} className="ml-auto">
                        {driver.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDriver && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Driver Information</h3>
              <div className="rounded-lg border p-3">
                {drivers
                  .filter((d) => d.id === selectedDriver)
                  .map((driver) => (
                    <div key={driver.id} className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        <AvatarFallback>
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{driver.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          <p>Current location: {driver.location}</p>
                          <p>Last delivery: {driver.lastDelivery}</p>
                          <p>Rating: {driver.rating}/5.0</p>
                        </div>
                      </div>
                      <Badge variant={driver.status === "Available" ? "outline" : "secondary"} className="ml-auto">
                        {driver.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notification Message</h3>
            <Tabs defaultValue="ai-generated" value={messageTab} onValueChange={setMessageTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-generated">AI Generated</TabsTrigger>
                <TabsTrigger value="custom">Custom Message</TabsTrigger>
              </TabsList>
              <TabsContent value="ai-generated" className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  This message was automatically generated based on the load details. You can edit it if needed.
                </p>
                <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
              </TabsContent>
              <TabsContent value="custom" className="space-y-2">
                <p className="text-xs text-muted-foreground">Write a custom message to send to the driver.</p>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="Enter your custom message here..."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>Assign & Notify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
