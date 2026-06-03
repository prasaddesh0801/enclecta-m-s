import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckSquare, MessageSquare } from "lucide-react";
import TaskComments from "./TaskComments";
import FileUpload from "@/components/FileUpload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) return notFound();

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      project: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      },
      attachments: true
    }
  });

  if (!task) notFound();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "MEDIUM": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "HIGH": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "URGENT": return "text-red-500 bg-red-500/20 border-red-500/30 font-bold animate-pulse";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/tasks" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
            <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded border bg-white/5 border-white/10 text-muted-foreground">
              {task.status.replace("_", " ")}
            </span>
          </div>
          {task.project && (
            <p className="text-muted-foreground mt-1 text-sm">
              Project: <span className="font-medium text-foreground">{task.project.name}</span>
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-medium text-foreground mb-4">Description</h2>
            <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {task.description || "No description provided."}
            </div>
          </div>

          <TaskComments taskId={task.id} comments={task.comments} currentUserId={session.user.id} />
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-medium text-foreground mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <CheckSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Assignee</p>
                  <p className="text-muted-foreground">{task.assignee?.name || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Created</p>
                  <p className="text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {task.dueDate && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Due Date</p>
                    <p className="text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <FileUpload taskId={task.id} existingFiles={task.attachments} />
        </div>
      </div>
    </div>
  );
}
