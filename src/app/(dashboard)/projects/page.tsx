import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectListClient from "./ProjectListClient";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, companyName: true } },
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const clients = await prisma.client.findMany({
    select: { id: true, name: true, companyName: true },
    orderBy: { companyName: "asc" }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage projects and assign them to clients</p>
        </div>
      </div>

      <ProjectListClient initialProjects={projects} clients={clients} />
    </div>
  );
}
