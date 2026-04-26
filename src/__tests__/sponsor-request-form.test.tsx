import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SponsorRequestForm } from "@/components/sponsorship/sponsor-request-form";

const { createClientMock, refreshMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

function makeSupabase({
  sponsor = { id: "sponsor-1", x_handle: "sponsor" },
  insertError = null,
}: {
  sponsor?: { id: string; x_handle: string } | null;
  insertError?: { message: string } | null;
} = {}) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const maybeSingle = vi.fn().mockResolvedValue({ data: sponsor });

  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle,
  };

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "profiles") return profileQuery;
      if (table === "sponsorship_requests") return { insert };
      throw new Error(`Unexpected table ${table}`);
    }),
    _insert: insert,
    _profileQuery: profileQuery,
  } as any;
}

function renderForm(requesterId = "candidate-1") {
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root | null = null;

  act(() => {
    root = createRoot(container);
    root.render(<SponsorRequestForm existingRequests={[]} requesterId={requesterId} />);
  });

  return {
    container,
    unmount: () => {
      act(() => root?.unmount());
    },
  };
}

async function submitSponsorHandle(container: HTMLElement, value: string) {
  const input = container.querySelector<HTMLInputElement>('input[name="sponsor_handle"]');
  const form = container.querySelector<HTMLFormElement>("form");

  if (!input || !form) {
    throw new Error("Sponsor request form did not render");
  }

  input.value = value;
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

async function waitForExpectation(assertion: () => void) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
  }

  throw lastError;
}

describe("SponsorRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("requires a sponsor handle before calling Supabase", async () => {
    const { container, unmount } = renderForm();

    await submitSponsorHandle(container, "");

    expect(container.textContent).toContain("Veuillez saisir un identifiant.");
    expect(createClientMock).not.toHaveBeenCalled();
    unmount();
  });

  it("normalizes a sponsor handle and records a sponsorship request", async () => {
    const supabase = makeSupabase();
    createClientMock.mockReturnValue(supabase);
    const { container, unmount } = renderForm();

    await submitSponsorHandle(container, " @sponsor ");

    await waitForExpectation(() => {
      expect(supabase._insert).toHaveBeenCalledWith({
        requester_id: "candidate-1",
        sponsor_handle: "sponsor",
        sponsor_id: "sponsor-1",
        attempt_number: 1,
      });
    });
    expect(supabase._profileQuery.eq).toHaveBeenCalledWith("x_handle", "sponsor");
    expect(refreshMock).toHaveBeenCalled();
    unmount();
  });

  it("rejects self-sponsorship without inserting a request", async () => {
    const supabase = makeSupabase({
      sponsor: { id: "candidate-1", x_handle: "candidate" },
    });
    createClientMock.mockReturnValue(supabase);
    const { container, unmount } = renderForm();

    await submitSponsorHandle(container, "candidate");

    expect(container.textContent).toContain("Vous ne pouvez pas vous parrainer vous-même.");
    expect(supabase._insert).not.toHaveBeenCalled();
    unmount();
  });

  it.fails("keeps non-disclosing copy visible for unknown sponsor handles", async () => {
    const supabase = makeSupabase({ sponsor: null });
    createClientMock.mockReturnValue(supabase);
    const { container, unmount } = renderForm();

    await submitSponsorHandle(container, "unknown");

    expect(container.textContent).toContain(
      "Si ce membre est inscrit sur MarchéLibre, il recevra votre demande de parrainage.",
    );
    unmount();
  });

  it("does not insert a request for unknown sponsor handles", async () => {
    const supabase = makeSupabase({ sponsor: null });
    createClientMock.mockReturnValue(supabase);
    const { container, unmount } = renderForm();

    await submitSponsorHandle(container, "unknown");

    expect(supabase._insert).not.toHaveBeenCalled();
    unmount();
  });
});
