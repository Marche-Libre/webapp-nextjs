"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { MemberProfileDrawer } from "./member-profile-drawer";

export type MemberProfileSeed = {
  x_handle?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

type MemberProfileDrawerState = {
  memberId: string | null;
  seed: MemberProfileSeed | null;
};

type MemberProfileDrawerContextValue = {
  openMemberProfile: (memberId: string, seed?: MemberProfileSeed | null) => void;
  closeMemberProfile: () => void;
};

const MemberProfileDrawerContext = createContext<MemberProfileDrawerContextValue | null>(null);

export function useMemberProfileDrawer() {
  const context = useContext(MemberProfileDrawerContext);
  if (!context) {
    throw new Error("useMemberProfileDrawer must be used inside MemberProfileDrawerProvider");
  }

  return context;
}

export function MemberProfileDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerState, setDrawerState] = useState<MemberProfileDrawerState>({
    memberId: null,
    seed: null,
  });
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const closeMemberProfile = useCallback(() => {
    const triggerElement = triggerElementRef.current;
    setDrawerState({ memberId: null, seed: null });

    requestAnimationFrame(() => {
      triggerElement?.focus();
    });
  }, []);

  const openMemberProfile = useCallback((memberId: string, seed?: MemberProfileSeed | null) => {
    const activeElement = document.activeElement;
    triggerElementRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    setDrawerState({ memberId, seed: seed ?? null });
  }, []);

  const contextValue = useMemo(() => {
    return {
      closeMemberProfile,
      openMemberProfile,
    };
  }, [closeMemberProfile, openMemberProfile]);

  return (
    <MemberProfileDrawerContext.Provider value={contextValue}>
      {children}
      <MemberProfileDrawer
        memberId={drawerState.memberId}
        seed={drawerState.seed}
        onClose={closeMemberProfile}
      />
    </MemberProfileDrawerContext.Provider>
  );
}
