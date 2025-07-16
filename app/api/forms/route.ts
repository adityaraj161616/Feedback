import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log("No session or user email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching forms for user:", session.user.email)
    console.log("Session user object:", JSON.stringify(session.user, null, 2))

    const { db } = await connectToDatabase()

    // Try multiple user ID formats to find existing forms
    const possibleUserIds = [session.user.email, session.user.id, session.user.sub].filter(Boolean)

    console.log("Trying user IDs:", possibleUserIds)

    // First, let's see what forms exist in the database
    const allForms = await db.collection("forms").find({}).limit(10).toArray()
    console.log(
      "Sample forms in database:",
      allForms.map((f) => ({ id: f.id, userId: f.userId, title: f.title })),
    )

    // Query forms using multiple possible user IDs
    const forms = await db
      .collection("forms")
      .find({
        userId: { $in: possibleUserIds },
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${forms.length} forms for user IDs:`, possibleUserIds)

    // Convert ObjectId to string and ensure proper structure
    const serializedForms = forms.map((form) => ({
      id: form.id || form._id.toString(),
      _id: form._id.toString(),
      title: form.title || "Untitled Form",
      description: form.description || "",
      fields: form.fields || [],
      userId: form.userId,
      isActive: form.isActive !== false,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: form.updatedAt || new Date().toISOString(),
      settings: form.settings || {},
      responses: 0, // Will be updated by frontend
    }))

    return NextResponse.json(serializedForms)
  } catch (error) {
    console.error("GET /api/forms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, fields, settings } = body

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Title and fields are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Generate unique form ID
    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const formData = {
      id: formId,
      title,
      description: description || "",
      fields,
      userId: session.user.email, // Use email as userId
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: settings || {},
    }

    console.log("Creating form with userId:", session.user.email)
    const result = await db.collection("forms").insertOne(formData)

    const newForm = {
      ...formData,
      _id: result.insertedId.toString(),
    }

    console.log("Created new form:", newForm.id)
    return NextResponse.json(newForm, { status: 201 })
  } catch (error) {
    console.error("POST /api/forms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
