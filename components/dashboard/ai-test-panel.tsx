"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { APIKeyStatus } from "./api-key-status"

export function AITestPanel() {
  const [activeTab, setActiveTab] = useState("broker-email")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Sample load details
  const [loadDetails, setLoadDetails] = useState({
    id: "LD-12345",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    status: "In Transit",
    pickupDate: "2023-06-15",
    deliveryDate: "2023-06-17",
    commodity: "Electronics",
    weight: "15000 lbs",
    equipmentType: "Dry Van",
    specialRequirements: "Fragile items, handle with care",
  })

  // For OCR testing
  const [imageUrl, setImageUrl] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setLoadDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTest = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      let action: string
      let data: any = {}

      switch (activeTab) {
        case "broker-email":
          action = "generateBrokerEmail"
          data = { loadDetails }
          break

        case "driver-instructions":
          action = "generateDriverInstructions"
          data = { loadDetails }
          break

        case "document-ocr":
          action = "extractBillOfLadingData"
          data = { imageUrl }
          break

        default:
          throw new Error("Invalid test type")
      }

      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || "An error occurred")
      }

      setResult(responseData.result)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <APIKeyStatus />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Integration Test Panel</CardTitle>
          <CardDescription>Test your LLM integration with different AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="broker-email">Broker Email</TabsTrigger>
              <TabsTrigger value="driver-instructions">Driver Instructions</TabsTrigger>
              <TabsTrigger value="document-ocr">Document OCR</TabsTrigger>
            </TabsList>

            <TabsContent value="broker-email" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="load-id">Load ID</Label>
                  <Input
                    id="load-id"
                    value={loadDetails.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="load-status">Status</Label>
                  <Input
                    id="load-status"
                    value={loadDetails.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="load-origin">Origin</Label>
                  <Input
                    id="load-origin"
                    value={loadDetails.origin}
                    onChange={(e) => handleInputChange("origin", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="load-destination">Destination</Label>
                  <Input
                    id="load-destination"
                    value={loadDetails.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input
                    id="pickup-date"
                    value={loadDetails.pickupDate}
                    onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <Input
                    id="delivery-date"
                    value={loadDetails.deliveryDate}
                    onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="driver-instructions" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver-load-id">Load ID</Label>
                  <Input
                    id="driver-load-id"
                    value={loadDetails.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment-type">Equipment Type</Label>
                  <Input
                    id="equipment-type"
                    value={loadDetails.equipmentType}
                    onChange={(e) => handleInputChange("equipmentType", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver-origin">Origin</Label>
                  <Input
                    id="driver-origin"
                    value={loadDetails.origin}
                    onChange={(e) => handleInputChange("origin", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="driver-destination">Destination</Label>
                  <Input
                    id="driver-destination"
                    value={loadDetails.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special-requirements">Special Requirements</Label>
                <Textarea
                  id="special-requirements"
                  value={loadDetails.specialRequirements}
                  onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="document-ocr" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="image-url">Document Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/bill-of-lading.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a publicly accessible URL to a bill of lading image for testing OCR functionality
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-60 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap bg-slate-50 p-2 rounded">
                    {typeof result === "object" ? JSON.stringify(result, null, 2) : result}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleTest} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test AI Integration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
