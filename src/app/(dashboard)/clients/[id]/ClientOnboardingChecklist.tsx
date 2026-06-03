"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { toggleOnboardingStep, addOnboardingStep } from "./actions";

export default function ClientOnboardingChecklist({ clientId, steps }: { clientId: string, steps: any[] }) {
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = async (id: string, isDone: boolean) => {
    await toggleOnboardingStep(id, !isDone);
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    setIsAdding(true);
    await addOnboardingStep(clientId, newTask);
    setNewTask("");
    setIsAdding(false);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5">
      <h2 className="text-lg font-medium text-foreground mb-4">Onboarding Checklist</h2>
      <div className="space-y-2 mb-4">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No checklist items yet.</p>
        ) : (
          steps.map(step => (
            <div key={step.id} className="flex items-center gap-3 group">
              <button onClick={() => handleToggle(step.id, step.isDone)} className="text-muted-foreground hover:text-primary transition-colors">
                {step.isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
              </button>
              <span className={`text-sm flex-1 ${step.isDone ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}>
                {step.title}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
        <input 
          type="text" 
          value={newTask} 
          onChange={e => setNewTask(e.target.value)}
          placeholder="New checklist item..."
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          disabled={isAdding || !newTask.trim()}
          className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
