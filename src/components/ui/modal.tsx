"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ open, onClose, children, title, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "modal modal-bottom sm:modal-middle",
        open && "modal-open"
      )}
      onClose={onClose}
    >
      <div className={cn("modal-box bg-bg-elevated border border-border-default", className)}>
        {title && (
          <div className="flex items-center justify-between mb-[20px]">
            <h3 className="font-display font-semibold text-text-primary tracking-[-0.02em]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
