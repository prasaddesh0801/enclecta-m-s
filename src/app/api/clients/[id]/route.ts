import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            _count: { select: { tasks: true } }
          }
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("GET Client error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

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
    const updatedClient = await prisma.client.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("PUT Client error:", error);
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
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("DELETE Client error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
