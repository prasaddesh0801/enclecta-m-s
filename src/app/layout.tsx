import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Enclekta | Company Management System",
  description: "Advanced company management, task tracking, and invoicing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased relative overflow-hidden`}>
        {/* Subtle background glow effect */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
        
        {children}
      </body>
    </html>
  );
}
