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

    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: { client: true }
        }
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET Payments error:", error);
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
    const { invoiceId, amount, paymentMode, paymentDate, transactionId } = body;

    if (!invoiceId || !amount || !paymentMode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        paymentMode,
        transactionId: transactionId || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    // 2. Fetch the invoice to check its status
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (invoice) {
      // 3. Update invoice status based on total payments
      const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
      let newStatus = invoice.status;

      if (totalPaid >= invoice.grandTotal) {
        newStatus = "PAID";
      } else if (totalPaid > 0) {
        newStatus = "PARTIALLY_PAID";
      }

      if (newStatus !== invoice.status) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: newStatus }
        });
      }
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST Payment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
