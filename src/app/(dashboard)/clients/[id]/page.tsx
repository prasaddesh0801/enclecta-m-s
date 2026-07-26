import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Check, Circle, Mail, Phone, MapPin, Calendar } from "lucide-react";
import ClientStatusUpdater from "./ClientStatusUpdater";
import ClientOnboardingChecklist from "./ClientOnboardingChecklist";
import ClientContacts from "./ClientContacts";
import ClientTimeline from "./ClientTimeline";
import FileUpload from "@/components/FileUpload";

// Force dynamic rendering so we always get fresh client data
export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: true,
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      contacts: {
        orderBy: { createdAt: 'desc' }
      },
      onboardingSteps: {
        orderBy: { createdAt: 'asc' }
      },
      files: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!client) {
    notFound();
  }

  // Define onboarding stages
  const STAGES = [
    { id: "LEAD", label: "Lead" },
    { id: "CONTACTED", label: "Contacted" },
    { id: "PROPOSAL_SENT", label: "Proposal Sent" },
    { id: "ONBOARDED", label: "Onboarded" },
    { id: "ACTIVE", label: "Active" }
  ];

  const currentStageIndex = STAGES.findIndex(s => s.id === client.status);
  const isActive = client.status === "ACTIVE";
  const completedStages = currentStageIndex >= 0 ? currentStageIndex + 1 : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/clients" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> {client.companyName}
          </p>
        </div>
      </header>

      {/* Onboarding Pipeline UI */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h2 className="text-lg font-medium text-foreground">Onboarding Pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isActive
                ? "Onboarding complete — this client is active."
                : currentStageIndex >= 0
                  ? `${completedStages} of ${STAGES.length} stages complete`
                  : "Pipeline paused while this client is inactive."}
            </p>
          </div>
          {isActive && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Complete
            </span>
          )}
        </div>

        <div className="relative grid grid-cols-5 gap-2">
          <div className="absolute left-[10%] right-[10%] top-5 h-1 rounded-full bg-white/10" />
          <div
            className="absolute left-[10%] top-5 h-1 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 80)}%` }}
          />

          {STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2 text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                      : "border-white/20 bg-background text-muted-foreground"
                  }`}
                  aria-label={`${stage.label}${isCompleted ? " complete" : " not complete"}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium leading-tight ${isCurrent ? "text-emerald-400" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <ClientStatusUpdater clientId={client.id} currentStatus={client.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info and Contacts */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-medium text-foreground mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground">{client.email}</p>
              </div>
            </div>
            {client.phone && (
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-muted-foreground">{client.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Created At</p>
                <p className="text-muted-foreground">{new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {client.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Address</p>
                  <p className="text-muted-foreground">{client.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <ClientContacts clientId={client.id} contacts={client.contacts} />
        <ClientTimeline clientId={client.id} />
      </div>

        {/* Projects, Files & Invoices */}
        <div className="md:col-span-2 space-y-6">
          <ClientOnboardingChecklist clientId={client.id} steps={client.onboardingSteps} />
          
          <FileUpload clientId={client.id} existingFiles={client.files} />
          
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-medium text-foreground mb-4">Active Projects</h2>
            {client.projects.length > 0 ? (
              <ul className="space-y-2">
                {client.projects.map(p => (
                  <li key={p.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                    {p.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">No projects created yet.</p>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-medium text-foreground mb-4">Recent Invoices</h2>
            {client.invoices.length > 0 ? (
              <ul className="space-y-2">
                {client.invoices.map(inv => (
                  <li key={inv.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between">
                    <span>{inv.invoiceNo}</span>
                    <span className="font-medium">₹{inv.grandTotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">No invoices found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
