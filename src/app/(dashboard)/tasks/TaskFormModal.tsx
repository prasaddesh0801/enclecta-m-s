"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type TaskFormModalProps = {
  onClose: () => void;
  onSuccess: (task: any) => void;
  users: any[];
  projects: any[];
};

export default function TaskFormModal({ onClose, onSuccess, users, projects }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
    assigneeId: "",
    projectId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newTask = await res.json();
        onSuccess(newTask);
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create task");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg glass-card rounded-2xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Create Task</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-y"
                placeholder="Add more details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
                >
                  <option value="TODO" className="bg-background">To Do</option>
                  <option value="IN_PROGRESS" className="bg-background">In Progress</option>
                  <option value="REVIEW" className="bg-background">Review</option>
                  <option value="COMPLETED" className="bg-background">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
                >
                  <option value="LOW" className="bg-background">Low</option>
                  <option value="MEDIUM" className="bg-background">Medium</option>
                  <option value="HIGH" className="bg-background">High</option>
                  <option value="URGENT" className="bg-background">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Assignee</label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
                >
                  <option value="" className="bg-background">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id} className="bg-background">{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
              >
                <option value="" className="bg-background">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id} className="bg-background">
                    {project.name} {project.client ? `(${project.client.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
