import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        client: { select: { name: true, companyName: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects error:", error);
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
    const { name, clientId, description, startDate, duration } = body;

    if (!name || !clientId) {
      return NextResponse.json(
        { message: "Name and Client ID are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        clientId,
        description,
        startDate: startDate ? new Date(startDate) : null,
        duration: duration ? parseInt(duration, 10) : null,
      },
      include: {
        client: { select: { name: true, companyName: true } },
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST Project error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
