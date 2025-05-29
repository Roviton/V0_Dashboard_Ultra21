"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Paperclip } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LoadDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  load: any
}

export function LoadDetailsDialog({ isOpen, onClose, load }: LoadDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Load Details - {load.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left side - Rate Confirmation Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rate Confirmation</h3>
                <Badge variant="outline" className="ml-2">
                  {load.rate}
                </Badge>
              </div>
              <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-md border bg-white">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium">Rate Confirmation PDF</p>
                    <p className="text-xs text-muted-foreground">
                      {load.id} - {load.dispatcher}
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

          {/* Right side - Load Details */}
          <Card>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">
                  Load Details
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Load ID:</span>
                        <p>{load.id}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Status:</span>
                        <p>{load.status}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Origin:</span>
                        <p>{load.origin}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Destination:</span>
                        <p>{load.destination}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Pickup Date:</span>
                        <p>{load.pickupDate}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Delivery Date:</span>
                        <p>{load.deliveryDate}</p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Rate:</span>
                        <p>{load.rate}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Dispatcher:</span>
                        <p>{load.dispatcher}</p>
                      </div>

                      {/* Additional details that would be available in a real implementation */}
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Shipper Information:</span>
                        <p>ABC Shipping Co.</p>
                        <p>123 Warehouse Blvd, {load.origin}</p>
                        <p>Contact: John Smith (555-123-4567)</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Consignee Information:</span>
                        <p>XYZ Distribution Center</p>
                        <p>456 Delivery Ave, {load.destination}</p>
                        <p>Contact: Jane Doe (555-987-6543)</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Commodity:</span>
                        <p>General Freight - 42,000 lbs</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Equipment:</span>
                        <p>Dry Van - 53'</p>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">Special Instructions:</span>
                        <p className="whitespace-pre-line">
                          - Driver must check in at security gate - Lumper fee to be paid by carrier (reimbursable with
                          receipt) - Hard hat and safety vest required - Call consignee 1 hour before arrival
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="p-4">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Manager Comments:</span>
                  <p className="whitespace-pre-line">{load.comments || "No manager comments"}</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
