import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET all students with pagination
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const students = await prisma.student.findMany({
      skip,
      take: limit,
      orderBy: { registrationNo: "asc" },
    })

    const total = await prisma.student.count()

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST create a new student
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    const requiredFields = ["registrationNo", "name", "class", "rollNo", "contactNumber"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Check if registration number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { registrationNo: body.registrationNo },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Registration number already exists" }, { status: 400 })
    }

    // Check if roll number is unique in the class
    const existingRollInClass = await prisma.student.findFirst({
      where: {
        class: body.class,
        rollNo: body.rollNo,
      },
    })

    if (existingRollInClass) {
      return NextResponse.json({ error: "Roll number already exists in this class" }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: {
        registrationNo: body.registrationNo,
        name: body.name,
        class: body.class,
        rollNo: Number.parseInt(body.rollNo),
        contactNumber: body.contactNumber,
        status: body.status !== undefined ? body.status : true,
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
