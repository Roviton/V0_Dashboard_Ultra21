"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getDriverById, updateDriver } from "@/actions/driver-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Truck, Phone, Mail } from "lucide-react"

interface DriverProfileModalProps {
  isOpen: boolean
  onClose: () => void
  driverId: string | null
}

interface DriverData {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  license_number?: string
  notes?: string
  status: string
  avatar_url?: string
  driver_performance?: Array<{
    total_miles: number
    total_revenue: number
    total_loads: number
    on_time_delivery_rate: number
    load_acceptance_rate: number
    average_rpm: number
  }>
}

export interface DriverUpdateInput {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  license_number?: string
  notes?: string
}

export function DriverProfileModal({ isOpen, onClose, driverId }: DriverProfileModalProps) {
  const [driver, setDriver] = useState<DriverData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<DriverUpdateInput>({} as DriverUpdateInput)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && driverId) {
      loadDriverData()
    } else if (!isOpen) {
      // Reset state when modal closes
      setDriver(null)
      setEditData({} as DriverUpdateInput)
      setIsEditing(false)
    }
  }, [isOpen, driverId])

  const loadDriverData = async () => {
    if (!driverId) return

    setIsLoading(true)
    try {
      const data = await getDriverById(driverId)
      if (data) {
        setDriver(data)
        setEditData({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          license_number: data.license_number,
          notes: data.notes,
        })
      }
    } catch (error: any) {
      console.error("Error loading driver:", error)
      toast({
        title: "Error loading driver",
        description: error.message || "Failed to load driver data",
        variant: "destructive",
      })
      onClose() // Close modal on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editData.id) return

    setIsLoading(true)
    try {
      await updateDriver(editData)
      await loadDriverData() // Reload data
      setIsEditing(false)
      toast({
        title: "Driver updated",
        description: "Driver information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error updating driver",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof DriverUpdateInput, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: "outline" as const, label: "Available", color: "text-green-600" },
      booked: { variant: "default" as const, label: "Booked", color: "text-blue-600" },
      out_of_service: { variant: "secondary" as const, label: "Out of Service", color: "text-red-600" },
      on_vacation: { variant: "secondary" as const, label: "On Vacation", color: "text-yellow-600" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (!driver && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={driver?.avatar_url || "/placeholder.svg"}
                  alt={`${driver?.first_name} ${driver?.last_name}`}
                />
                <AvatarFallback className="text-lg">
                  {driver?.first_name?.[0]}
                  {driver?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {driver?.first_name} {driver?.last_name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  {driver?.status && getStatusBadge(driver.status)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Driver</Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading driver information...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{driver.phone}</span>
                      </div>
                    )}
                    {driver?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{driver.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Professional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver?.license_number && (
                      <div className="text-sm">
                        <span className="font-medium">CDL:</span> {driver.license_number}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> {driver?.status}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              {driver?.driver_performance?.[0] && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>On-Time Delivery</span>
                          <span>{driver.driver_performance[0].on_time_delivery_rate}%</span>
                        </div>
                        <Progress value={driver.driver_performance[0].on_time_delivery_rate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Load Acceptance Rate</span>
                          <span>{driver.driver_performance[0].load_acceptance_rate}%</span>
                        </div>
                        <Progress value={driver.driver_performance[0].load_acceptance_rate} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_first_name">First Name</Label>
                          <Input
                            id="edit_first_name"
                            value={editData.first_name || ""}
                            onChange={(e) => handleInputChange("first_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_last_name">Last Name</Label>
                          <Input
                            id="edit_last_name"
                            value={editData.last_name || ""}
                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_email">Email</Label>
                          <Input
                            id="edit_email"
                            type="email"
                            value={editData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_phone">Phone</Label>
                          <Input
                            id="edit_phone"
                            value={editData.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_license_number">CDL Number</Label>
                          <Input
                            id="edit_license_number"
                            value={editData.license_number || ""}
                            onChange={(e) => handleInputChange("license_number", e.target.value)}
                            placeholder="Enter CDL number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_notes">Notes</Label>
                          <Input
                            id="edit_notes"
                            value={editData.notes || ""}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Enter notes"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-sm">
                          {driver?.first_name} {driver?.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{driver?.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-sm">{driver?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CDL Number</Label>
                        <p className="text-sm">{driver?.license_number || "Not provided"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        <p className="text-sm">{driver?.notes || "No notes"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
