"use client";

import { forwardRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMemberProfileDrawer, type MemberProfileSeed } from "./member-profile-drawer-context";

type MemberProfileTriggerProps = {
  memberId: string;
  seed?: MemberProfileSeed | null;
  onOpen?: () => void;
  className?: string;
  children: ReactNode;
  title?: string;
  "aria-label"?: string;
};

export const MemberProfileTrigger = forwardRef<HTMLButtonElement, MemberProfileTriggerProps>(
  function MemberProfileTrigger(
    {
      memberId,
      seed,
      onOpen,
      className,
      children,
      title,
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    const { openMemberProfile } = useMemberProfileDrawer();

    const handleClick = useCallback(() => {
      openMemberProfile(memberId, seed);
      onOpen?.();
    }, [memberId, onOpen, openMemberProfile, seed]);

    return (
      <button
        ref={ref}
        type="button"
        title={title}
        aria-label={ariaLabel}
        onClick={handleClick}
        className={cn(
          "inline-flex cursor-pointer appearance-none border-0 bg-transparent p-0 text-left text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
