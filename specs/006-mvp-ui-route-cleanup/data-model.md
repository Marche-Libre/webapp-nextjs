# Data Model: MVP UI Route Cleanup

This feature does not introduce, remove, or migrate persisted data. The model below describes behavioral state and visible product contracts used by implementation and tests.

## Membre approuvé et onboardé

- **Source attributes**: Existing authenticated user profile with `status = approved` and `onboarding_completed = true`.
- **Relationships**: Can access retained app routes, including `/chat`, `/chat/[slug]`, `/forum`, `/membres`, and `/membres/[id]` under existing access rules.
- **Validation rules**: Default post-login, public/auth return, logo/sidebar, settings return, waiting-approved flow, and non-admin fallback must land on `/chat`.
- **State transitions**: Pending or approved-not-onboarded users transition through existing admission/onboarding flow before becoming this state.

## Membre approuvé non onboardé

- **Source attributes**: Existing authenticated user profile with `status = approved` and `onboarding_completed != true`.
- **Relationships**: Must complete onboarding before entering retained app shell.
- **Validation rules**: Direct access to app routes should still redirect to onboarding; already-onboarded users who revisit onboarding should go to `/chat`.
- **State transitions**: On onboarding completion, becomes approved and onboarded, then routes to `/chat`.

## Membre en attente

- **Source attributes**: Existing authenticated user profile with a non-approved, non-rejected admission state.
- **Relationships**: Uses `/en-attente` and sponsorship status UI under existing rules.
- **Validation rules**: Should not access the app shell until approved; if approval is detected and onboarding is complete, route to `/chat`.
- **State transitions**: Can become approved, remain pending, or become rejected according to existing admin/admission behavior.

## Utilisateur refusé

- **Source attributes**: Existing authenticated user profile with `status = rejected`.
- **Relationships**: Should not access retained app shell. Should see explicit refusal UX at the status/auth boundary.
- **Validation rules**: Must not be silently redirected to `/connexion` without context.
- **State transitions**: No new transition introduced. Existing admin refusal remains the source of truth.

## Surface MVP visible

- **Fields**: Visible navigation entries, visible public landing promises, visible chat controls, visible default destinations.
- **Relationships**: Includes member sidebar, logo link, settings return, chat channel list, public landing/footer, and route defaults.
- **Validation rules**: Must include Chat as the visible canonical collaboration surface. Must not visibly promote Forum, Annuaire, channel proposals, or offers/jobs as Beta 1 available features.

## Route legacy

- **Fields**: Path, existing access guard, direct-access behavior, visibility status.
- **Instances**: `/forum`, `/membres`, `/membres/[id]`.
- **Relationships**: May still be reached from historical/contextual links or direct URLs.
- **Validation rules**: Must remain directly accessible under existing access rules. Must not be listed as main MVP navigation entries.

## Route chat canonique

- **Fields**: Path, destination type, optional channel slug.
- **Instances**: `/chat`, `/chat/[slug]`.
- **Relationships**: Receives default destinations and channel-specific links where slug exists.
- **Validation rules**: `/chat` is the default for generic app entry. `/chat/[slug]` is preferred over `/chat?channel=...` where a slug is already available.

## Proposition de salon

- **Source attributes**: Existing proposal and vote data may exist in Supabase.
- **Relationships**: Previously visible from chat channel list.
- **Validation rules**: Must not be visible or actionable in the Beta 1 chat interface. Must not be deleted or migrated by this feature.
