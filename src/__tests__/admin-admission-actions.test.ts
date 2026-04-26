import { describe, it, expect, vi, beforeEach } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { approveUser, rejectUser } from "@/app/(app)/admin/actions";

function mockSupabase({
  user = { id: "admin-1" },
  adminProfile = { is_admin: true },
  updateError = null,
}: {
  user?: { id: string } | null;
  adminProfile?: { is_admin: boolean } | null;
  updateError?: { message: string } | null;
} = {}) {
  const selectFn = vi.fn().mockReturnThis();
  const selectEqFn = vi.fn().mockReturnThis();
  const singleFn = vi.fn().mockResolvedValue({ data: adminProfile });
  const updateEqFn = vi.fn().mockResolvedValue({ error: updateError });
  const updateFn = vi.fn().mockReturnValue({ eq: updateEqFn });

  const table = {
    select: selectFn,
    eq: selectEqFn,
    single: singleFn,
    update: updateFn,
  };

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn().mockReturnValue(table),
    _selectEqFn: selectEqFn,
    _updateFn: updateFn,
    _updateEqFn: updateEqFn,
  };

  createClientMock.mockResolvedValue(client);
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin admission actions", () => {
  it("rejects approval when no user is authenticated", async () => {
    const supabase = mockSupabase({ user: null });

    await expect(approveUser("candidate-1")).resolves.toEqual({
      success: false,
      error: "Non authentifié",
    });
    expect(supabase._updateFn).not.toHaveBeenCalled();
  });

  it("rejects approval when the actor is not an admin", async () => {
    const supabase = mockSupabase({ adminProfile: { is_admin: false } });

    await expect(approveUser("candidate-1")).resolves.toEqual({
      success: false,
      error: "Accès refusé",
    });
    expect(supabase._updateFn).not.toHaveBeenCalled();
  });

  it("approves a candidate only after checking the current actor admin profile", async () => {
    const supabase = mockSupabase();

    await expect(approveUser("candidate-1")).resolves.toEqual({
      success: true,
    });

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(supabase._selectEqFn).toHaveBeenCalledWith("id", "admin-1");
    expect(supabase._updateFn).toHaveBeenCalledWith({ status: "approved" });
    expect(supabase._updateEqFn).toHaveBeenCalledWith("id", "candidate-1");
  });

  it("refuses a candidate with the runtime rejected status", async () => {
    const supabase = mockSupabase();

    await expect(rejectUser("candidate-1")).resolves.toEqual({
      success: true,
    });

    expect(supabase._updateFn).toHaveBeenCalledWith({ status: "rejected" });
    expect(supabase._updateEqFn).toHaveBeenCalledWith("id", "candidate-1");
  });

  it("returns a recoverable error when the profile status update fails", async () => {
    mockSupabase({ updateError: { message: "RLS denied" } });

    await expect(approveUser("candidate-1")).resolves.toEqual({
      success: false,
      error: "RLS denied",
    });
  });
});
