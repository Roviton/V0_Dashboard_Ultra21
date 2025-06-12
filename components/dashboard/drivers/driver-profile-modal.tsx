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
import { Truck, FileText, Calendar, Phone, Mail, MapPin, AlertTriangle, CheckCircle, Clock, Upload } from "lucide-react"

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
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  driver_type: string
  license_number?: string
  license_state?: string
  license_expiration?: string
  equipment_preferences?: string[]
  fuel_card_number?: string
  truck_number?: string
  trailer_number?: string
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
  driver_messaging?: Array<{
    telegram_enabled: boolean
    whatsapp_enabled: boolean
    sms_enabled: boolean
    email_enabled: boolean
  }>
  driver_documents?: Array<{
    id: string
    document_type: string
    document_name: string
    expiration_date?: string
    status: string
  }>
  co_driver?: {
    id: string
    first_name: string
    last_name: string
  }
  license_type?: string
  license_expiry?: string
}

const EQUIPMENT_TYPES = [
  "Dry Van",
  "Refrigerated",
  "Flatbed",
  "Step Deck",
  "Lowboy",
  "Tanker",
  "Auto Hauler",
  "Container",
  "Box Truck",
  "Other",
]

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

export interface DriverUpdateInput {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  driver_type?: "company" | "owner_operator" | "lease_operator"
  license_number?: string
  license_state?: string
  license_expiry?: string
  license_type?: string
  truck_number?: string
  trailer_number?: string
  fuel_card_number?: string
  equipment_preferences?: string[]
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
          date_of_birth: data.date_of_birth,
          address_line_1: data.address_line_1,
          address_line_2: data.address_line_2,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          hire_date: data.hire_date,
          driver_type: data.driver_type as any,
          license_number: data.license_number,
          license_state: data.license_state,
          license_expiry: data.license_expiry,
          license_type: data.license_type,
          equipment_preferences: data.equipment_preferences,
          fuel_card_number: data.fuel_card_number,
          truck_number: data.truck_number,
          trailer_number: data.trailer_number,
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

  const handleEquipmentPreferenceChange = (equipment: string, checked: boolean) => {
    setEditData((prev) => ({
      ...prev,
      equipment_preferences: checked
        ? [...(prev.equipment_preferences || []), equipment]
        : (prev.equipment_preferences || []).filter((e) => e !== equipment),
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: "outline" as const, label: "Available", color: "text-green-600" },
      on_duty: { variant: "default" as const, label: "On Duty", color: "text-blue-600" },
      off_duty: { variant: "secondary" as const, label: "Off Duty", color: "text-gray-600" },
      on_break: { variant: "secondary" as const, label: "On Break", color: "text-yellow-600" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.off_duty
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (!driver && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                  <span className="text-sm text-muted-foreground">
                    {driver?.driver_type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact
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
                    {(driver?.city || driver?.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {driver.city}, {driver.state}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Equipment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver?.truck_number && (
                      <div className="text-sm">
                        <span className="font-medium">Truck:</span> {driver.truck_number}
                      </div>
                    )}
                    {driver?.trailer_number && (
                      <div className="text-sm">
                        <span className="font-medium">Trailer:</span> {driver.trailer_number}
                      </div>
                    )}
                    {driver?.fuel_card_number && (
                      <div className="text-sm">
                        <span className="font-medium">Fuel Card:</span> ****{driver.fuel_card_number.slice(-4)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver?.driver_performance?.[0] && (
                      <>
                        <div className="text-sm">
                          <span className="font-medium">Total Loads:</span> {driver.driver_performance[0].total_loads}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Total Miles:</span>{" "}
                          {driver.driver_performance[0].total_miles.toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Revenue:</span>{" "}
                          {formatCurrency(driver.driver_performance[0].total_revenue)}
                        </div>
                      </>
                    )}
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

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
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
                      {/* Add more editable fields as needed */}
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
                        <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                        <p className="text-sm">{driver?.date_of_birth || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{driver?.email || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-sm">{driver?.phone || "Not provided"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">
                          {[
                            driver?.address_line_1,
                            driver?.address_line_2,
                            driver?.city,
                            driver?.state,
                            driver?.zip_code,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                        <p className="text-sm">{driver?.emergency_contact_name || "Not provided"}</p>
                        {driver?.emergency_contact_phone && (
                          <p className="text-sm text-muted-foreground">{driver.emergency_contact_phone}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
                        <p className="text-sm">{driver?.hire_date || "Not provided"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_driver_type">Driver Type</Label>
                        <select
                          id="edit_driver_type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={editData.driver_type || ""}
                          onChange={(e) => handleInputChange("driver_type", e.target.value)}
                        >
                          <option value="">Select Driver Type</option>
                          <option value="company">Company Driver</option>
                          <option value="owner_operator">Owner Operator</option>
                          <option value="lease_operator">Lease Operator</option>
                        </select>
                      </div>
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
                        <Label htmlFor="edit_license_state">CDL State</Label>
                        <select
                          id="edit_license_state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={editData.license_state || ""}
                          onChange={(e) => handleInputChange("license_state", e.target.value)}
                        >
                          <option value="">Select State</option>
                          {US_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_license_expiry">CDL Expiration</Label>
                        <Input
                          id="edit_license_expiry"
                          type="date"
                          value={editData.license_expiry || ""}
                          onChange={(e) => handleInputChange("license_expiry", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_license_type">License Type</Label>
                        <select
                          id="edit_license_type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={editData.license_type || ""}
                          onChange={(e) => handleInputChange("license_type", e.target.value)}
                        >
                          <option value="">Select License Type</option>
                          <option value="Class A CDL">Class A CDL</option>
                          <option value="Class B CDL">Class B CDL</option>
                          <option value="Class C CDL">Class C CDL</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Driver Type</Label>
                        <p className="text-sm">
                          {driver?.driver_type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CDL Number</Label>
                        <p className="text-sm">{driver?.license_number || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CDL State</Label>
                        <p className="text-sm">{driver?.license_state || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CDL Expiration</Label>
                        <p className="text-sm">{driver?.license_expiry || "Not provided"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">License Type</Label>
                        <p className="text-sm">{driver?.license_type || "Not provided"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_truck_number">Truck Number</Label>
                        <Input
                          id="edit_truck_number"
                          value={editData.truck_number || ""}
                          onChange={(e) => handleInputChange("truck_number", e.target.value)}
                          placeholder="Enter truck number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_trailer_number">Trailer Number</Label>
                        <Input
                          id="edit_trailer_number"
                          value={editData.trailer_number || ""}
                          onChange={(e) => handleInputChange("trailer_number", e.target.value)}
                          placeholder="Enter trailer number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_fuel_card_number">Fuel Card Number</Label>
                        <Input
                          id="edit_fuel_card_number"
                          value={editData.fuel_card_number || ""}
                          onChange={(e) => handleInputChange("fuel_card_number", e.target.value)}
                          placeholder="Enter fuel card number"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Truck Number</Label>
                        <p className="text-sm">{driver?.truck_number || "Not assigned"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Trailer Number</Label>
                        <p className="text-sm">{driver?.trailer_number || "Not assigned"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fuel Card</Label>
                        <p className="text-sm">
                          {driver?.fuel_card_number ? `****${driver.fuel_card_number.slice(-4)}` : "Not assigned"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Driver Documents</span>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {driver?.driver_documents && driver.driver_documents.length > 0 ? (
                    <div className="space-y-3">
                      {driver.driver_documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDocumentStatusIcon(doc.status)}
                            <div>
                              <p className="font-medium text-sm">
                                {doc.document_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-muted-foreground">{doc.document_name}</p>
                              {doc.expiration_date && (
                                <p className="text-xs text-muted-foreground">
                                  Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              doc.status === "approved"
                                ? "default"
                                : doc.status === "expired"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {driver?.driver_performance?.[0] ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">Total Miles</div>
                        <div className="mt-1 text-2xl font-bold">
                          {driver.driver_performance[0].total_miles.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                        <div className="mt-1 text-2xl font-bold">
                          {formatCurrency(driver.driver_performance[0].total_revenue)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">Total Loads</div>
                        <div className="mt-1 text-2xl font-bold">{driver.driver_performance[0].total_loads}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground">Average RPM</div>
                        <div className="mt-1 text-2xl font-bold">
                          ${driver.driver_performance[0].average_rpm.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>On-Time Delivery Rate</span>
                          <span>{driver.driver_performance[0].on_time_delivery_rate}%</span>
                        </div>
                        <Progress value={driver.driver_performance[0].on_time_delivery_rate} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Load Acceptance Rate</span>
                          <span>{driver.driver_performance[0].load_acceptance_rate}%</span>
                        </div>
                        <Progress value={driver.driver_performance[0].load_acceptance_rate} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2" />
                      <p>No performance data available yet</p>
                      <p className="text-sm">
                        Performance metrics will appear after the driver completes their first load
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
