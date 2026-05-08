"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-foreground px-4 py-2 rounded-xl font-medium transition-colors border border-white/10"
    >
      <Printer className="w-4 h-4" />
      Print / PDF
    </button>
  );
}
