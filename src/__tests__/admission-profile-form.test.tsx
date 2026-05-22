import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdmissionProfileForm } from "@/components/auth/admission-profile-form";

const mocks = vi.hoisted(() => ({
  submitAdmissionProfile: vi.fn(),
  useActionState: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: mocks.useActionState,
  };
});

vi.mock("@/app/(auth)/en-attente/actions", () => ({
  submitAdmissionProfile: mocks.submitAdmissionProfile,
}));

const profile = {
  first_name: null,
  last_name: null,
  full_name: null,
  specialty_ids: null,
  specialty_category_id: null,
  location: null,
  bio: null,
  x_handle: "candidate",
};

const specialtyCategories = [
  {
    id: "category-1",
    name: "Sante",
    specialties: [{ id: "specialty-1", name: "Medecin" }],
  },
];

function renderAdmissionProfileForm() {
  const container = document.createElement("div");
  document.body.append(container);
  let root: Root | null = null;

  act(() => {
    root = createRoot(container);
    root.render(
      <AdmissionProfileForm
        profile={profile}
        xHandle="candidate"
        specialtyCategories={specialtyCategories}
      />,
    );
  });

  return {
    container,
    unmount: () => {
      act(() => root?.unmount());
    },
  };
}

function requiredInput(container: HTMLElement, name: string) {
  const field = container.querySelector(`input[name="${name}"]`);
  if (!(field instanceof HTMLInputElement)) {
    throw new Error(`Missing input ${name}`);
  }

  return field;
}

function requiredSelect(container: HTMLElement, name: string) {
  const field = container.querySelector(`select[name="${name}"]`);
  if (!(field instanceof HTMLSelectElement)) {
    throw new Error(`Missing select ${name}`);
  }

  return field;
}

function requiredTextarea(container: HTMLElement, name: string) {
  const field = container.querySelector(`textarea[name="${name}"]`);
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error(`Missing textarea ${name}`);
  }

  return field;
}

beforeEach(() => {
  mocks.submitAdmissionProfile.mockReset();
  mocks.useActionState.mockReset();
  mocks.useActionState.mockReturnValue([
    {
      success: false,
      message: "",
    },
    vi.fn(),
    false,
  ]);
  document.body.innerHTML = "";
});

describe("AdmissionProfileForm", () => {
  it("renders when action state does not include validation errors", () => {
    const { container, unmount } = renderAdmissionProfileForm();

    expect(container.textContent).toContain("Demande d'acces");
    expect(container.textContent).toContain("@candidate");

    unmount();
  });

  it("prefills submitted values returned with validation errors", () => {
    mocks.useActionState.mockReturnValue([
      {
        success: false,
        message: "Corrigez les champs indiques avant l'envoi.",
        errors: {
          location: "Indiquez au moins un pays ou une ville.",
        },
        values: {
          displayName: "Nom Public",
          firstName: "The",
          lastName: "Pause",
          specialtyId: "specialty-1",
          location: "",
          bio: "Je souhaite rejoindre le reseau.",
        },
      },
      vi.fn(),
      false,
    ]);

    const { container, unmount } = renderAdmissionProfileForm();

    expect(requiredInput(container, "displayName").value).toBe("Nom Public");
    expect(requiredInput(container, "firstName").value).toBe("The");
    expect(requiredInput(container, "lastName").value).toBe("Pause");
    expect(requiredSelect(container, "specialtyId").value).toBe("specialty-1");
    expect(requiredInput(container, "location").value).toBe("");
    expect(requiredTextarea(container, "bio").value).toBe(
      "Je souhaite rejoindre le reseau.",
    );

    unmount();
  });
});
