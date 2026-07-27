import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyInvoiceCreated } from "@/lib/notifications";
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
    const { clientId, items, discount = 0, advanceAmount = 0, dueDate, status, withGst } = body;
    const invoiceStatus = status || "SENT";
    const allowedStatuses = ["SENT", "PARTIALLY_PAID", "PAID"];

    if (!clientId || !items || !items.length) {
      return NextResponse.json({ message: "Client and items are required" }, { status: 400 });
    }

    if (!allowedStatuses.includes(invoiceStatus)) {
      return NextResponse.json({ message: "Invalid payment status" }, { status: 400 });
    }

    // Auto-generate Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Auto-calculate totals
    let subtotal = 0;
    const invoiceItemsData = items.map((item: { description: string; quantity: number; rate: number }) => {
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
    const advanceToStore = invoiceStatus === "PARTIALLY_PAID" ? Number(advanceAmount) : 0;

    if (
      invoiceStatus === "PARTIALLY_PAID" &&
      (!Number.isFinite(advanceToStore) || advanceToStore <= 0 || advanceToStore > grandTotal)
    ) {
      return NextResponse.json({ message: "Advance amount must be greater than zero and cannot exceed the invoice total" }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId,
        subtotal,
        tax,
        discount,
        grandTotal,
        advanceAmount: advanceToStore,
        status: invoiceStatus,
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

    try {
      await notifyInvoiceCreated({
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        clientName: invoice.client.companyName,
        accountManagerId: invoice.client.accountManagerId,
      });
    } catch (notificationError) {
      console.error("Invoice notification error:", notificationError);
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST Invoice error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
