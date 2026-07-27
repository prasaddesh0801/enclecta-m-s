import { getServerSession } from "next-auth";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import InvoicePdfDocument from "@/components/InvoicePdfDocument";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const document = createElement(InvoicePdfDocument, { invoice });
    const pdf = await renderToBuffer(document as Parameters<typeof renderToBuffer>[0]);
    const filename = invoice.invoiceNo.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate the invoice PDF." },
      { status: 500 },
    );
  }
}
