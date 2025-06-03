import { z } from "zod"

export const billOfLadingSchema = z.object({
  loadNumber: z.string(),
  proNumber: z.string().optional(),
  shipper: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    contact: z.string().optional(),
    phone: z.string().optional(),
  }),
  consignee: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    contact: z.string().optional(),
    phone: z.string().optional(),
  }),
  commodity: z.string(),
  weight: z.number(),
  pieces: z.number(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  hazmat: z.boolean().optional(),
  temperature: z.string().optional(),
  specialInstructions: z.string().optional(),
  pickupDate: z.string().optional(),
  deliveryDate: z.string().optional(),
})

export const deliveryReceiptSchema = z.object({
  loadNumber: z.string(),
  proNumber: z.string().optional(),
  deliveryDate: z.string(),
  deliveryTime: z.string().optional(),
  receivedBy: z.string(),
  signature: z.boolean(),
  condition: z.enum(["Good", "Damaged", "Short"]),
  damageDescription: z.string().optional(),
  shortageDescription: z.string().optional(),
  driverName: z.string().optional(),
  truckNumber: z.string().optional(),
  trailerNumber: z.string().optional(),
})

export const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  loadNumber: z.string(),
  customerName: z.string(),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      rate: z.number(),
      miles: z.number().optional(),
      amount: z.number(),
    }),
  ),
  fuelSurcharge: z.number().optional(),
  accessorialCharges: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number(),
      }),
    )
    .optional(),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
})

export const rateConfirmationSchema = z.object({
  loadNumber: z.string(),
  customerName: z.string(),
  carrierName: z.string(),
  origin: z.object({
    city: z.string(),
    state: z.string(),
    zip: z.string().optional(),
  }),
  destination: z.object({
    city: z.string(),
    state: z.string(),
    zip: z.string().optional(),
  }),
  commodity: z.string(),
  weight: z.number(),
  rate: z.number(),
  fuelSurcharge: z.number().optional(),
  accessorials: z.array(z.string()).optional(),
  pickupDate: z.string(),
  deliveryDate: z.string(),
  equipmentType: z.string(),
  specialRequirements: z.string().optional(),
})
