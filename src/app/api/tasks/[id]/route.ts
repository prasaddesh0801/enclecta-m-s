import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const { dueDate, ...otherData } = body;
    
    const updateData = { ...otherData };
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT Task error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE Task error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
