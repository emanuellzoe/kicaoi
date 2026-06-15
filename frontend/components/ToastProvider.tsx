"use client";

import { useCallback, useRef, useState } from "react";
import { Toast, ToastContext, ToastType } from "@/lib/toast";

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++counter}`;
    setToasts((prev) => {
      // Deduplicate: replace existing toast with same message instead of stacking
      const deduped = prev.filter((t) => t.message !== message);
      return [...deduped.slice(-3), { id, type, message }];
    });
    timers.current.set(id, setTimeout(() => removeToast(id), 4000));
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
