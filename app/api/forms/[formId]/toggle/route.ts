import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = params
    const body = await request.json()
    const { isActive } = body

    const { db } = await connectToDatabase()

    const result = await db.collection("forms").updateOne(
      {
        $or: [
          { id: formId, userId: session.user.email },
          { _id: new ObjectId(formId), userId: session.user.email },
        ],
      },
      {
        $set: {
          isActive,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PATCH /api/forms/[formId]/toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
