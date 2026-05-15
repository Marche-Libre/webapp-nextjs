"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ReactNode,
} from "react";
import {
  Check,
  Copy,
  Flag,
  MoreHorizontal,
  Pencil,
  Pin,
  Reply,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactionPicker } from "./reaction-picker";

interface MessageInlineActionsProps {
  canReact: boolean;
  canCopy: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canPin: boolean;
  canReport: boolean;
  className?: string;
  copyLabel: string;
  copySucceeded: boolean;
  deleteConfirming: boolean;
  isPinned: boolean;
  isReplyable: boolean;
  replyLabel: string;
  saving: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onCopy: () => void | Promise<void>;
  onDelete: () => void;
  onEdit: () => void;
  onPin: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onReport: () => void;
}

export function MessageInlineActions({
  canReact,
  canCopy,
  canDelete,
  canEdit,
  canPin,
  canReport,
  className,
  copyLabel,
  copySucceeded,
  deleteConfirming,
  isPinned,
  isReplyable,
  replyLabel,
  saving,
  onCancelDelete,
  onConfirmDelete,
  onCopy,
  onDelete,
  onEdit,
  onPin,
  onReact,
  onReply,
  onReport,
}: MessageInlineActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasMenuActions =
    canEdit || canCopy || canPin || canDelete || canReport;

  const closeMenuOnOutsidePointerDown = useCallback((event: PointerEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((current) => !current);
  }, []);

  const handlePin = useCallback(() => {
    onPin();
    setMenuOpen(false);
  }, [onPin]);

  const handleReply = useCallback(() => {
    onReply();
  }, [onReply]);

  const handleCopy = useCallback(() => {
    void onCopy();
  }, [onCopy]);

  const handleEdit = useCallback(() => {
    onEdit();
    setMenuOpen(false);
  }, [onEdit]);

  const handleReport = useCallback(() => {
    onReport();
    setMenuOpen(false);
  }, [onReport]);

  const handleDelete = useCallback(() => {
    onDelete();
    setMenuOpen(false);
  }, [onDelete]);

  const handleConfirmDelete = useCallback(() => {
    onConfirmDelete();
  }, [onConfirmDelete]);

  const handleCancelDelete = useCallback(() => {
    onCancelDelete();
    setMenuOpen(false);
  }, [onCancelDelete]);

  useEffect(() => {
    if (!menuOpen) return;

    document.addEventListener("pointerdown", closeMenuOnOutsidePointerDown);
    return () => {
      document.removeEventListener(
        "pointerdown",
        closeMenuOnOutsidePointerDown,
      );
    };
  }, [closeMenuOnOutsidePointerDown, menuOpen]);

  if (!canReact && !hasMenuActions) return null;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center gap-[2px] transition-opacity",
        className,
      )}
    >
      {canReact && <ReactionPicker onSelect={onReact} />}
      {isReplyable && (
        <InlineActionIconButton
          ariaLabel={replyLabel}
          title={replyLabel}
          onClick={handleReply}
        >
          <Reply className="h-[14px] w-[14px]" />
        </InlineActionIconButton>
      )}
      {hasMenuActions && (
        <div
          ref={menuRef}
          className="relative"
        >
          <button
            type="button"
            onClick={handleToggleMenu}
            className="cursor-pointer rounded-full p-[5px] text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary"
            aria-label="Plus d'actions"
            aria-expanded={menuOpen}
            title="Plus d'actions"
          >
            <MoreHorizontal className="h-[14px] w-[14px]" />
          </button>
          {menuOpen && (
            <div className="fixed bottom-[calc(env(safe-area-inset-bottom)_+_72px)] left-[12px] right-[12px] z-50 rounded-lg border border-border-default bg-bg-elevated p-[4px] shadow-modal sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-[6px] sm:w-[184px]">
              {canEdit && (
                <ActionMenuButton
                  icon={<Pencil className="h-[13px] w-[13px]" />}
                  onClick={handleEdit}
                >
                  Modifier
                </ActionMenuButton>
              )}
              {canCopy && (
                <ActionMenuButton
                  icon={
                    copySucceeded ? (
                      <Check className="h-[13px] w-[13px]" />
                    ) : (
                      <Copy className="h-[13px] w-[13px]" />
                    )
                  }
                  onClick={handleCopy}
                  variant={copySucceeded ? "success" : "default"}
                >
                  {copyLabel}
                </ActionMenuButton>
              )}
              {canPin && (
                <ActionMenuButton
                  icon={<Pin className="h-[13px] w-[13px]" />}
                  onClick={handlePin}
                  disabled={saving}
                >
                  {isPinned ? "Désépingler" : "Épingler"}
                </ActionMenuButton>
              )}
              {canDelete && !deleteConfirming && (
                <ActionMenuButton
                  icon={<Trash2 className="h-[13px] w-[13px]" />}
                  onClick={handleConfirmDelete}
                  disabled={saving}
                  variant="danger"
                >
                  Supprimer
                </ActionMenuButton>
              )}
              {canDelete && deleteConfirming && (
                <>
                  <ActionMenuButton
                    icon={<Check className="h-[13px] w-[13px]" />}
                    onClick={handleDelete}
                    disabled={saving}
                    variant="danger"
                  >
                    Confirmer
                  </ActionMenuButton>
                  <ActionMenuButton onClick={handleCancelDelete}>
                    Annuler
                  </ActionMenuButton>
                </>
              )}
              {canReport && (
                <ActionMenuButton
                  icon={<Flag className="h-[13px] w-[13px]" />}
                  onClick={handleReport}
                  variant="danger"
                >
                  Signaler
                </ActionMenuButton>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineActionIconButton({
  ariaLabel,
  children,
  onClick,
  title,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full p-[5px] text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary"
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

function ActionMenuButton({
  children,
  disabled,
  icon,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full cursor-pointer items-center gap-[8px] rounded-md px-[10px] py-[8px] text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "danger" &&
          "text-error hover:bg-error-bg",
        variant === "success" &&
          "bg-success-bg/70 text-success hover:bg-success-bg",
        variant === "default" &&
          "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
