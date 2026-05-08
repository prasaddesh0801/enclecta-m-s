"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ClientFormModal from "./ClientFormModal";
import { useRouter } from "next/navigation";

type ClientType = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  status: string;
  _count: { projects: number; invoices: number };
};

export default function ClientListClient({ initialClients }: { initialClients: ClientType[] }) {
  const [clients, setClients] = useState<ClientType[]>(initialClients);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'LEAD': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'CONTACTED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PROPOSAL_SENT': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ONBOARDED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ACTIVE': return 'bg-primary/20 text-primary border-primary/30';
      case 'INACTIVE': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleClientAdded = (newClient: any) => {
    // Assuming the API returns the client. We need to add _count for the UI
    setClients([{ ...newClient, _count: { projects: 0, invoices: 0 } }, ...clients]);
    router.refresh();
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search clients..." 
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
          Add Client
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/20 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Client Info</th>
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-center">Projects</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={client.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{client.companyName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                        {client.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {client._count.projects}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/clients/${client.id}`} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ClientFormModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={handleClientAdded} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
