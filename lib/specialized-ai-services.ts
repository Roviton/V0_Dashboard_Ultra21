import { aiService } from "./ai-service-manager"
import { billOfLadingSchema, deliveryReceiptSchema, invoiceSchema } from "./ocr-schemas"

export class FreightAIServices {
  // Communication Services (using communication-optimized model)
  async generateBrokerEmail(loadDetails: any) {
    const prompt = `Generate a professional email to the broker about load ${loadDetails.id}. 
    The load is currently ${loadDetails.status} and scheduled for delivery on ${loadDetails.deliveryDate}.
    Include any relevant details about the driver, current location, and estimated arrival time.
    Use a professional but friendly tone appropriate for logistics industry communication.`

    return aiService.generateText(prompt, "communication")
  }

  async generateDriverInstructions(loadDetails: any) {
    const prompt = `Create clear, concise instructions for a truck driver handling load ${loadDetails.id} 
    from ${loadDetails.origin} to ${loadDetails.destination}. 
    Include all special handling requirements, contact information, and delivery instructions.
    Format the instructions in an easy-to-read bullet point format.`

    return aiService.generateText(prompt, "communication")
  }

  // Analysis Services (using analysis-optimized model)
  async analyzeLoadEfficiency(loadData: any) {
    const prompt = `Analyze this freight load data and provide insights on efficiency, 
    potential issues, and recommendations for optimization:
    ${JSON.stringify(loadData)}
    
    Focus on:
    1. Rate per mile analysis
    2. Route efficiency
    3. Potential delays or issues
    4. Recommendations for improvement
    
    Format your response as a structured analysis with clear sections.`

    return aiService.generateText(prompt, "analysis")
  }

  async generateLoadSummary(loads: any[]) {
    const prompt = `Analyze these freight loads and provide a summary of key metrics and insights:
    ${JSON.stringify(loads)}
    
    Include:
    - Total revenue and miles
    - Average RPM
    - Performance trends
    - Areas for improvement`

    return aiService.generateText(prompt, "analysis")
  }

  // OCR Services (using vision-optimized models)
  async extractBillOfLadingData(imageUrl: string) {
    const prompt = `Extract all information from this bill of lading document. 
    Pay special attention to shipper/consignee details, commodity information, weights, and any special handling instructions.`

    return aiService.generateStructuredData(prompt, billOfLadingSchema, imageUrl)
  }

  async extractDeliveryReceiptData(imageUrl: string) {
    const prompt = `Extract delivery information from this proof of delivery document. 
    Include delivery date/time, who received the shipment, condition of goods, and any damage or shortage notes.`

    return aiService.generateStructuredData(prompt, deliveryReceiptSchema, imageUrl)
  }

  async extractInvoiceData(imageUrl: string) {
    const prompt = `Extract billing information from this freight invoice. 
    Include all line items, rates, surcharges, and total amounts.`

    return aiService.generateStructuredData(prompt, invoiceSchema, imageUrl)
  }

  // General text processing
  async processCustomerFeedback(feedback: string) {
    const prompt = `Analyze this customer feedback for a freight company and provide:
    1. Sentiment analysis
    2. Key issues identified
    3. Recommended actions
    4. Priority level
    
    Feedback: ${feedback}`

    return aiService.generateText(prompt, "analysis")
  }
}

export const freightAI = new FreightAIServices()
