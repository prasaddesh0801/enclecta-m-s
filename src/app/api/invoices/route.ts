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

    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true, companyName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET Invoices error:", error);
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
    const { clientId, items, discount = 0, dueDate, status, withGst } = body;

    if (!clientId || !items || !items.length) {
      return NextResponse.json({ message: "Client and items are required" }, { status: 400 });
    }

    // Auto-generate Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Auto-calculate totals
    let subtotal = 0;
    const invoiceItemsData = items.map((item: any) => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      return {
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: amount
      };
    });

    // Calculate GST based on toggle
    const taxRate = withGst ? 0.18 : 0;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax - discount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId,
        subtotal,
        tax,
        discount,
        grandTotal,
        status: status || "DRAFT",
        dueDate: new Date(dueDate),
        items: {
          create: invoiceItemsData
        }
      },
      include: {
        items: true,
        client: true
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST Invoice error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
