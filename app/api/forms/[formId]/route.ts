import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params
    console.log("Fetching form with ID:", formId)

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Try to find form by custom id first, then by MongoDB _id
    let form = await db.collection("forms").findOne({ id: formId })

    if (!form && ObjectId.isValid(formId)) {
      form = await db.collection("forms").findOne({ _id: new ObjectId(formId) })
    }

    if (!form) {
      console.log("Form not found:", formId)
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Check if form is active for public access
    if (!form.isActive) {
      console.log("Form is inactive:", formId)
      return NextResponse.json({ error: "This form is currently inactive" }, { status: 403 })
    }

    // Serialize the form data
    const serializedForm = {
      id: form.id || form._id.toString(),
      _id: form._id.toString(),
      title: form.title || "Untitled Form",
      description: form.description || "",
      fields: form.fields || [],
      userId: form.userId,
      isActive: form.isActive,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      settings: form.settings || {},
    }

    console.log("Form found and serialized:", serializedForm.id)
    return NextResponse.json(serializedForm)
  } catch (error) {
    console.error("GET /api/forms/[formId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = params
    const { db } = await connectToDatabase()

    // Find and delete the form
    const result = await db.collection("forms").deleteOne({
      $or: [
        { id: formId, userId: session.user.email },
        { _id: new ObjectId(formId), userId: session.user.email },
      ],
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 })
    }

    // Also delete associated feedback
    await db.collection("feedback").deleteMany({ formId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/forms/[formId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { formId } = params
    const body = await request.json()
    const { db } = await connectToDatabase()

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("forms").updateOne(
      {
        $or: [
          { id: formId, userId: session.user.email },
          { _id: new ObjectId(formId), userId: session.user.email },
        ],
      },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PATCH /api/forms/[formId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
