import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import puppeteer from 'puppeteer';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Determine the base URL for the local server
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    // Get the session cookie to pass to Puppeteer so it can access the protected page
    const cookies = req.headers.get('cookie') || '';
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Parse cookies and set them
    if (cookies) {
      const cookieArray = cookies.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=');
        return { 
          name, 
          value: rest.join('='), 
          domain: host?.split(':')[0] || 'localhost',
          path: '/'
        };
      });
      await page.setCookie(...cookieArray);
    }
    
    // Navigate to the invoice page and wait for it to load completely
    await page.goto(`${baseUrl}/invoices/${id}`, { waitUntil: 'networkidle0' });
    
    // Add a class or run a script if necessary to hide elements (we already have print:hidden in CSS)
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
    });
    
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF." }, { status: 500 });
  }
}
