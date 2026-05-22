import { existsSync, readFileSync } from "fs";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitAdmissionProfile } from "@/app/(auth)/en-attente/actions";
import { initialAdmissionActionState } from "@/lib/admission-profile-state";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

type MockSupabaseOptions = {
  user?: { id: string } | null;
  profile?: { id: string; status: "pending" | "approved" | "rejected" } | null;
  specialty?: { id: string; category_id: string } | null;
  specialtyCategory?: { id: string } | null;
  updateError?: { message: string } | null;
  onUpdate?: (payload: Record<string, unknown>) => void;
};

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

function mockSupabase(options: MockSupabaseOptions = {}) {
  const user = options.user === undefined ? { id: "user-1" } : options.user;
  const profile =
    options.profile === undefined
      ? { id: "user-1", status: "pending" as const }
      : options.profile;
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: profile }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          options.onUpdate?.(payload);
          return {
            eq: async () => ({ error: options.updateError ?? null }),
          };
        },
      };
    }

    if (table === "specialty_categories") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: options.specialtyCategory ?? null }),
          }),
        }),
      };
    }

    if (table === "specialties") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: options.specialty ?? null }),
          }),
        }),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: async () => ({ data: { user } }),
    },
    from,
  });

  return from;
}

beforeEach(() => {
  mocks.createClient.mockReset();
  mocks.revalidatePath.mockReset();
});

describe("pending admission profile request", () => {
  it("renders the admission form from the pending boundary without opening onboarding", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");
    const onboardingPage = source("src/app/onboarding/page.tsx");

    expect(waitingPage).toContain("AdmissionProfileForm");
    expect(waitingPage).toContain("PendingSignOutButton");
    expect(waitingPage).toContain("specialty_categories");
    expect(waitingPage).toContain("specialties(*)");
    expect(waitingPage).toContain("first_name, last_name, full_name, specialty_ids, specialty_category_id, location, bio");
    expect(onboardingPage).toContain('if (profile.status !== "approved") redirect("/en-attente")');
  });

  it("shows a blocker instead of a broken form when profession data is unavailable", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");

    expect(waitingPage).toContain("specialtyCategoriesError");
    expect(waitingPage).toContain("canShowAdmissionForm");
    expect(waitingPage).toContain(") : canShowAdmissionForm ? (");
    expect(waitingPage).toContain("!hasInvitations && !canShowAdmissionForm");
    expect(waitingPage).toContain("Formulaire indisponible");
    expect(waitingPage).toContain("Impossible de charger le formulaire pour le moment. Reessayez plus tard.");
    expect(waitingPage).not.toContain("specialtyCategories ?? []");

    const unavailableBlock = waitingPage.slice(
      waitingPage.indexOf("!hasInvitations && !canShowAdmissionForm"),
      waitingPage.indexOf("{hasInvitations ?"),
    );
    expect(unavailableBlock).not.toContain("WaitingPageClient");
  });

  it("keeps the form focused on admission review and existing X identity", () => {
    const formPath = "src/components/auth/admission-profile-form.tsx";

    expect(existsSync(path.join(root, formPath))).toBe(true);

    const form = source(formPath);

    expect(form).toContain("useActionState");
    expect(form).toContain("Demande d'acces");
    expect(form).toContain("Validation manuelle");
    expect(form).toContain("Compte X verifie");
    expect(form).toContain("Identifiant X non modifiable");
    expect(form).toContain('name="firstName"');
    expect(form).toContain('name="lastName"');
    expect(form).toContain('name="displayName"');
    expect(form).toContain('name="specialtyId"');
    expect(form).toContain('name="location"');
    expect(form).toContain('name="bio"');
    expect(form).not.toContain("daily_rate");
    expect(form).not.toContain("availability_status");
    expect(form).not.toContain("looking_for");
    expect(form).not.toContain("onboarding_completed");
  });

  it("submits through a server action that verifies ownership and updates only safe profile fields", () => {
    const actionPath = "src/app/(auth)/en-attente/actions.ts";

    expect(existsSync(path.join(root, actionPath))).toBe(true);

    const action = source(actionPath);
    const updateBlock = action.slice(
      action.indexOf(".update("),
      action.lastIndexOf(".eq(\"id\", user.id)"),
    );

    expect(action).toContain('"use server"');
    expect(action).toContain('from("profiles")');
    expect(action).toContain('.select("id, status")');
    expect(action).toContain('.eq("id", user.id)');
    expect(action).toContain('profile.status !== "pending"');
    expect(updateBlock).toContain("first_name");
    expect(updateBlock).toContain("last_name");
    expect(updateBlock).toContain("full_name");
    expect(updateBlock).toContain("specialty_ids");
    expect(updateBlock).toContain("specialty_category_id");
    expect(updateBlock).toContain("location");
    expect(updateBlock).toContain("bio");

    for (const forbiddenField of [
      "status",
      "is_admin",
      "sponsored_by",
      "sponsor_approved",
      "onboarding_completed",
      "chat_banned",
      "chat_muted_until",
    ]) {
      expect(updateBlock).not.toContain(forbiddenField);
    }
  });

  it("accepts display-name-only submissions with a validated category", async () => {
    const updates: Record<string, unknown>[] = [];
    mockSupabase({
      specialtyCategory: { id: "category-1" },
      onUpdate: (payload) => updates.push(payload),
    });

    const result = await submitAdmissionProfile(
      initialAdmissionActionState,
      formData({
        displayName: "Nom Public",
        firstName: "",
        lastName: "",
        specialtyId: "cat:category-1",
        location: "Paris, France",
        bio: "Je souhaite rejoindre la beta privee.",
      }),
    );

    expect(result.success).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      first_name: null,
      last_name: null,
      full_name: "Nom Public",
      specialty_ids: [],
      specialty_category_id: "category-1",
      location: "Paris, France",
      bio: "Je souhaite rejoindre la beta privee.",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/en-attente");
  });

  it("keeps submitted field values when validation fails", async () => {
    const updates: Record<string, unknown>[] = [];
    mockSupabase({
      onUpdate: (payload) => updates.push(payload),
    });

    const result = await submitAdmissionProfile(
      initialAdmissionActionState,
      formData({
        displayName: "Nom Public",
        firstName: "The",
        lastName: "Pause",
        specialtyId: "",
        location: "",
        bio: "Court",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.specialtyId).toBe(
      "Selectionnez le contexte professionnel le plus proche.",
    );
    expect(result.errors.location).toBe(
      "Indiquez au moins un pays ou une ville.",
    );
    expect(result.errors.bio).toBe(
      "Ajoutez quelques mots pour aider l'equipe a comprendre votre demande.",
    );
    expect(result.values).toEqual({
      displayName: "Nom Public",
      firstName: "The",
      lastName: "Pause",
      specialtyId: "",
      location: "",
      bio: "Court",
    });
    expect(updates).toHaveLength(0);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects forged category-only specialty values before updating", async () => {
    const updates: Record<string, unknown>[] = [];
    mockSupabase({
      specialtyCategory: null,
      onUpdate: (payload) => updates.push(payload),
    });

    const result = await submitAdmissionProfile(
      initialAdmissionActionState,
      formData({
        displayName: "Nom Public",
        specialtyId: "cat:not-real",
        location: "Paris, France",
        bio: "Je souhaite rejoindre la beta privee.",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.specialtyId).toBe("Selectionnez une option valide.");
    expect(updates).toHaveLength(0);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects non-pending profiles before validation and update", async () => {
    const updates: Record<string, unknown>[] = [];
    mockSupabase({
      profile: { id: "user-1", status: "approved" },
      onUpdate: (payload) => updates.push(payload),
    });

    const result = await submitAdmissionProfile(
      initialAdmissionActionState,
      formData({
        displayName: "Nom Public",
        specialtyId: "cat:category-1",
        location: "Paris, France",
        bio: "Je souhaite rejoindre la beta privee.",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("pendant l'attente de validation");
    expect(updates).toHaveLength(0);
  });
});
