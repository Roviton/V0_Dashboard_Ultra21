import { generateBrokerEmail } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { loadDetails } = await request.json()

    if (!loadDetails || !loadDetails.id) {
      return Response.json({ error: "Missing load details" }, { status: 400 })
    }

    const emailContent = await generateBrokerEmail(loadDetails)

    return Response.json({ emailContent })
  } catch (error) {
    console.error("Error generating email:", error)
    return Response.json({ error: "Failed to generate email" }, { status: 500 })
  }
}
