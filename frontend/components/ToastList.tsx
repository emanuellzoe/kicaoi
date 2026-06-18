"use client";

import { useToast } from "@/lib/toast";
import type { ToastType } from "@/lib/toast";

const ICONS: Record<ToastType, string> = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

export function ToastList() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role={t.type === "error" ? "alert" : "status"}
          aria-atomic="true"
          onClick={() => removeToast(t.id)}
        >
          <span className="toast-icon" aria-hidden="true">{ICONS[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
