"use client";

import { useState } from "react";
import { Plus, MoreVertical, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import TaskFormModal from "./TaskFormModal";

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

export default function TaskBoard({ initialTasks, users, projects }: { initialTasks: any[], users: any[], projects: any[] }) {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const columns = [
    { id: "TODO", title: "To Do", color: "bg-gray-500/10 border-gray-500/20 text-gray-400" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { id: "REVIEW", title: "Review", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { id: "COMPLETED", title: "Completed", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update task status");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {tasks.length} tasks
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className="flex-shrink-0 w-80 flex flex-col glass-card border border-white/5 rounded-2xl overflow-hidden h-full"
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              <div className={`px-4 py-3 border-b flex items-center justify-between ${col.color}`}>
                <h3 className="font-semibold">{col.title}</h3>
                <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs font-bold">{colTasks.length}</span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <AnimatePresence>
                  {colTasks.map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                      draggable
                      onDragStartCapture={(e) => handleDragStart(e, task.id)}
                      className="bg-black/20 border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.project && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={task.project.name}>
                            {task.project.name}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-foreground text-sm mb-1 leading-snug">{task.title}</h4>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                        {task.dueDate ? (
                          <div className="flex items-center gap-1.5" title={new Date(task.dueDate).toLocaleDateString()}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        
                        {task.assignee ? (
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30" title={task.assignee.name}>
                            {task.assignee.name.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center" title="Unassigned">
                            ?
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-muted-foreground/50 text-sm">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
