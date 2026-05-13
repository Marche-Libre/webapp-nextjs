import { describe, expect, it } from "vitest";
import { getAuthEntryDestination } from "@/lib/auth-entry";

describe("auth entry destination", () => {
  it("routes approved and onboarded profiles to chat", () => {
    expect(
      getAuthEntryDestination({
        status: "approved",
        onboarding_completed: true,
      }),
    ).toBe("/chat");
  });

  it("routes approved profiles without completed onboarding to onboarding", () => {
    expect(
      getAuthEntryDestination({
        status: "approved",
        onboarding_completed: false,
      }),
    ).toBe("/onboarding");
  });

  it("routes pending, rejected, unknown, and missing profiles to waiting", () => {
    expect(
      getAuthEntryDestination({
        status: "pending",
        onboarding_completed: false,
      }),
    ).toBe("/en-attente");
    expect(
      getAuthEntryDestination({
        status: "rejected",
        onboarding_completed: false,
      }),
    ).toBe("/en-attente");
    expect(
      getAuthEntryDestination({
        status: "mystery",
        onboarding_completed: true,
      }),
    ).toBe("/en-attente");
    expect(getAuthEntryDestination(null)).toBe("/en-attente");
  });
});
