import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { analyzeSentiment } from "@/lib/ai-sentiment"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("formId")
    const userId = searchParams.get("userId")

    const { db } = await connectToDatabase()

    const query: any = {}
    if (formId) query.formId = formId
    if (userId) query.userId = userId

    const feedback = await db.collection("feedback").find(query).sort({ submittedAt: -1 }).toArray()

    // Convert ObjectId to string for serialization
    const serializedFeedback = feedback.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))

    return NextResponse.json(serializedFeedback)
  } catch (error) {
    console.error("GET /api/feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, responses, submittedAt, userId } = body

    if (!formId || !responses) {
      return NextResponse.json({ error: "Form ID and responses are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Analyze sentiment of text responses
    const textResponses = Object.values(responses).filter((response) => typeof response === "string")
    const combinedText = textResponses.join(" ")

    let sentiment = null
    if (combinedText.trim()) {
      try {
        sentiment = await analyzeSentiment(combinedText)
      } catch (error) {
        console.error("Sentiment analysis failed:", error)
        // Continue without sentiment if analysis fails
      }
    }

    const feedbackData = {
      formId: formId.toString(), // Ensure formId is stored as string for consistency
      responses,
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sentiment,
    }

    console.log("Storing feedback:", {
      formId: feedbackData.formId,
      hasResponses: !!responses,
      hasSentiment: !!sentiment,
      responseKeys: Object.keys(responses),
    })

    const result = await db.collection("feedback").insertOne(feedbackData)

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      sentiment,
    })
  } catch (error) {
    console.error("POST /api/feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
