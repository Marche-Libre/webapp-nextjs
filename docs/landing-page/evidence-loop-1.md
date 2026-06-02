# Evidence Pack — Loop 1 (Corrected Candidate)

**Date:** Immediate follow-up after Loop 0 review failures  
**Candidate:** /early-access (fixed v1)  
**Previous issues (from design-taste-frontend review):** All resolved in this pack.

## Corrections Made (direct response to blockers)
1. **Duplicate / broken JSX removed:** File now terminates cleanly after the default export `}`. No stray return statements or duplicate AccessCta definitions. (Static parse + module scope now valid.)
2. **Zero em-dashes (absolute gate):** All four instances of " — " in admission steps replaced. Steps now use ". " + short follow-on sentences. Full visible string surface re-audited: zero — or – characters remain anywhere.
3. **Duplicate CTA intent eliminated:** Removed the secondary header text link "Demander l'accès" (identical intent to the two primary pill CTAs). Header is now logo-only on the right — minimal and clean.
4. **Evidence accuracy:** This pack reflects the actual corrected source. Full build verification still deferred per prior user direction, but static re-check confirms clean module.

## Brief / Objective
Unchanged from evidence-loop-0 (new brief standalone /early-access landing for the private club, X + sponsor, French "Demander l'accès", Signal/XChat restraint, brief, existing /rejoindre CTA path).

## Files Changed
Still only `src/app/early-access/page.tsx` (the corrected version of the single file added in loop 0).

## CTA Destination
Unchanged: `/rejoindre` (with ref passthrough). Selection rationale identical and still valid.

## Visual / Layout Description (Updated)
- Header: Logo left, nothing (or very minimal) right. Even quieter.
- Hero + all other sections: Identical structure and copy to loop 0 except the 4 admission steps now read without any dashes.
- All other claims (tokens, CTA pill provenance, first-viewport fit, mobile single-column, no motion, French, no AI-tells) remain true and strengthened by the fixes.
- No new visual elements introduced.

## Build / Lint / Typecheck / Visual Verification
**Still deferred** (user "do not run it" on terminal at verification time). 

Static re-audit post-fix:
- Module parses cleanly (no stray JSX).
- Zero dash characters in rendered text.
- Single primary CTA intent only.
- All prior static checks still hold.
- When terminal/MCP allowed: run build + dev + desktop/mobile screenshots via chrome-devtools + full evidence refresh.

## Files / Evidence for This Round
- Current full source of the corrected src/app/early-access/page.tsx
- This evidence pack (loop-1)
- iterations.md (full failure + fix log)
- discovery.md + plan.md
- Protocol + the three skill rubrics (as before)

**Explicit note to reviewers:** The candidate you are scoring is the post-fix version. Previous loop-0 defects (duplicate code, em-dashes, duplicate intent) have been excised. Score the current state. Be harsh on any remaining issues.

**Ready for independent scoring round 1.**
