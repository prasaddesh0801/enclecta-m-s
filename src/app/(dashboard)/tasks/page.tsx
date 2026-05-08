import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TaskBoard from "./TaskBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  // Get all users for assignment
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" }
  });

  // Get all projects for task linking
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, client: { select: { name: true } } },
    orderBy: { name: "asc" }
  });

  // Get tasks (filter if employee)
  const isEmployee = session?.user?.role === "EMPLOYEE";
  let whereClause = isEmployee ? { assigneeId: session?.user?.id } : {};

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      assignee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage tasks and track project progress</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskBoard initialTasks={tasks} users={users} projects={projects} />
      </div>
    </div>
  );
}
