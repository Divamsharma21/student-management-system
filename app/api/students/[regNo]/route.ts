import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET student by registration number
export async function GET(req: NextRequest, { params }: { params: { regNo: string } }) {
  try {
    const regNo = params.regNo

    const student = await prisma.student.findUnique({
      where: { registrationNo: regNo },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

// PUT update student
export async function PUT(req: NextRequest, { params }: { params: { regNo: string } }) {
  try {
    const regNo = params.regNo
    const body = await req.json()

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { registrationNo: regNo },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if roll number is unique in the class (if being updated)
    if (body.rollNo && body.class) {
      const existingRollInClass = await prisma.student.findFirst({
        where: {
          class: body.class,
          rollNo: Number.parseInt(body.rollNo),
          NOT: {
            registrationNo: regNo,
          },
        },
      })

      if (existingRollInClass) {
        return NextResponse.json({ error: "Roll number already exists in this class" }, { status: 400 })
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { registrationNo: regNo },
      data: {
        name: body.name,
        class: body.class,
        rollNo: body.rollNo ? Number.parseInt(body.rollNo) : undefined,
        contactNumber: body.contactNumber,
        status: body.status !== undefined ? body.status : undefined,
      },
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

// DELETE student (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { regNo: string } }) {
  try {
    const regNo = params.regNo

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { registrationNo: regNo },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Soft delete by setting status to false
    const deletedStudent = await prisma.student.update({
      where: { registrationNo: regNo },
      data: { status: false },
    })

    return NextResponse.json({
      message: "Student deactivated successfully",
      student: deletedStudent,
    })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
