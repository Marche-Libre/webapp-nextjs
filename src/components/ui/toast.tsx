"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-[16px] w-[16px] text-success shrink-0" />,
  error: <AlertCircle className="h-[16px] w-[16px] text-error shrink-0" />,
  info: <Info className="h-[16px] w-[16px] text-info shrink-0" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed bottom-[16px] right-[16px] z-[100] flex flex-col gap-[8px] max-w-[360px]">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-[10px] px-[16px] py-[12px] rounded-lg shadow-modal border animate-[slide-up_0.2s_ease-out]",
                  "bg-bg-elevated border-border-default"
                )}
              >
                {icons[t.type]}
                <p className="text-[13px] text-text-primary flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded hover:bg-bg-surface text-text-muted cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext>
  );
}
