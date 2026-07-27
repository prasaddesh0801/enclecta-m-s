"use client";

import { useState } from "react";
import { Plus, Search, CheckSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import TaskFormModal from "./TaskFormModal";
import { formatDate } from "@/lib/date";

type TaskType = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  assignee: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
};

export default function TaskList({ initialTasks, users, projects }: { initialTasks: any[], users: any[], projects: any[] }) {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update task status");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "MEDIUM": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "HIGH": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "URGENT": return "text-red-500 bg-red-500/20 border-red-500/30 font-bold animate-pulse";
      default: return "text-gray-400";
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.project && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tasks or projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Assignee</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-muted-foreground opacity-50 mt-0.5 shrink-0" />
                      <div>
                        <Link href={`/tasks/${task.id}`} className="font-medium text-foreground hover:text-primary transition-colors inline-block">{task.title}</Link>
                        {task.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {task.project?.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30 text-xs shrink-0">
                          {task.assignee.name.charAt(0)}
                        </div>
                        <span className="text-foreground">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {task.dueDate ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0" />
                        {formatDate(task.dueDate)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded border whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="TODO" className="bg-[#1c2128]">To Do</option>
                      <option value="IN_PROGRESS" className="bg-[#1c2128]">In Progress</option>
                      <option value="REVIEW" className="bg-[#1c2128]">Review</option>
                      <option value="COMPLETED" className="bg-[#1c2128]">Completed</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TaskFormModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={(newTask) => {
              setTasks([newTask, ...tasks]);
              router.refresh();
            }}
            users={users}
            projects={projects}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
