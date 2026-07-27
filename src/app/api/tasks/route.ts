import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { notifyTaskAssigned } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    
    // Employee role only sees their own tasks unless fetching by project
    const isEmployee = session.user?.role === "EMPLOYEE";
    
    const whereClause: Prisma.TaskWhereInput = {};
    if (projectId) whereClause.projectId = projectId;
    if (assigneeId) whereClause.assigneeId = assigneeId;
    if (isEmployee) whereClause.assigneeId = session.user.id;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true, client: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET Tasks error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, status, dueDate, assigneeId, projectId } = body;

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId: projectId || null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    try {
      await notifyTaskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: task.assigneeId,
      });
    } catch (notificationError) {
      console.error("Task notification error:", notificationError);
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST Task error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
