"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const TOAST_DURATION_MS = 3500;

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider
      value={(message) => setToast({ id: Date.now(), message })}
    >
      {children}
      <div className="toast-region" role="status">
        {toast && (
          <div className="toast" key={toast.id}>
            <span className="status-dot" aria-hidden="true" />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
