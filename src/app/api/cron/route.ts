import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    let notificationsCreated = 0;
    
    // 1. Auto reminders for overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { notIn: ["PAID", "CANCELLED"] },
        dueDate: { lt: new Date() }
      },
      include: { client: true }
    });

    for (const inv of overdueInvoices) {
      if (inv.status !== "OVERDUE") {
        await prisma.invoice.update({ where: { id: inv.id }, data: { status: "OVERDUE" } });
      }
      
      // Notify the account manager or admin
      if (inv.client.accountManagerId) {
        // Prevent duplicate spam (in production, add a flag or check recent notifications)
        await prisma.notification.create({
          data: {
            userId: inv.client.accountManagerId,
            title: "Invoice Overdue",
            message: `Invoice ${inv.invoiceNo} for ${inv.client.companyName} is overdue!`,
            link: `/invoices/${inv.id}`
          }
        });
        notificationsCreated++;
      }
    }

    // 2. Auto task alerts for overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        dueDate: { lt: new Date() }
      }
    });

    for (const task of overdueTasks) {
      if (task.assigneeId) {
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            title: "Task Overdue",
            message: `Task "${task.title}" was due on ${task.dueDate?.toLocaleDateString()}. Please update it.`,
            link: `/tasks/${task.id}`
          }
        });
        notificationsCreated++;
      }
    }

    // 3. Process Recurring Invoices
    const dueRecurring = await prisma.recurringInvoice.findMany({
      where: { isActive: true, nextRun: { lte: new Date() } },
      include: { client: true }
    });

    let invoicesGenerated = 0;
    for (const rec of dueRecurring) {
      // Generate a new invoice
      const invoiceCount = await prisma.invoice.count();
      const invoiceNo = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, "0")}`;
      
      await prisma.invoice.create({
        data: {
          invoiceNo,
          clientId: rec.clientId,
          subtotal: rec.amount,
          tax: 0,
          grandTotal: rec.amount,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days
          status: "DRAFT",
          items: {
            create: [
              { description: "Automated Recurring Billing", quantity: 1, rate: rec.amount, amount: rec.amount }
            ]
          }
        }
      });
      invoicesGenerated++;

      // Log activity
      await prisma.activityLog.create({
        data: {
          entityId: rec.clientId,
          entityType: "CLIENT",
          action: "INVOICE_CREATED",
          description: `Automated recurring invoice ${invoiceNo} generated.`
        }
      });

      // Calculate next run
      const nextDate = new Date(rec.nextRun);
      if (rec.frequency === "WEEKLY") nextDate.setDate(nextDate.getDate() + 7);
      else if (rec.frequency === "MONTHLY") nextDate.setMonth(nextDate.getMonth() + 1);
      else if (rec.frequency === "YEARLY") nextDate.setFullYear(nextDate.getFullYear() + 1);

      await prisma.recurringInvoice.update({
        where: { id: rec.id },
        data: { nextRun: nextDate }
      });
    }

    return NextResponse.json({ 
      success: true, 
      notificationsCreated, 
      invoicesGenerated 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Failed to execute cron." }, { status: 500 });
  }
}
