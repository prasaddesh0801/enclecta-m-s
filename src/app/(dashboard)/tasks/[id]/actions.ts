"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addTaskComment(taskId: string, userId: string, content: string) {
  if (!content.trim()) return;
  await prisma.taskComment.create({
    data: { taskId, userId, content }
  });
  revalidatePath(`/tasks/[id]`);
}
