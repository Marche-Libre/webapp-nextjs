export type AuthEntryDestination = "/chat" | "/onboarding" | "/en-attente";

export const ACCESS_MODAL_HREF = "/?auth=access";
export const AUTH_ENTRY_PROFILE_SELECT = "status, onboarding_completed";

export type AuthEntryProfileState = {
  status?: string | null;
  onboarding_completed?: boolean | null;
};

export function getAuthEntryDestination(
  profile: AuthEntryProfileState | null | undefined,
): AuthEntryDestination {
  if (profile?.status !== "approved") {
    return "/en-attente";
  }

  return profile.onboarding_completed === true ? "/chat" : "/onboarding";
}
