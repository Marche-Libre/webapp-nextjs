---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - _bmad-output/planning-artifacts/brownfield-mvp-speckit-distillate.md
  - _bmad-output/project-context.md
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: web_app
  domain: private_membership_community
  complexity: medium
  projectContext: brownfield
releaseMode: single-release
workflowType: 'prd'
---

# Product Requirements Document - webapp-nextjs

**Author:** Maxime
**Date:** 2026-04-29

## Executive Summary

Le Marche Libre is a brownfield Next.js/Supabase web app for a private French-first club of liberals and entrepreneurs. The product is motivated by proven demand from the owner's X audience: an initial X post validated interest in a private club, and the resulting X group chat grew to 300+ members and remains active, but has become difficult to manage. The MVP goal is to stabilize the existing prototype into a controlled closed-beta app that preserves the community value of the X group while making admission, identity, topic separation, and core communication manageable.

The target users are existing and invited members from the X-native community who want a trusted private space with shared interests, useful business and job opportunities, and high-signal discussion. The immediate product problem is not inventing a new chat paradigm; it is moving a successful but messy X group into a structured private app with X-based identity verification, manual admission control, admin-defined topic channels, and a chat-first member experience.

### What Makes This Special

The differentiator is access to the curated community, not a novel messaging interface. Users choose Le Marche Libre because it offers entry into a private group with aligned people, higher trust, and practical opportunity exchange that is hard to preserve inside a large X group chat. X authentication is strategically important because it keeps member identity connected to existing X profiles without requiring paid X API access for the MVP.

The core insight is that the community already exists and has demonstrated engagement; the product's job is to make that community usable, safer, and easier to operate. The app should support migration from the existing X group, preserve X-profile-based admission checks, split discussion into admin-defined channels, and park non-essential expansion until the closed-beta loop is stable. True group end-to-end encryption is a clear future candidate, but it is not part of the current MVP unless explicitly promoted to launch scope.

## Project Classification

- **Project Type:** Web app
- **Domain:** Private membership community / closed-beta social communication product
- **Complexity:** Medium
- **Project Context:** Brownfield existing system

## Success Criteria

### User Success

Closed-beta users successfully move from the existing X group chat into Le Marche Libre and can use the app as the new private community space without losing the core value of the original group. Approved members can authenticate with X, complete required profile/admission steps, access admin-defined topic channels, read and send messages, and recognize the app as a more manageable version of the existing X community.

The user "aha" moment is reaching a trusted private chat space with familiar X-native members, clearer topic separation, and useful liberal/entrepreneurial discussion without the chaos of a single 300+ member X group.

### Business Success

The MVP succeeds if the owner can migrate an explicitly selected closed-beta cohort from the X community into the app and prove that the app can replace the X group as the community's operating center.

The initial beta cohort should include 10 to 30 approved members. At least 50% of the selected invite cohort should complete the full path from X authentication to approved chat access within 7 days. At least 60% of approved beta members should send at least one message within 7 days of approval. The community should generate at least 30 messages per day on 3 separate days during the first active beta week.

At 3 months, the owner should see daily engagement, reliable member connection, and evidence that the app is viable as the controlled replacement for the X group.

### Technical Success

The technical launch succeeds when the critical closed-beta loop works reliably: X authentication, profile/admission state handling, approved-user access, pending/refused boundaries, onboarding completion, chat read/send, admin review, and owner/admin role control.

Database security, ownership, roles, and authorization are critical launch gates. Pending, refused, logged-out, and non-member users must not access member-only chat data, message APIs, or private routes. Non-admin users must not perform admin-only actions, including admission decisions, role changes, user-management actions, or channel-management actions.

Owner/admin users must be able to approve, refuse, remove/suspend access, assign roles, and manage core channel availability from the app UI without direct database edits. Admission and role changes should be attributable to an admin actor and timestamped where the current schema supports it, or explicitly flagged as a beta risk if not yet supported.

### Measurable Outcomes

- Initial beta cohort: 10 to 30 approved members from the existing X community.
- Migration conversion: at least 50% of the selected invite cohort completes X authentication, admission approval, and reaches chat within 7 days.
- Activation: at least 60% of approved beta members send at least one message within 7 days of approval.
- Engagement: at least 30 daily messages on 3 separate days during the first active beta week.
- Access control gate: 100% of pending, refused, logged-out, and non-member users are blocked from member-only chat routes, channel data, message APIs, and private community pages.
- Admin authorization gate: 100% of admin-only actions are blocked for non-admin users.
- Operational gate: owner/admin can manage admission state, roles, access removal/suspension, and core channel availability without manual database edits.
- Beta learning: the owner can decide whether the app is viable as the replacement for the X group based on migration rate, activation, engagement, and qualitative member feedback.

## Product Scope Summary

### MVP - Minimum Viable Product

The MVP is a controlled migration chamber from the existing X community into a private chat app. It must stabilize the existing brownfield app around the closed-beta community loop: public landing/access path, X authentication, X profile capture or checking for admission, manual admission, pending/refused/approved states, required onboarding/profile information, approved-member-only app access, chat-centered member experience, admin-defined topic channels, and owner/admin control over users, roles, admission, and core channel access.

The MVP must support migration of a selected 10 to 30 user beta cohort and make the app usable as the replacement community space. It must prioritize database security, ownership, role integrity, and access control over non-essential product expansion.

### Future Candidates / Not Current Scope

Future candidates include broader migration of the 300+ X group, improved topic/channel management, stronger member search, job and business opportunity workflows, richer moderation tools, better admin operations, qualitative feedback loops, and refinement of community engagement. These are retained for later evaluation and are not committed roadmap phases.

True group end-to-end encryption is a clear future differentiator but is not required for the MVP.

### Long-Term Vision

The long-term vision is a trusted private club platform that keeps the X-native identity and curation advantages while providing a cleaner, safer, and more valuable community experience than a large X group chat. If Le Marche Libre succeeds as a club, the model can later expand toward a meta-club platform where others can create private paid communities behind an app paywall.

## User Journeys

### Journey 1: Existing X Group Member Migrates Into the App

Camille is an active member of the existing X group chat. She values the group because the members share her liberal and entrepreneurial interests, but the chat has become noisy and hard to follow. When the owner announces that Le Marche Libre is moving to a dedicated private app, Camille follows the access link and signs in with X.

The app uses her X identity to connect her app account to the community context admins already know. Camille completes the required profile/admission information and waits for manual approval if she is not already approved. Once approved, she lands in the chat-centered app, sees topic channels instead of one chaotic thread, and sends her first message in a relevant channel.

The value moment is immediate: Camille recognizes familiar X-native members, sees conversations separated by topic, and understands that this app is now the cleaner operating center for the community.

This journey reveals requirements for X authentication, X profile association, migration communication, admission state handling, onboarding/profile completion, approved-member routing, topic channels, and chat read/send.

### Journey 2: Pending Candidate Waits for Manual Review

Nicolas discovers Le Marche Libre through the owner's X audience and wants access to the private club. He follows the access path, signs in with X, and provides the required information for admission. He expects private access, but the product must preserve the club boundary: joining is not automatic.

After submission, Nicolas sees a clear pending state explaining that his request is under manual review. He cannot access chat, member profiles, or private community content while pending. The experience must feel deliberate rather than broken: he should understand what happened, what comes next, and why he cannot enter yet.

This journey reveals requirements for public access flow, X authentication, candidate profile capture, pending state UX, private-route protection, chat data protection, and clear admission messaging.

### Journey 3: Refused Candidate Is Blocked Clearly

Adrien signs in with X and submits an access request, but the owner/admin refuses the request after review. Adrien returns to the app later and tries to access the private community. Instead of being silently redirected to login or stuck in a loop, he sees a clear refused state.

The app explains that his request was not accepted for now, using product language rather than database terminology. Adrien cannot access chat, member-only routes, channel data, or message APIs. The refusal experience is firm, explicit, and kind enough to avoid confusion.

This journey reveals requirements for refused-state UX, rejected/refused terminology mapping, access denial, route guards, database authorization, and avoidance of redirect loops.

### Journey 4: Approved Member Uses Topic Channels

Sophie is an approved member who previously found the X group valuable but hard to navigate. She opens Le Marche Libre and lands in the chat-centered member app. Instead of one overloaded group thread, she sees admin-defined channels for major topics such as general discussion, business, politics, and opportunities if those channels are part of the launch set.

Sophie reads current conversations, sends a message in the right channel, and returns later because the community feels easier to follow. She does not need advanced marketplace workflows or a complex forum; the core value is finding high-signal conversation and useful opportunities inside a trusted private group.

This journey reveals requirements for approved-member routing, channel list, message list, message composer, channel-level navigation, daily engagement, and a chat-first app center.

### Journey 5: Owner/Admin Reviews Candidates and Manages Access

Maxime or the owner opens the admin area to review candidates from the existing X community. For each candidate, the admin needs enough X/profile context to recognize the person, understand whether they belong in the club, and make a manual decision. The admin approves trusted candidates, refuses others, and ensures only approved users can enter the private app.

The admin also needs to manage core roles and access without manual database edits. If a user should lose access, the admin needs an operational way to remove or suspend access. If topic channels need adjustment, the admin can create or update the admin-defined channel structure used by the beta cohort.

This journey reveals requirements for admin authentication/authorization, candidate review, X profile context, approve/refuse actions, role management, access removal/suspension, channel management, auditability, and non-admin action blocking.

### Journey 6: Admin Troubleshoots a User Access Problem

Claire is an invited beta user who says she authenticated with X but cannot reach the chat. The admin opens the app's operational/admin view and checks her current status, profile completion state, role, and admission decision. The goal is to resolve the issue through the app rather than directly editing Supabase data.

If Claire is pending, the admin can approve her. If she is approved but not onboarded, the admin can identify that she must complete required profile steps. If her role or status is incorrect, the admin can correct it through authorized controls where available. If the app cannot support the correction yet, the limitation is recorded as a beta operational risk.

This journey reveals requirements for status visibility, role visibility, profile/onboarding visibility, admin troubleshooting, safe state transitions, operational error recovery, and reduced dependency on manual database edits.

### Journey Requirements Summary

The journeys reveal six core capability areas:

- **Access and admission:** X authentication, profile capture, pending/approved/refused states, manual review, and clear admission messaging.
- **Security and authorization:** member-only route protection, chat data protection, non-admin admin-action blocking, refused/pending access denial, and database/server-side enforcement.
- **Migration and onboarding:** selected X cohort migration, required profile completion, approved-user routing, and clear transition from X group to app.
- **Chat-centered member experience:** topic channels, channel navigation, message reading, message sending, and daily community engagement.
- **Admin operations:** candidate review, approve/refuse actions, role/access management, channel management, access removal/suspension, and auditability.
- **Troubleshooting and beta operations:** status inspection, onboarding-state visibility, role correction, access issue diagnosis, and explicit beta-risk tracking when app UI cannot resolve an issue.

## Domain-Specific Requirements

### Compliance & Regulatory

- The product must respect GDPR/privacy basics for profile, admission, role, and private community data.
- Public pages must not imply open self-service access; the product is a closed private club with manual admission.
- Legal pages and terms must remain available and coherent with the closed-beta/private-community positioning.
- Admission and profile data collection should be limited to information needed for X identity checking, manual review, member recognition, and beta operation.
- Data retention and deletion expectations for refused, pending, and inactive users should be clarified before broad migration.

### Technical Constraints

- X authentication and X profile association are central to admission and member identity.
- Member-only access must be enforced server-side and database-side, not only through hidden UI.
- Pending, refused, logged-out, and non-member users must not read private chat data, private profile data, or member-only routes.
- Non-admin users must not perform admission, role, user-management, or channel-management actions.
- Owner/admin roles, admission status, and access-removal/suspension behavior must be reliable enough for beta operation.
- Admin decisions should be auditable where the current schema supports it, or explicitly recorded as a beta risk if auditability is incomplete.

### Integration Requirements

- The MVP depends on X OAuth/sign-in behavior for identity continuity with the existing X community.
- Supabase Auth, database tables, RLS policies, functions, views, and generated types must be audited where they affect admission, profiles, roles, channels, messages, and notifications.
- The initial migration from the X group can be manual or semi-manual, but the selected beta cohort must be trackable enough to measure migration conversion.

### Risk Mitigations

- Identity mismatch risk: admins need enough X/profile context to recognize candidates before approval.
- Admission bypass risk: all protected app access must check approved/member status through trusted server/database paths.
- Private chat leak risk: pending/refused/logged-out/non-member access to routes, queries, APIs, and realtime data must be blocked.
- Role escalation risk: non-admin users must be unable to mutate roles, admission state, user access, or admin channel settings.
- Schema drift risk: production Supabase objects must be reconciled with migrations/types before relying on them for beta readiness.
- Operational risk: normal beta operation should not require direct manual database edits for admission, role, access, or channel tasks.

## Innovation & Novel Patterns

### Detected Innovation Areas

The MVP itself is not positioned as a breakthrough interaction model; it is a focused execution of a private, X-native community migration into a controlled chat app. The innovation surface appears in future candidates, where Le Marche Libre can become more than a private chat replacement.

Key future innovation candidates include:

- **True group end-to-end encryption:** private group chat with stronger confidentiality guarantees than the current MVP.
- **Private 1:1 messages:** direct member-to-member conversations inside the trusted club context.
- **Nostr integration:** identity/profile extension, social graph visualization, Nostr feed integration, and X/Nostr sharing.
- **AI participants:** taggable AI accounts similar to `@grok`, potentially with humorous ideological personas such as a liberal/libertarian AI and a socialist `@marx` counterpart.
- **Shared community knowledge layer:** an AI-assisted "second brain" or communal knowledge base that can summarize, archive, retrieve, and answer from past conversations and curated community knowledge.
- **Richer user profiles:** recent comments, member activity context, and deep links from a profile/comment to the corresponding chat position.
- **Media layer:** books, videos, external media, Invidious integration, Nostr feeds, and cloud-hosted media libraries.
- **Lightning in-app:** Bitcoin/Lightning-based payments or value transfer inside the community.
- **Polls and voting:** lightweight collective decision-making and opinion gathering inside the club.

### Market Context & Competitive Landscape

The current MVP competes with the existing X group chat, Telegram/WhatsApp/Signal-style groups, Discord-style communities, and forum-like community products. Its near-term differentiation is not the interface but the curated private community, X-native identity, and controlled admission.

The future innovation candidates could differentiate Le Marche Libre from generic chat/community tools by combining private admission, ideological/community alignment, encrypted communication, AI-assisted collective memory, Nostr/social graph extensions, and in-app economic primitives.

### Validation Approach

Innovation candidates should be evaluated only after the MVP proves secure migration and daily engagement. Each candidate should be validated against member demand, implementation complexity, privacy/security risk, and fit with the club's core purpose.

Suggested validation order:

1. Validate demand for private 1:1 messages and group E2E encryption through beta feedback.
2. Validate whether members need better retrieval of past conversations before building AI memory.
3. Validate whether Nostr, Lightning, and media features serve actual community behavior or only speculative future positioning.
4. Validate AI personas with small experiments before making them core product surfaces.

### Risk Mitigation

The MVP must not be delayed by speculative innovation. E2E encryption, private DMs, AI agents, Nostr, Lightning, media libraries, polls, and social graph features remain outside current scope unless explicitly promoted to launch scope.

Each innovation area has risk:

- E2E encryption can complicate moderation, search, admin operations, and message recovery.
- Private 1:1 messages can create moderation, safety, privacy, and support expectations.
- AI participants can create trust, quality, liability, and hallucination risks.
- AI community memory can expose private conversation history if permissions and retrieval boundaries are wrong.
- Nostr and X/Nostr sharing can blur the boundary between private and public community content.
- Lightning payments introduce financial, security, and compliance concerns.
- Media hosting introduces storage, copyright, moderation, and cost concerns.

The safe approach is to treat innovation as a structured post-MVP evaluation pipeline, not as part of the closed-beta launch baseline.

## Web App Specific Requirements

### Project-Type Overview

Le Marche Libre is a brownfield Next.js web app with public access pages, auth-facing routes, and protected member/admin app routes. The MVP should stabilize the existing App Router implementation rather than introduce a separate SPA, mobile app, or backend rewrite. Public pages support discovery and access, while private app routes support the closed-beta member experience.

### Technical Architecture Considerations

The web app must preserve the existing Next.js/Supabase architecture while making the closed-beta access boundary reliable. Public routes should remain accessible for landing, legal, login, signup/access, and auth callback flows. Protected routes must require authenticated, approved-member access unless they are explicitly designed for pending/refused/onboarding states.

The primary app destination for approved onboarded users is `/chat`. Chat routes must support real-time or near-real-time member communication, with Supabase realtime behavior verified before beta. Admin routes must remain protected by owner/admin role checks server-side and database-side.

### Browser Matrix

The MVP should support current stable desktop and mobile browsers used by the beta cohort. Legacy browser support is not required. Mobile usability matters because users may come from X links and expect the app to work from a phone browser.

### Responsive Design

The web app must be usable on both desktop and mobile for the beta-critical flows: public access, X authentication callback, pending/refused states, onboarding/profile completion, chat reading/sending, and admin review where practical. The MVP does not require a native mobile app or full PWA install behavior.

### Performance Targets

The MVP performance target is reliability over optimization. Public pages, auth routing, onboarding, and chat entry should load without blocking errors for invited beta users. Chat should feel responsive enough for daily conversation in the initial 10 to 30 user cohort, and performance issues should not require manual admin intervention during normal beta usage.

### SEO Strategy

SEO is relevant only for public landing and legal pages. Private app content, member profiles, chat messages, admin screens, and admission states should not be indexed or treated as public discovery content. Public copy must accurately present the closed-beta/private-club nature of the product and avoid promising parked MVP features.

### Accessibility Level

The MVP should meet practical baseline accessibility: readable text, keyboard-reachable primary actions, clear focus states where supported by existing components, semantic links/buttons, and understandable pending/refused/error states. Formal WCAG certification is not required for closed beta, but critical access, admission, and chat flows must be usable without fragile visual-only cues.

### Implementation Considerations

The implementation should make the smallest brownfield-safe changes needed to stabilize the closed-beta web app. Route, redirect, middleware/proxy, auth, and protected-layout changes must follow the installed Next.js 16 documentation. Supabase access must use the existing project helpers rather than ad hoc clients. Runtime changes must distinguish new regressions from existing baseline failures, and any security-sensitive Supabase work must treat the connected database as production-impacting.

## Project Scoping

### Strategy & Philosophy

**Approach:** Current-scope closed-beta MVP.

The PRD scope is focused on the immediate closed-beta release: a secure migration chamber from the existing X group into a private, topic-based chat app. The MVP should prove that selected members can move from X into the app, authenticate with X, pass manual admission, access approved-member chat, and keep the community active without compromising roles, ownership, or data security.

Future ideas are retained as candidates, not committed roadmap phases. They should not dilute the current scope or block beta launch unless the owner explicitly promotes one into MVP scope.

**Resource Requirements:** Owner plus AI-agent-assisted execution, with human review for product decisions, Supabase/security decisions, and launch go/no-go. The MVP requires product ownership, Next.js/Supabase engineering, Supabase schema/RLS review, and manual beta operations.

### Current Release Feature Set

**Core User Journeys Supported:**

- Existing X group member migrates into the app.
- Pending candidate signs in with X, submits required information, and waits for manual review.
- Refused candidate sees a clear refusal state and cannot access private content.
- Approved member uses admin-defined topic channels for daily discussion.
- Owner/admin reviews candidates, approves/refuses users, manages roles/access, and controls core channels.
- Admin troubleshoots beta access problems without relying on manual database edits where possible.

**Must-Have Capabilities:**

- Public landing/access path that accurately presents the private closed-beta club.
- X authentication and X profile association for admission context.
- Manual admission workflow with pending, approved, and refused states.
- Required onboarding/profile information sufficient for member recognition and admin review.
- Approved-member-only app access centered on `/chat`.
- Admin-defined topic channels.
- Chat read/send for approved members.
- Owner/admin review of candidates.
- Owner/admin role and access management.
- Access removal or suspension capability for operational safety.
- Server/database-enforced authorization for member-only routes, chat data, admin actions, roles, and channel management.
- Supabase schema/RLS audit or explicit risk acceptance for admission, profiles, roles, channels, messages, and notifications.
- Basic operational visibility for user status, role, onboarding/profile completion, and access issues.
- Mobile and desktop browser usability for beta-critical flows.

**Nice-to-Have Capabilities:**

- More polished admin operations.
- Stronger member search and profile activity context.
- Better migration tracking and qualitative feedback capture.
- Improved topic/channel management beyond the minimum needed for beta.
- Lightweight analytics for activation and engagement.
- More structured job/business opportunity flows.

### Future Candidates / Not Current Scope

The following ideas should be retained for later evaluation but are not part of the current MVP scope:

- Full migration of all 300+ X group members.
- True group end-to-end encryption.
- Private 1:1 messages.
- Nostr identity, feed, sharing, or social graph features.
- AI participants such as taggable ideological/persona bots.
- AI-assisted shared community memory or "second brain."
- Rich media layer for books, videos, Invidious, cloud media, or external feeds.
- Lightning in-app payments or value transfer.
- Polls and voting.
- Advanced moderation tooling.
- Full community platform or meta-club platform capabilities.
- Public growth loops, self-serve community creation, or paid club platformization.

### Risk Mitigation Strategy

**Technical Risks:** The highest technical risks are Supabase schema/RLS uncertainty, admission/role bypass, private chat data leakage, X auth/profile mismatch, and brownfield route/runtime drift. Mitigation is to audit the production-connected Supabase model before relying on it, enforce authorization server/database-side, verify the route/access matrix, and make only minimal brownfield-safe changes.

**Market Risks:** The main market risk is that members do not migrate or do not remain active once outside X. Mitigation is to start with a selected 10 to 30 user cohort, measure conversion/activation/messages, and collect qualitative feedback before broad migration.

**Resource Risks:** The project has limited execution capacity. Mitigation is to keep the MVP narrow, park speculative future ideas, avoid broad refactors, and prioritize only work that enables secure beta launch or validates migration from X.

## Functional Requirements

### Public Access and Positioning

- FR1: Visitors can understand that Le Marche Libre is a private closed-beta club with manual admission.
- FR2: Visitors can access legal and terms pages from the public site.
- FR3: Visitors can start the app access flow from the public site.
- FR4: Public pages can avoid presenting parked or future-only capabilities as current product promises.

### Identity and Authentication

- FR5: Candidates can sign in with X to associate their app account with an X identity.
- FR6: The system can retain enough X profile context to support manual admission review.
- FR7: Existing users can return to the app without repeating unnecessary authentication steps.
- FR8: Signed-out users can access only public and authentication-appropriate routes.

### Admission and Onboarding

- FR9: Candidates can provide required admission and profile information after X sign-in.
- FR10: Candidates can submit an access request for manual review.
- FR11: Pending users can see a clear pending state while waiting for review.
- FR12: Refused users can see a clear refused state without being redirected into a confusing login loop.
- FR13: Approved users who have not completed required onboarding can complete the required profile/onboarding flow.
- FR14: Approved onboarded users can enter the private member app.
- FR15: The system can distinguish pending, approved, refused, and approved-not-onboarded user states.
- FR16: The system can route users according to their authentication, admission, onboarding, and role state.

### Member Chat Experience

- FR17: Approved members can access the chat-centered member app.
- FR18: Approved members can view admin-defined topic channels.
- FR19: Approved members can open a topic channel and read messages.
- FR20: Approved members can send messages in allowed topic channels.
- FR21: Approved members can return to the app and resume participation in the community.
- FR22: The app can support the selected beta cohort using chat as the primary member destination.

### Admin Admission and Access Operations

- FR23: Owner/admin users can view candidates awaiting manual review.
- FR24: Owner/admin users can inspect candidate profile and X identity context needed for admission decisions.
- FR25: Owner/admin users can approve candidates.
- FR26: Owner/admin users can refuse candidates.
- FR27: Owner/admin users can view member admission status, role, onboarding/profile completion state, and access state.
- FR28: Owner/admin users can manage user roles needed for beta operation.
- FR29: Owner/admin users can remove or suspend member access for operational safety.
- FR30: Owner/admin users can troubleshoot member access problems through app-visible status and role information where supported.
- FR31: The system can associate admission and role changes with an admin actor and timestamp where supported by the current data model.

### Channel Administration

- FR32: Owner/admin users can define the topic channels available to the beta community.
- FR33: Owner/admin users can update core channel availability needed for beta operation.
- FR34: Non-admin users cannot create, rename, or manage channels unless explicitly allowed by a future requirement.
- FR35: The system can keep user-created channel proposal functionality out of the MVP member experience.

### Authorization and Protected Access

- FR36: Pending users cannot access member-only routes, channel data, message data, or private community pages.
- FR37: Refused users cannot access member-only routes, channel data, message data, or private community pages.
- FR38: Logged-out users cannot access member-only routes, channel data, message data, or private community pages.
- FR39: Non-member users cannot access member-only routes, channel data, message data, or private community pages.
- FR40: Non-admin users cannot perform admission, role-management, user-management, access-management, or channel-management actions.
- FR41: The system can enforce member and admin boundaries outside the visible UI, including server/database-protected access paths.
- FR42: The system can prevent private chat or member data from being exposed through direct route, query, API, or realtime access by unauthorized users.

### Migration and Beta Operations

- FR43: Owner/admin users can identify or track the selected X community cohort used for closed-beta migration.
- FR44: The team can determine whether selected invitees completed X authentication, admission approval, and chat access.
- FR45: The team can observe whether approved beta members activate by sending messages.
- FR46: The team can evaluate whether the app is viable as the replacement for the X group using migration, activation, engagement, and qualitative feedback.
- FR47: Normal beta operation can be performed without relying on direct manual database edits for admission, roles, access, or core channel tasks.

### Scope Parking and Future Candidate Management

- FR48: The PRD can retain future product candidates separately from current MVP scope.
- FR49: Future-only capabilities can remain excluded from the MVP unless explicitly promoted into current scope.
- FR50: MVP planning can distinguish current launch requirements from future candidates such as E2E encryption, private 1:1 messages, Nostr, AI, Lightning, media, polls, and meta-club platformization.

## Non-Functional Requirements

### Security

- NFR1: Pending, refused, logged-out, and non-member users must be blocked from member-only routes, private chat data, message APIs, and realtime/private data access paths.
- NFR2: Non-admin users must be blocked from admission, role-management, user-management, access-management, and channel-management actions.
- NFR3: Member/admin authorization must be enforced outside the visible UI through trusted server/database-controlled access paths.
- NFR4: Supabase RLS policies, functions, views, triggers, generated types, and migrations affecting admission, profiles, roles, channels, messages, and notifications must be audited or explicitly accepted as launch risk before beta.
- NFR5: Sensitive credentials, service-role keys, and private secrets must not be exposed to client-side code.
- NFR6: Access removal or suspension must reliably prevent future member-only access for the affected user.

### Reliability

- NFR7: Invited beta users must be able to complete X sign-in, admission-state routing, onboarding/profile completion, and chat entry without recurring blocking errors.
- NFR8: Approved onboarded users must consistently route to `/chat`; approved not-onboarded users must route to onboarding; pending/refused users must route to explicit status boundaries.
- NFR9: The app must avoid redirect loops in auth, onboarding, pending, refused, and approved-user flows.
- NFR10: Chat read/send must work reliably enough for the initial 10 to 30 user beta cohort.
- NFR11: Normal beta operations must not depend on direct manual database edits for admission, role, access, or core channel tasks.

### Performance

- NFR12: Public access, auth callback, admission status, onboarding, and chat entry pages should load without user-visible blocking delays for the initial beta cohort.
- NFR13: Chat message sending and reading should feel responsive enough to sustain daily conversation in the selected beta cohort.
- NFR14: Performance optimization beyond beta usability is not an MVP goal unless a performance issue blocks authentication, admission, or chat usage.

### Scalability

- NFR15: The MVP must support the initial selected beta cohort of 10 to 30 approved users.
- NFR16: The system should not make architectural choices that obviously prevent later migration of the broader 300+ member X group, but full-scale migration is not required for MVP.
- NFR17: Future scaling toward broader migration must be preceded by security, schema/RLS, and operational readiness review.

### Accessibility

- NFR18: Public access, authentication, pending/refused states, onboarding, chat, and admin-critical flows must use readable text and clear actionable controls.
- NFR19: Critical admission and access states must not rely only on ambiguous visuals; users must be able to understand whether they are pending, refused, approved, or blocked.
- NFR20: MVP accessibility targets are practical closed-beta usability targets, not formal WCAG certification.

### Integration

- NFR21: X authentication must provide sufficient identity continuity for admission review and member recognition.
- NFR22: Supabase Auth/session handling must remain aligned with the existing project helpers and environment contract.
- NFR23: External integrations beyond X auth and Supabase, including Nostr, Lightning, AI providers, media services, and Invidious, are not MVP dependencies.

### Privacy and Compliance

- NFR24: Admission, profile, role, and private-message data must be treated as private community data.
- NFR25: Public pages must not expose private member content, private profiles, chat messages, or admin/admission data.
- NFR26: Data collection for MVP should stay limited to information needed for authentication, manual admission, member recognition, beta operations, and access control.
- NFR27: GDPR/privacy expectations for pending, refused, approved, and inactive users must be clarified before broad migration beyond the initial beta cohort.

### Operational Readiness

- NFR28: Owner/admin users must be able to operate the beta using app-visible status, role, admission, and access information.
- NFR29: Build, lint, test, and manual verification outcomes must distinguish baseline failures from new regressions.
- NFR30: Beta launch must not proceed if there is a known unresolved bypass for member-only access or admin-only actions.
- NFR31: Production-connected Supabase actions must be treated as production-impacting, with inspection before writes and no destructive changes without explicit owner approval.
