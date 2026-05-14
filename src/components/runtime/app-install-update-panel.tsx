"use client";

import { useCallback, useMemo } from "react";
import { CheckCircle2, Download, RefreshCw } from "lucide-react";
import { APP_RUNTIME_VERSION, useNetworkStatus } from "@/components/runtime/app-runtime-provider";

export function AppInstallUpdatePanel() {
  const {
    isStandalone,
    installPromptAvailable,
    updateAvailable,
    installApp,
    applyUpdate,
  } = useNetworkStatus();

  const showInstallAction = installPromptAvailable && !isStandalone;
  const statusLabel = useMemo(() => {
    if (updateAvailable) return "Mise à jour disponible";
    if (showInstallAction) return "Installation disponible";
    return "Application à jour";
  }, [showInstallAction, updateAvailable]);

  const handleInstall = useCallback(() => {
    void installApp();
  }, [installApp]);

  const handleUpdate = useCallback(() => {
    applyUpdate();
  }, [applyUpdate]);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface/60 px-[12px] py-[12px]">
      <div className="flex items-start gap-[9px]">
        <CheckCircle2 className="mt-[1px] h-[15px] w-[15px] shrink-0 text-text-muted" />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-text-primary">Application</p>
          <p className="mt-[2px] text-[11px] leading-[15px] text-text-muted">
            v{APP_RUNTIME_VERSION} · {statusLabel}
          </p>
        </div>
      </div>

      {showInstallAction && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-[10px] flex w-full items-center justify-center gap-[7px] rounded-lg border border-primary-300 bg-primary-50 px-[10px] py-[7px] text-[12px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <Download className="h-[14px] w-[14px]" />
          Installer
        </button>
      )}

      {updateAvailable && (
        <button
          type="button"
          onClick={handleUpdate}
          className="mt-[10px] flex w-full items-center justify-center gap-[7px] rounded-lg border border-primary-300 bg-primary-50 px-[10px] py-[7px] text-[12px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <RefreshCw className="h-[14px] w-[14px]" />
          Mettre à jour
        </button>
      )}
    </div>
  );
}
