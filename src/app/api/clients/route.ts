import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { projects: true, invoices: true },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET Clients error:", error);
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
    const { name, companyName, email, phone, address, status } = body;

    if (!name || !companyName || !email) {
      return NextResponse.json(
        { message: "Name, Company Name, and Email are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        companyName,
        email,
        phone,
        address,
        status: status || "LEAD",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("POST Client error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
