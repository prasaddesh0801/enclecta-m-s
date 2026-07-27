import { prisma } from "@/lib/prisma";

type CreateNotificationsInput = {
  userIds: string[];
  title: string;
  message: string;
  link?: string;
};

async function createNotifications({ userIds, title, message, link }: CreateNotificationsInput) {
  const recipients = [...new Set(userIds.filter(Boolean))];
  if (recipients.length === 0) return;

  await prisma.notification.createMany({
    data: recipients.map((userId) => ({ userId, title, message, link })),
  });
}

export async function notifyTaskAssigned({
  taskId,
  taskTitle,
  assigneeId,
}: {
  taskId: string;
  taskTitle: string;
  assigneeId: string | null;
}) {
  if (!assigneeId) return;

  await createNotifications({
    userIds: [assigneeId],
    title: "New Task Assigned",
    message: `You have been assigned the task “${taskTitle}”.`,
    link: `/tasks/${taskId}`,
  });
}

export async function notifyInvoiceCreated({
  invoiceId,
  invoiceNo,
  clientName,
  accountManagerId,
}: {
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  accountManagerId: string | null;
}) {
  const usersWhoNeedInvoiceUpdates = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER", "ACCOUNTS"] } },
    select: { id: true },
  });

  await createNotifications({
    userIds: [
      ...usersWhoNeedInvoiceUpdates.map((user) => user.id),
      ...(accountManagerId ? [accountManagerId] : []),
    ],
    title: "New Invoice Created",
    message: `Invoice ${invoiceNo} for ${clientName} has been created.`,
    link: `/invoices/${invoiceId}`,
  });
}
