"use client";

import { useState } from "react";
import { Plus, Search, Folder, MoreVertical, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectFormModal from "./ProjectFormModal";
import { useRouter } from "next/navigation";

export default function ProjectListClient({ initialProjects, clients }: { initialProjects: any[], clients: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.client.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectAdded = (newProject: any) => {
    // Add dummy _count if the API didn't return it so the UI doesn't crash
    const projectToAdd = {
      ...newProject,
      _count: newProject._count || { tasks: 0 }
    };
    setProjects([projectToAdd, ...projects]);
    router.refresh();
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/20 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Project Name</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium text-center">Tasks</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={project.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-foreground">{project.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{project.client.companyName}</div>
                      <div className="text-xs text-muted-foreground">{project.client.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {project._count.tasks}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No projects found.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ProjectFormModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={handleProjectAdded}
            clients={clients}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
