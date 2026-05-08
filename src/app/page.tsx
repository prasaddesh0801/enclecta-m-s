"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, CheckSquare, FileText } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 text-sm font-medium mb-8 text-primary/80">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          System Version 1.0 (MVP)
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm">
          Welcome to <span className="text-gradient">Enclekta</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          The all-in-one platform for managing your clients, accelerating onboarding workflows, tracking tasks, and handling invoicing beautifully.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all"
        >
          Enter Workspace
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Feature Cards Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 z-10 w-full max-w-6xl"
      >
        <FeatureCard 
          icon={<Users className="w-8 h-8 text-blue-400" />}
          title="Client Onboarding"
          description="Seamlessly onboard clients from lead to active status."
        />
        <FeatureCard 
          icon={<CheckSquare className="w-8 h-8 text-emerald-400" />}
          title="Task Tracking"
          description="Assign tasks, track priorities, and manage workflows."
        />
        <FeatureCard 
          icon={<FileText className="w-8 h-8 text-violet-400" />}
          title="Invoicing"
          description="Create beautiful invoices, calculate totals, and track payments."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-8 h-8 text-orange-400" />}
          title="Analytics"
          description="Monitor your outstanding balances and company revenue."
        />
      </motion.div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl flex flex-col items-start gap-4 cursor-default transition-all duration-300 hover:border-white/20"
    >
      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
