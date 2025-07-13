import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { feedbackId: string } }) {
  try {
    const { feedbackId } = params
    const body = await request.json()
    const { status } = body

    if (!status || !["new", "reviewed", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = (await clientPromise).db("feedbackpro")
    const collection = db.collection("feedback")

    const result = await collection.updateOne(
      { _id: new ObjectId(feedbackId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { feedbackId: string } }) {
  try {
    const { feedbackId } = params

    const db = (await clientPromise).db("feedbackpro")
    const collection = db.collection("feedback")

    const result = await collection.deleteOne({ _id: new ObjectId(feedbackId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
