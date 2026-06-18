import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

/** Auto-dismiss duration in milliseconds for each toast type. */
export const TOAST_DURATION_MS: Record<ToastType, number> = {
  success: 4000,
  error:   6000,
  warning: 5000,
  info:    4000,
};

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

export type ToastContextValue = {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}
