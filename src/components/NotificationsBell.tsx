"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
};

export default function NotificationsBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (response.ok) {
        setNotifications(await response.json());
      }
    } catch (error) {
      console.error("Unable to refresh notifications:", error);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshNotifications, 30_000);
    const refreshOnFocus = () => void refreshNotifications();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.filter(n => n.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          if (!isOpen) void refreshNotifications();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0a0a]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 glass-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/40">
            <h3 className="font-medium text-foreground">Notifications</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center italic">You&apos;re all caught up!</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 relative group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-primary mt-2 inline-block hover:underline" onClick={() => setIsOpen(false)}>
                        View Details
                      </Link>
                    )}
                  </div>
                  <button onClick={() => markAsRead(n.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Mark as read">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
