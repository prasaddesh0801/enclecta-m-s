"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleOnboardingStep(stepId: string, isDone: boolean) {
  const step = await prisma.onboardingStep.update({
    where: { id: stepId },
    data: { isDone }
  });

  await prisma.activityLog.create({
    data: {
      entityId: step.clientId,
      entityType: "CLIENT",
      action: "ONBOARDING_UPDATED",
      description: `Onboarding step "${step.title}" marked as ${isDone ? 'done' : 'incomplete'}.`
    }
  });

  revalidatePath('/clients/[id]');
}

export async function addOnboardingStep(clientId: string, title: string) {
  if (!title.trim()) return;
  await prisma.onboardingStep.create({
    data: { clientId, title, isDone: false }
  });

  await prisma.activityLog.create({
    data: {
      entityId: clientId,
      entityType: "CLIENT",
      action: "ONBOARDING_ADDED",
      description: `Added new onboarding step: "${title}".`
    }
  });

  revalidatePath('/clients/[id]');
}

export async function addClientContact(clientId: string, name: string, role: string, email: string, phone: string) {
  if (!name.trim()) return;
  await prisma.clientContact.create({
    data: { clientId, name, role, email, phone }
  });

  await prisma.activityLog.create({
    data: {
      entityId: clientId,
      entityType: "CLIENT",
      action: "CONTACT_ADDED",
      description: `Added new contact: ${name}${role ? ` (${role})` : ''}.`
    }
  });

  revalidatePath('/clients/[id]');
}
