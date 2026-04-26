# Contracts: Admission Flow

These contracts describe the expected behavior of existing routes, Server
Actions, and database paths. They are not new public APIs.

## Public/Auth Route Contract

### `/`

- Publicly accessible.
- Must continue to offer existing admission/auth entry points.
- Must not become the candidate application form for this feature.

### `/connexion` and `/inscription`

- Publicly accessible.
- Start Supabase OAuth with provider `x`.
- Callback target is `/auth/callback`.
- Authenticated approved/onboarded users may be redirected to app entry by the
  guard layer.

### `/rejoindre?ref={x_handle}`

- Publicly accessible.
- Normalizes `ref` by removing `@`.
- Stores referral handle in `ml-referral` cookie before X OAuth.
- Does not trust the client cookie for final authorization; callback must
  resolve sponsor server-side.

### `/auth/callback`

- Exchanges OAuth code for Supabase session.
- Loads or creates profile via existing database trigger/path.
- If profile is `approved`, redirects to `/onboarding` or app entry depending
  on `onboarding_completed`.
- If profile is not approved, resolves `ml-referral` to an approved sponsor
  where possible and creates `sponsorship_requests` evidence, then redirects to
  `/en-attente`.
- Referral processing must not set `profiles.sponsored_by` directly; that field
  changes only after sponsor confirmation or accepted invitation evidence.
- Must clear `ml-referral` after processing.
- Must not produce a redirect loop when profile data is incomplete.

## Candidate Waiting Contract

### `/en-attente`

- Requires authenticated user.
- If no profile can be loaded, redirects to `/connexion` or returns a
  recoverable error according to implementation decision.
- If `status = approved`, redirects to `/onboarding` when
  `onboarding_completed = false`, otherwise app entry.
- If `status = rejected`, shows selected refused UX. Current runtime redirects
  to `/connexion`; changing this requires owner decision.
- If `status = pending`, displays sponsor/invitation state and allows sponsor
  request submission when eligible.

### Sponsor Request Submission

- Input: sponsor X handle.
- Normalize by trimming whitespace and removing leading `@`.
- Reject empty handle.
- Reject self-sponsorship.
- Resolve only approved sponsor profiles.
- Insert `sponsorship_requests` with `requester_id = current user`,
  `sponsor_handle`, optional `sponsor_id`, and next valid `attempt_number`.
- Inserted requests must be `pending`, owned by the requester, and non-self when
  `sponsor_id` is present.
- Inserted requests with `sponsor_id` must reference an approved sponsor and
  match the normalized `sponsor_handle` to the sponsor profile `x_handle`.
- Unknown sponsor copy must avoid unnecessary account-existence disclosure.
- Failure must show a recoverable error and must not loop.

## Approved Onboarding Contract

### `/onboarding`

- Requires authenticated approved profile.
- Non-approved users are redirected to `/en-attente`.
- If `onboarding_completed = true`, redirects to app entry.
- Current wizard is approved-member profile completion, not candidate admission.
- Finalization sets `profiles.onboarding_completed = true`.
- Optional side effects, such as welcome notification or intro post, must not
  leave the user trapped if profile finalization already succeeded.
- On failure, show a recoverable error and allow retry.

## Admin Review Contract

### `/admin` and `/admin/utilisateurs`

- Require authenticated admin profile.
- Non-admin users are redirected away and must also fail privileged actions.
- Pending users are listed with enough evidence to decide: X handle, email/name
  when available, created date, sponsor profile, sponsor approval state, and
  selected sponsorship/invitation context.
- Processing target for one candidate should be possible in under 3 minutes.

### `approveUser(userId)`

- Server Action.
- Reads actor from server-side Supabase session/cookies.
- Requires actor profile `is_admin = true`.
- Updates target `profiles.status` to `approved` only if transition is allowed
  by the selected transition rule.
- Returns `{ success: true }` or `{ success: false, error }`.
- Must be rejected for non-admin callers by server check and database/RLS.

### `rejectUser(userId)`

- Server Action.
- Same authorization requirements as `approveUser`.
- Updates target `profiles.status` to `rejected` only if transition is allowed.
- Product copy may call this refused, but runtime value remains `rejected`.

## Access Guard Contract

Routes under the member app must enforce this matrix consistently in middleware
and server layouts:

| Session/profile state | Expected result |
| --- | --- |
| No session on protected route | `/connexion` |
| Authenticated, no profile | recoverable auth/profile error or `/connexion`; no loop |
| `pending` | `/en-attente` only |
| `rejected` | selected refused UX; no member content |
| `approved`, `onboarding_completed = false` | `/onboarding` only |
| `approved`, `onboarding_completed = true` | member app |

## Database/RLS Contract

- `profiles`, `invitations`, and `sponsorship_requests` RLS policies must be
  reproducible from migrations.
- Non-admin authenticated users must not be able to update another profile's
  `status` through client Supabase calls.
- Sponsor actions can only affect requests addressed to that sponsor.
- Requester inserts must be pending-only and cannot self-sponsor.
- Requester inserts must target an approved sponsor and keep handle/id evidence
  consistent.
- Sponsor request updates must be status-only and cannot rewrite request
  identity fields.
- Sponsor request updates must start from `pending`; sponsors cannot flip an
  already approved/rejected request through the sponsor path.
- Sponsor profile confirmation can update only `profiles.sponsored_by`,
  `profiles.sponsor_approved`, and trigger-managed `updated_at`; it cannot
  change final `profiles.status` or profile content.
- Self-profile updates cannot change `x_handle` while invitation compatibility
  uses X handle matching as admission evidence.
- Invitation acceptance can attach sponsor context only from an accepted
  invitation matching the candidate handle, must start from a pending
  invitation for non-admin invitees, and cannot rewrite invitation identity
  fields.
- Requesters can only create/view their own sponsorship requests.
- Admin review must be protected both by Server Action checks and database/RLS
  behavior.

## Verification Contract

- Automated or documented manual checks must cover pending, rejected, approved
  not-onboarded, and approved onboarded routing.
- Repo tests must not call the database. They must use mocked Supabase clients
  or static migration inspection for RLS guardrails; live RLS behavior is
  validated manually/staged after migration application.
- Regression checks must cover sponsor request submission and onboarding
  finalization without 500/loop.
