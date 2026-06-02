"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import {
  approveUser,
  deleteUserPermanently,
  rejectUser,
  resetUserAdmission,
  toggleUserAdmin,
} from "@/app/(app)/admin/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ModalIntent = "enable-admin" | "disable-admin" | "delete" | "reset-admission" | null;
type ActionStatus = "approved" | "rejected";

interface ApproveRejectButtonsProps {
  userId: string;
  currentStatus?: string;
  compact?: boolean;
  canApprove?: boolean;
  blockedReason?: string;
  isAdmin?: boolean;
  userHandle?: string | null;
  userEmail?: string | null;
}

const DEFAULT_BLOCKED_REASON = "Parrainage manquant";

function getUserLabel(userHandle?: string | null, userEmail?: string | null) {
  if (userHandle) return `@${userHandle}`;
  if (userEmail) return userEmail;
  return "cet utilisateur";
}

function getDeleteConfirmationValue(
  userHandle?: string | null,
  userEmail?: string | null,
) {
  return userHandle ? `@${userHandle}` : userEmail ?? "DELETE";
}

export function ApproveRejectButtons({
  userId,
  currentStatus,
  compact,
  canApprove = true,
  blockedReason = DEFAULT_BLOCKED_REASON,
  isAdmin = false,
  userHandle,
  userEmail,
}: ApproveRejectButtonsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [modalIntent, setModalIntent] = useState<ModalIntent>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const router = useRouter();

  const userLabel = useMemo(() => {
    return getUserLabel(userHandle, userEmail);
  }, [userEmail, userHandle]);

  const deleteConfirmationValue = useMemo(() => {
    return getDeleteConfirmationValue(userHandle, userEmail);
  }, [userEmail, userHandle]);

  const runStatusAction = useCallback(async (status: ActionStatus) => {
    setLoadingAction(status);
    setError("");

    const result =
      status === "approved"
        ? await approveUser(userId)
        : await rejectUser(userId);

    if (!result.success) {
      setError(result.error ?? "Action impossible");
    }

    setLoadingAction(null);
    router.refresh();
  }, [router, userId]);

  const handleApprove = useCallback(async () => {
    await runStatusAction("approved");
  }, [runStatusAction]);

  const handleReject = useCallback(async () => {
    await runStatusAction("rejected");
  }, [runStatusAction]);

  const handleOpenAdminModal = useCallback(() => {
    setError("");
    setModalIntent(isAdmin ? "disable-admin" : "enable-admin");
  }, [isAdmin]);

  const handleOpenDeleteModal = useCallback(() => {
    setError("");
    setDeleteConfirmation("");
    setModalIntent("delete");
  }, []);

  const handleOpenResetAdmissionModal = useCallback(() => {
    setError("");
    setModalIntent("reset-admission");
  }, []);

  const handleCloseModal = useCallback(() => {
    if (loadingAction) return;
    setModalIntent(null);
    setDeleteConfirmation("");
  }, [loadingAction]);

  const handleDeleteConfirmationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDeleteConfirmation(event.target.value);
    },
    [],
  );

  const handleConfirmAdminToggle = useCallback(async () => {
    const nextIsAdmin = modalIntent === "enable-admin";

    setLoadingAction("admin");
    setError("");

    const result = await toggleUserAdmin(userId, nextIsAdmin);

    if (!result.success) {
      setError(result.error ?? "Action impossible");
      setLoadingAction(null);
      return;
    }

    setLoadingAction(null);
    setModalIntent(null);
    router.refresh();
  }, [modalIntent, router, userId]);

  const handleConfirmDelete = useCallback(async () => {
    setLoadingAction("delete");
    setError("");

    const result = await deleteUserPermanently(userId);

    if (!result.success) {
      setError(result.error ?? "Suppression impossible");
      setLoadingAction(null);
      return;
    }

    setLoadingAction(null);
    setModalIntent(null);
    router.refresh();
  }, [router, userId]);

  const handleConfirmResetAdmission = useCallback(async () => {
    setLoadingAction("reset-admission");
    setError("");

    const result = await resetUserAdmission(userId);

    if (!result.success) {
      setError(result.error ?? "Réinitialisation impossible");
      setLoadingAction(null);
      return;
    }

    setLoadingAction(null);
    setModalIntent(null);
    router.refresh();
  }, [router, userId]);

  const approveDisabled = Boolean(loadingAction) || !canApprove;
  const deleteDisabled =
    Boolean(loadingAction) || deleteConfirmation !== deleteConfirmationValue;
  const showApprove = currentStatus !== "approved";
  const showReject = currentStatus !== "rejected";
  const showResetAdmission = currentStatus === "rejected";
  const showDelete = !showResetAdmission;
  const adminActionLabel = isAdmin ? "Retirer admin" : "Rendre admin";
  const adminActionTitle = isAdmin
    ? `Retirer le rôle admin de ${userLabel}`
    : `Rendre ${userLabel} admin`;
  const resetAdmissionTitle = `Réinitialiser l'admission de ${userLabel}`;

  return (
    <div className="space-y-1">
      <div className="flex min-w-[156px] flex-wrap items-center gap-[6px]">
        {showApprove ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={approveDisabled}
            title={canApprove ? "Approuver" : blockedReason}
            aria-label={`Approuver ${userLabel}`}
            className="h-[30px] min-w-[34px] rounded-full border-primary-500/20 px-[9px] text-primary-600 hover:bg-primary-50"
          >
            <Check className="h-3.5 w-3.5" />
            {!compact && "Approuver"}
          </Button>
        ) : null}

        {showReject ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={Boolean(loadingAction)}
            aria-label={`Rejeter ${userLabel}`}
            className="h-[30px] min-w-[34px] rounded-full border-error/20 px-[9px] text-error hover:bg-error-bg"
          >
            <X className="h-3.5 w-3.5" />
            {!compact && "Rejeter"}
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAdminModal}
          disabled={Boolean(loadingAction)}
          title={adminActionTitle}
          aria-label={adminActionTitle}
          className="h-[30px] min-w-[34px] rounded-full px-[9px] text-text-secondary"
        >
          {isAdmin ? (
            <ShieldOff className="h-3.5 w-3.5" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {!compact && adminActionLabel}
        </Button>

        {showResetAdmission ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenResetAdmissionModal}
            disabled={Boolean(loadingAction)}
            title={resetAdmissionTitle}
            aria-label={resetAdmissionTitle}
            className="h-[30px] min-w-[34px] rounded-full border-warning/20 px-[9px] text-warning hover:bg-warning-bg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {!compact && "Réinitialiser"}
          </Button>
        ) : null}

        {showDelete ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleOpenDeleteModal}
            disabled={Boolean(loadingAction)}
            title={`Supprimer définitivement ${userLabel}`}
            aria-label={`Supprimer définitivement ${userLabel}`}
            className="h-[30px] min-w-[34px] rounded-full px-[9px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {!compact && "Delete"}
          </Button>
        ) : null}
      </div>

      {!canApprove && showApprove ? (
        <p className="max-w-[180px] text-xs leading-[16px] text-text-muted">
          {blockedReason}
        </p>
      ) : null}
      {error ? <p className="max-w-[220px] text-xs text-error">{error}</p> : null}

      <AdminActionModal
        intent={modalIntent}
        isAdmin={isAdmin}
        userLabel={userLabel}
        deleteConfirmation={deleteConfirmation}
        deleteConfirmationValue={deleteConfirmationValue}
        deleteDisabled={deleteDisabled}
        loading={Boolean(loadingAction)}
        onClose={handleCloseModal}
        onConfirmAdminToggle={handleConfirmAdminToggle}
        onConfirmDelete={handleConfirmDelete}
        onConfirmResetAdmission={handleConfirmResetAdmission}
        onDeleteConfirmationChange={handleDeleteConfirmationChange}
      />
    </div>
  );
}

type AdminActionModalProps = {
  intent: ModalIntent;
  isAdmin: boolean;
  userLabel: string;
  deleteConfirmation: string;
  deleteConfirmationValue: string;
  deleteDisabled: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirmAdminToggle: () => void;
  onConfirmDelete: () => void;
  onConfirmResetAdmission: () => void;
  onDeleteConfirmationChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function AdminActionModal({
  intent,
  isAdmin,
  userLabel,
  deleteConfirmation,
  deleteConfirmationValue,
  deleteDisabled,
  loading,
  onClose,
  onConfirmAdminToggle,
  onConfirmDelete,
  onConfirmResetAdmission,
  onDeleteConfirmationChange,
}: AdminActionModalProps) {
  const open = intent !== null;
  const isDelete = intent === "delete";
  const isResetAdmission = intent === "reset-admission";
  const title = isDelete
    ? "Supprimer le compte"
    : isResetAdmission
      ? "Réinitialiser l'admission"
      : "Modifier le rôle admin";
  const adminVerb = isAdmin ? "retirer le rôle admin" : "donner le rôle admin";
  const adminButtonLabel = loading ? "Validation..." : "Confirmer";
  const deleteButtonLabel = loading ? "Suppression..." : "Delete";
  const resetButtonLabel = loading ? "Réinitialisation..." : "Réinitialiser";

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      {isDelete ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-secondary">
            Cette action supprime définitivement {userLabel} de Supabase Auth et
            de la base de données applicative.
          </p>
          <label className="block space-y-2 text-sm text-text-secondary">
            <span>
              Tapez <span className="font-semibold text-text-primary">{deleteConfirmationValue}</span>
              {" "}pour confirmer.
            </span>
            <input
              value={deleteConfirmation}
              onChange={onDeleteConfirmationChange}
              className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-error"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onConfirmDelete}
              disabled={deleteDisabled}
            >
              {deleteButtonLabel}
            </Button>
          </div>
        </div>
      ) : isResetAdmission ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-secondary">
            Cette action remet {userLabel} en attente de parrainage. Le compte
            reste conservé, mais son parrain confirmé est retiré et une nouvelle
            demande pourra être envoyée.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirmResetAdmission}
              disabled={loading}
            >
              {resetButtonLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-secondary">
            Confirmez que vous voulez {adminVerb} à {userLabel}. Cette action
            sera revérifiée côté serveur.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirmAdminToggle}
              disabled={loading}
            >
              {adminButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
