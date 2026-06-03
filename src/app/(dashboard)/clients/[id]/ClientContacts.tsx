"use client";

import { useState } from "react";
import { Plus, UserCircle, Mail, Phone, Briefcase } from "lucide-react";
import { addClientContact } from "./actions";

export default function ClientContacts({ clientId, contacts }: { clientId: string, contacts: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsLoading(true);
    await addClientContact(clientId, formData.name, formData.role, formData.email, formData.phone);
    setFormData({ name: "", role: "", email: "", phone: "" });
    setIsAdding(false);
    setIsLoading(false);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-foreground">Client Contacts</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-3 h-3" /> Add Contact
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <input required type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
            <input type="text" placeholder="Role / Title" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
            <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground">Cancel</button>
            <button type="submit" disabled={isLoading} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No additional contacts.</p>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                <UserCircle className="w-4 h-4 text-muted-foreground" /> {contact.name}
              </div>
              {contact.role && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Briefcase className="w-3.5 h-3.5" /> {contact.role}</div>}
              {contact.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {contact.email}</div>}
              {contact.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {contact.phone}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
