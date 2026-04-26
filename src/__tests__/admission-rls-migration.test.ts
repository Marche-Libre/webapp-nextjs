import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260426192341_admission_profile_status_rls.sql",
  ),
  "utf8",
);

describe("admission profile RLS migration", () => {
  it("freezes all profile admission fields for normal own-profile updates", () => {
    expect(migration).toContain("private.profile_admission_fields_unchanged");
    expect(migration).toContain("p.x_handle IS NOT DISTINCT FROM new_x_handle");
    expect(migration).toContain("p.status IS NOT DISTINCT FROM new_status");
    expect(migration).toContain("p.is_admin IS NOT DISTINCT FROM new_is_admin");
    expect(migration).toContain("p.sponsored_by IS NOT DISTINCT FROM new_sponsored_by");
    expect(migration).toContain("p.sponsor_approved IS NOT DISTINCT FROM new_sponsor_approved");
    expect(migration).toContain("AND profile_id = auth.uid()");
    expect(migration).toContain('DROP POLICY IF EXISTS "Users can update own profile"');
  });

  it("keeps sponsor confirmation separate from final admission approval", () => {
    expect(migration).toContain("private.has_sponsorship_request_for_profile");
    expect(migration).toContain("private.has_approved_sponsorship_request_for_profile");
    expect(migration).toContain("sr.requester_id IS DISTINCT FROM sr.sponsor_id");
    expect(migration).toContain("sponsor.status = 'approved'");
    expect(migration).toContain(
      "LOWER(BTRIM(sponsor.x_handle)) = LOWER(BTRIM(sr.sponsor_handle))",
    );
    expect(migration).toContain("private.profile_only_sponsor_confirmation_changed");
    expect(migration).toContain(
      "to_jsonb(new_profile) - 'sponsored_by' - 'sponsor_approved' - 'updated_at'",
    );
    expect(migration).toContain(
      'CREATE POLICY "Sponsors can view requester profiles for sponsorship requests"',
    );
    expect(migration).toContain("AND sponsor_profile_id = auth.uid()");
    expect(migration).toContain('DROP POLICY IF EXISTS "Sponsors can approve their sponsored users"');
    expect(migration).toContain("sponsor_approved = TRUE");
    expect(migration).toContain(
      "private.profile_only_sponsor_confirmation_changed(profiles)",
    );
  });

  it("limits sponsor request updates to status-only changes", () => {
    expect(migration).toContain("private.sponsorship_request_only_status_changed");
    expect(migration).toContain('DROP POLICY IF EXISTS "Requesters can create requests"');
    expect(migration).toContain("requester_id = auth.uid()");
    expect(migration).toContain("status = 'pending'");
    expect(migration).toContain("sponsor_id IS NOT NULL");
    expect(migration).toContain("sponsor_id IS DISTINCT FROM auth.uid()");
    expect(migration).toContain(
      "LOWER(BTRIM(sponsor.x_handle)) = LOWER(BTRIM(sponsor_handle))",
    );
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Sponsors can update requests for them"',
    );
    expect(migration).toContain("sponsor_id = auth.uid()\n    AND status = 'pending'");
    expect(migration).toContain("status IN ('approved', 'rejected')");
    expect(migration).toContain("to_jsonb(new_request) - 'status' - 'updated_at'");
  });

  it("allows invitation sponsor attachment only through accepted invitations", () => {
    expect(migration).toContain("private.has_accepted_invitation_for_profile");
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Approved users can create invitations"',
    );
    expect(migration).toContain("inviter_id = auth.uid()");
    expect(migration).toContain("accepted_by IS NULL");
    expect(migration).toContain("NULLIF(BTRIM(invited_x_handle), '') IS NOT NULL");
    expect(migration).toContain("private.invitation_identity_fields_unchanged");
    expect(migration).toContain(
      "LOWER(BTRIM(inv.invited_x_handle)) = LOWER(BTRIM(profile_x_handle))",
    );
    expect(migration).toContain("AND status = 'pending'");
    expect(migration).toContain("inv.inviter_id IS DISTINCT FROM inv.accepted_by");
    expect(migration).toContain("private.profile_only_invitation_sponsor_confirmation_changed");
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Invited users can update invitation status"',
    );
    expect(migration).toContain(
      'CREATE POLICY "Invited users can attach accepted invitation sponsor"',
    );
    expect(migration).toContain("inv.status = 'accepted'");
    expect(migration).toContain("status = 'accepted' AND accepted_by = auth.uid()");
    expect(migration).toContain("dup.id <> profile_id");
  });
});
