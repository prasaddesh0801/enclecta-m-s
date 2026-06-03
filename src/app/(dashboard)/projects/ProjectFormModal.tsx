"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type ProjectFormModalProps = {
  onClose: () => void;
  onSuccess: (project: any) => void;
  clients: any[];
};

export default function ProjectFormModal({ onClose, onSuccess, clients }: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    clientId: clients.length > 0 ? clients[0].id : "",
    description: "",
    startDate: "",
    duration: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newProject = await res.json();
        onSuccess(newProject);
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create project");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg glass-card rounded-2xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Add New Project</h2>
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
              <label className="block text-sm font-medium text-muted-foreground mb-1">Project Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Website Redesign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none h-24"
                placeholder="Details about the project..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Assign to Client</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
              >
                {clients.length === 0 && <option value="">No clients available</option>}
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-background">
                    {client.companyName} ({client.name})
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
                disabled={isLoading || clients.length === 0}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
