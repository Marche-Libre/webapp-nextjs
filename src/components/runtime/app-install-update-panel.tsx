"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Download, RefreshCw, X } from "lucide-react";
import { APP_RUNTIME_VERSION, useNetworkStatus } from "@/components/runtime/app-runtime-provider";
import { cn } from "@/lib/utils";

interface AppInstallUpdatePanelProps {
  variant?: "default" | "priority";
  hideWhenIdle?: boolean;
  className?: string;
}

export function AppInstallUpdatePanel({
  variant = "default",
  hideWhenIdle = false,
  className,
}: AppInstallUpdatePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    isStandalone,
    installPromptAvailable,
    installStrategy,
    updateAvailable,
    installApp,
    applyUpdate,
  } = useNetworkStatus();
  const showInstallAction = installPromptAvailable && !isStandalone;
  const showManualInstallHint = !isStandalone && installStrategy !== "native-prompt";
  const hasAction = showInstallAction || showManualInstallHint || updateAvailable;
  const statusLabel = useMemo(() => {
    if (updateAvailable) return "Mise à jour disponible";
    if (showInstallAction) return "Installation disponible";
    if (installStrategy === "ios-safari-manual") return "Installation via Safari";
    if (installStrategy === "ios-browser-manual") return "Installation manuelle";
    if (installStrategy === "desktop-safari-manual") return "Installation via Safari";
    if (installStrategy === "browser-menu-manual") return "Installation via le navigateur";
    return "Application à jour";
  }, [installStrategy, showInstallAction, updateAvailable]);
  const manualInstallLabel = useMemo(() => {
    if (installStrategy === "ios-safari-manual") {
      return "Safari : Partager puis Ajouter à l’écran d’accueil.";
    }

    if (installStrategy === "ios-browser-manual") {
      return "Sur iOS, installez depuis Safari : Partager puis Ajouter à l’écran d’accueil.";
    }

    if (installStrategy === "desktop-safari-manual") {
      return "Safari : bouton Partager puis Ajouter au Dock.";
    }

    return "Utilisez l’icône d’installation ou le menu du navigateur.";
  }, [installStrategy]);

  const handleInstall = useCallback(() => {
    void installApp();
  }, [installApp]);

  const handleUpdate = useCallback(() => {
    applyUpdate();
  }, [applyUpdate]);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  if (hideWhenIdle && !hasAction) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "inline-flex rounded-lg border border-border-subtle bg-bg-surface/60 px-[10px] py-[6px]",
          variant === "priority" && "border-primary-300/60 bg-primary-50/20",
          className,
        )}
      >
        <p
          className={cn(
            "text-[11px] font-semibold leading-[15px]",
            variant === "priority" ? "text-primary-700" : "text-text-muted",
          )}
        >
          v{APP_RUNTIME_VERSION}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-bg-surface/60 px-[12px] py-[12px]",
        variant === "priority" && "border-primary-300/60 bg-primary-50/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-[9px]">
        <div className="flex min-w-0 items-start gap-[9px]">
          <CheckCircle2
            className={cn(
              "mt-[1px] h-[15px] w-[15px] shrink-0",
              variant === "priority" ? "text-primary-600" : "text-text-muted",
            )}
          />
          <div className="min-w-0">
            <p
              className={cn(
                "text-[12px] font-semibold",
                variant === "priority" ? "text-primary-700" : "text-text-primary",
              )}
            >
              Application
            </p>
            <p
              className={cn(
                "mt-[2px] text-[11px] leading-[15px]",
                variant === "priority" ? "text-primary-700/80" : "text-text-muted",
              )}
            >
              v{APP_RUNTIME_VERSION} · {statusLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCollapse}
          aria-label="Réduire le message d'application"
          className={cn(
            "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full transition-colors hover:bg-bg-muted",
            variant === "priority" ? "text-primary-700/70 hover:bg-primary-100/70" : "text-text-muted",
          )}
        >
          <X className="h-[14px] w-[14px]" />
        </button>
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

      {showManualInstallHint && (
        <p className="mt-[10px] text-[11px] leading-[15px] text-text-muted">
          {manualInstallLabel}
        </p>
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
