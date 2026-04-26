# Test Plan: Admission Membre MVP

This test plan maps the acceptance criteria to concrete automated, SQL/RLS, and
manual checks. The first Vitest layer has been added; the remaining layers must
be implemented or run during admission hardening.

## Test Architecture

- **Unit/component tests**: deterministic form validation, Server Action
  authorization branches, and recoverable UI errors with mocked Supabase.
- **Integration tests**: route/action behavior with mocked server Supabase
  clients and redirect assertions.
- **SQL/RLS tests**: database authorization boundaries for profile status,
  sponsorship requests, invitations, and member-only data access.
- **Manual/staged checks**: real X OAuth, session reuse, redirect-loop
  reproduction, and admin review timing.

## Current Automated Coverage

| ID | File | Coverage |
| --- | --- | --- |
| ADM-U-001 | `src/__tests__/sponsor-request-form.test.tsx` | Sponsor handle is required, normalized, and checked for self-sponsorship. |
| ADM-U-003 | `src/__tests__/sponsor-request-form.test.tsx` | Unknown sponsor does not insert a request; visible non-disclosing copy is marked expected-fail because current UI hides it after submit. |
| ADM-U-004 | `src/__tests__/admin-admission-actions.test.ts` | Admin actions reject unauthenticated and non-admin actors. |
| ADM-U-005 | `src/__tests__/admin-admission-actions.test.ts` | Admin actions write runtime `approved` and `rejected` statuses and surface update errors. |

## Required Remaining Checks

| ID | Layer | Case | Acceptance Criteria |
| --- | --- | --- | --- |
| ADM-U-002 | Unit/component | Existing pending/approved sponsorship requests block duplicate submission; rejected attempts below limit allow the next attempt. | Candidate sponsor validation. |
| ADM-U-006 | Unit/component | Approved onboarding finalization sets `onboarding_completed = true`; optional notification/intro failures do not trap the user after profile completion succeeds. | No 500/loop on onboarding finalization. |
| ADM-I-001 | Integration | `/auth/callback` without code or with exchange failure redirects to `/connexion`. | OAuth failure recovery. |
| ADM-I-002 | Integration | Approved onboarded callback redirects to app entry; approved not-onboarded redirects to `/onboarding`; stale referral cookie is cleared. | Session reuse and approved access. |
| ADM-I-002a | Integration | Successful first X OAuth callback writes session cookies, sees/creates profile, and reaches the correct pending/onboarding/app destination without returning to `/connexion` and requiring a second login. | First-login callback regression. |
| ADM-I-003 | Integration | Pending callback with valid `ml-referral` resolves only approved sponsor, creates `sponsorship_requests`, sets sponsor context, clears cookie, redirects `/en-attente`. | Candidate access request creation. |
| ADM-I-004 | Integration | `/en-attente` routes anonymous, rejected, approved not-onboarded, approved onboarded, and pending users according to contract. | Status-based access. |
| ADM-I-005 | Integration | Middleware redirects anonymous protected requests, pending users, approved not-onboarded users, and fully onboarded users consistently. | Protected-route guard. |
| ADM-I-006 | Integration | `(app)/layout.tsx` agrees with middleware for pending, rejected, approved not-onboarded, and approved onboarded states. | Protected-route guard. |
| ADM-I-007 | Integration | Admin users page lists pending profiles with handle, email/name, created date, sponsor state, and sponsorship/invitation evidence. | Admin has enough evidence to decide. |
| ADM-I-008 | Integration | Admin approve/reject changes candidate route access on the next request. | Admin decision affects access. |
| ADM-SQL-001 | SQL/RLS | Non-admin authenticated user cannot update their own `profiles.status` through client Supabase. | Non-admin cannot bypass review. |
| ADM-SQL-002 | SQL/RLS | Non-admin cannot update another profile status; admin can update only according to selected transition policy. | Admin-only review enforcement. |
| ADM-SQL-003 | SQL/RLS | Requester can insert/view only their own sponsorship requests and cannot spoof another `requester_id`. | Candidate request ownership. |
| ADM-SQL-004 | SQL/RLS | Sponsor can view/update only requests where `sponsor_id = auth.uid()`. | Sponsor evidence integrity. |
| ADM-SQL-005 | SQL/RLS | Invitation creator must be approved; invited user can update only invitations matching their `x_handle`. | Compatibility invitation safety. |
| ADM-SQL-006 | SQL/RLS | Pending/rejected profiles cannot create or view member-only records guarded by approved-user policies. | Private-network boundary. |
| ADM-M-001 | Manual/staged | Real X OAuth creates/reuses Supabase session and profile, including incomplete metadata fallback. | X auth/session acceptance. |
| ADM-M-001a | Manual/staged | Fresh browser/session: first X OAuth login must not bounce back to `/connexion`; a second login must not be required to enter pending/onboarding/app flow. | User-reported first-login regression. |
| ADM-M-002 | Manual/staged | Candidate signs in, submits sponsor handle on `/en-attente`, and remains in stable pending state with no 500 or loop. | Candidate request acceptance. |
| ADM-M-003 | Manual/staged | Approved not-onboarded user completes `/onboarding` and reaches app entry without 500 or loop. | Onboarding regression. |
| ADM-M-004 | Manual/staged | Admin reviews a pending candidate and approve/refuse flow completes in under 3 minutes. | Admin review timing. |
| ADM-M-005 | Manual/staged | Rejected/refused account signs in again and sees selected refused UX with no member content reachable. | Refused access behavior. |

## High-Risk First Check

Run ADM-SQL-001 before relying on app-layer tests. Current profile policies
include a broad own-profile update policy while `status` lives on the same row.
If a non-admin can self-update `profiles.status`, FR-010 and SC-003 fail even
when Server Actions reject non-admin callers.

## Newly Recorded Bugs

- **OAuth first-login bounce**: user reports `login with X -> redirected to
  /connexion -> login again -> enter app`. Cover with ADM-I-002a and
  ADM-M-001a; likely surfaces around callback cookie writes, profile creation
  timing, or middleware reading the session/profile before cookies are
  committed.
- **Unknown sponsor feedback hidden**: expected-fail component test documents
  that unknown sponsor non-disclosing copy is not visible after submit.
- **Potential self-approval through RLS**: verify before relying on app-layer
  admin actions.
