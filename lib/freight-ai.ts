import { z } from "zod"
import { aiService } from "./ai-service"

// Schemas for structured data extraction
export const billOfLadingSchema = z.object({
  loadNumber: z.string().optional(),
  shipper: z
    .object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    })
    .optional(),
  consignee: z
    .object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    })
    .optional(),
  commodity: z.string().optional(),
  weight: z.number().optional(),
  pieces: z.number().optional(),
  rate: z.number().optional(),
  specialInstructions: z.string().optional(),
})

export const freightAI = {
  // Generate broker email based on load details
  async generateBrokerEmail(loadDetails: any) {
    const prompt = `Generate a professional email to the broker about load ${loadDetails.id}. 
    
    Load Details:
    - Status: ${loadDetails.status}
    - Origin: ${loadDetails.origin}
    - Destination: ${loadDetails.destination}
    - Pickup Date: ${loadDetails.pickupDate}
    - Delivery Date: ${loadDetails.deliveryDate}
    - Commodity: ${loadDetails.commodity}
    - Equipment: ${loadDetails.equipmentType}
    
    The email should be professional, concise, and include relevant updates about the load status.
    Include a clear subject line and professional closing.`

    return aiService.generateText(prompt, { temperature: 0.5 })
  },

  // Generate driver instructions
  async generateDriverInstructions(loadDetails: any) {
    const prompt = `Create clear, detailed instructions for a truck driver handling load ${loadDetails.id}.
    
    Load Information:
    - Origin: ${loadDetails.origin}
    - Destination: ${loadDetails.destination}
    - Commodity: ${loadDetails.commodity}
    - Weight: ${loadDetails.weight}
    - Equipment Type: ${loadDetails.equipmentType}
    - Special Requirements: ${loadDetails.specialRequirements}
    - Pickup Date: ${loadDetails.pickupDate}
    - Delivery Date: ${loadDetails.deliveryDate}
    
    Format the instructions as clear, numbered steps. Include:
    1. Pickup instructions and requirements
    2. Special handling requirements
    3. Delivery instructions
    4. Safety considerations
    5. Contact information reminders
    
    Keep the language clear and professional, suitable for truck drivers.`

    return aiService.generateText(prompt, { temperature: 0.3 })
  },

  // Extract data from bill of lading images
  async extractBillOfLadingData(imageUrl: string) {
    const prompt = `Extract all relevant information from this bill of lading document. 
    Pay special attention to:
    - Load/shipment numbers
    - Shipper and consignee information (names, addresses)
    - Commodity description
    - Weight and piece count
    - Rate information
    - Special handling instructions
    
    If any information is not clearly visible or missing, omit that field rather than guessing.`

    return aiService.generateStructuredData(prompt, billOfLadingSchema, imageUrl, { temperature: 0.1 })
  },

  // Analyze load efficiency and provide insights
  async analyzeLoadEfficiency(loadData: any) {
    const prompt = `Analyze this freight load data and provide insights on efficiency, potential issues, and recommendations:
    
    ${JSON.stringify(loadData, null, 2)}
    
    Focus on:
    1. Rate per mile analysis
    2. Route efficiency
    3. Potential delays or issues
    4. Recommendations for improvement
    5. Profitability assessment
    
    Provide actionable insights that a freight dispatcher can use to optimize operations.`

    return aiService.generateText(prompt, { temperature: 0.2 })
  },
}
