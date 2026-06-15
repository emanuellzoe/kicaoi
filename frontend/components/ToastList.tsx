"use client";

import { useToast } from "@/lib/toast";

const ICONS = { success: "✅", error: "❌", info: "ℹ️" };

export function ToastList() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
