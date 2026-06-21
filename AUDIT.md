# Attendance QR — Feature Backlog

> **What's been done:** Major security/architecture overhaul on 2026-06-20 (see CONTEXT.md for decisions). Auth tokens, race-condition-proof check-ins, atomic rota uploads, batched dashboard queries, public endpoint lockdown. Extensive UI polish: design system, shared components, mobile-responsive admin, day-by-day navigation, human-readable timestamps, audit log UX.
>
> **13 of 14 original backlog items completed. 1 remains (#12 PWA). Plus 3 newly discovered items (#15–#17), 2 of which are already resolved.**

## Backlog (ordered by impact)

### ~~1. Late/early flagging on admin dashboard~~
**Done.** `RosterSection.tsx` shows ⚠ Late / ⚠ Early badges; `AttendanceSummary.tsx` shows summary counts. Build healthy.

### ~~2. Staff personal check-in history~~
**Done.** New `/history` route (`src/routes/history.tsx`) with `getStaffHistory` server function. Token-gated. Shows date, shift, in/out times, hours. Build healthy.

### ~~3. Weekly hour rollup for admin~~
**Done.** `WeeklyRollupSection.tsx` with Mon-Sun pivot table, `adminWeeklyRollup` server function. Wired into admin nav as "Hours". Build healthy.

### ~~4. Replace `confirm()` with proper confirmation dialogs~~
**Done.** `ConfirmDialog.tsx` component with danger/warning variants, modal overlay. All 3 `window.confirm()` calls in admin replaced. Build healthy.

### ~~5. Shift validation warnings on rota upload~~
**Done.** `uploadRota` returns `unparseableShifts` count; admin sees "⚠ X had unparseable shift times" warning. Build healthy.

### ~~6. `getText` missing `cell.v` fallback in XLSX parser~~
**Done.** `rotaParser.ts` `getText()` now handles formula-result cells with `{v: "value"}` correctly. Build healthy.

### ~~7. Widen rota parser role detection~~
**Done.** 16 new NHS roles added to `looksLikeTier` regex: Physiotherapists, Pharmacists, Radiographers, Paramedics, OTs, SALTs, Midwives, Porters, Domestics, Catering, Security, Phlebotomists, Healthcare Scientists, Physician Associates, Anaesthetists, Surgeons, Psychologists, Social Workers. Build healthy.

### ~~8. Extract shared `withLoading` hook~~
**Done.** `src/hooks/useLoading.ts` created with `useLoading()` hook. `admin.tsx` now uses the hook instead of inline state/function. Build healthy.

### ~~9. Move `addDays` / `parseShiftTime` to `dateTime.ts`~~
**Done.** Completed alongside item 1. Both utilities now in `src/utils/dateTime.ts`. Build healthy.

### ~~10. Rate limiting on check-in/out endpoints~~
**Done (2026-06-21).** In-memory rate limiter added to `checkIn`, `checkOut`, `undoLastAction` in `src/utils/sessions.functions.ts`. 3-second window per entry+action key. Per-isolate best-effort; Cloudflare WAF rules recommended for production.

### ~~11. Single edit form in SessionSection~~
**Done.** `SessionEditForm.tsx` extracted with shared props, used in both desktop table and mobile card views in `SessionSection.tsx`. Build healthy.

### ~~12. PWA / offline resilience~~ ✅ FIXED (2026-06-21)
**What:** Hospital WiFi is unreliable. A service worker with a basic offline fallback would improve reliability for staff check-in.
**Done:** `public/manifest.json` customized with Attendance QR branding; `public/sw.js` with cache-first for static assets + network-first for navigation with offline fallback page; service worker registration added to `__root.tsx`.

### ~~13. Audit log pruning~~
**Done (2026-06-21).** `adminPruneAuditLog` server function added to `src/utils/sessions.functions.ts`. Deletes audit entries older than configurable `retentionDays` (default 90). Admin-only. Logs pruning event to audit log itself.

### ~~14. Proper CSV library~~
**Done (2026-06-21).** Replaced naive `replace(/"/g, '""')` escaping with `papaparse` (`Papa.unparse`) in `src/routes/api/export[.]csv.ts`. Handles commas, newlines, and quotes in field values correctly.

---

## Newly discovered (2026-06-21 review)

### ~~15. CRITICAL: `requireAdmin` auth bypass~~ ✅ FIXED
**What:** `requireAdmin()` in `src/utils/auth.ts` never threw when auth failed — it silently returned `undefined`. Every admin endpoint was effectively unauthenticated. Fixed by adding `throw new Error('Unauthorized: invalid or expired admin credentials')` at the fall-through path.
**Where:** `src/utils/auth.ts:99`.

### ~~16. Stale AGENTS.md project structure~~
**Done (2026-06-21).** Updated AGENTS.md with current project structure including all new routes, components, hooks, utils, and styles. Removed obsolete "Next steps" section.

### ~~17. Cron job failing / stale prompt~~ ✅ FIXED
**Done (2026-06-21).** Cron job `cd2592bf56f1` rewritten with self-upgrading two-phase prompt (discovery + implementation via GitHub issues/PRs). GitHub repo `nuancedtire/attendance-qr-cf` created with 6 control labels. ADR-006 added to `docs/adr/`. CONTEXT.md updated with label taxonomy.

---

## For the cron agent

The consolidated cron (`attendance-qr-consolidated`, every 3h) is now a self-upgrading two-phase agent. See the cron prompt and `CONTEXT.md` → ADR-006 for full architecture. Key rules:

1. **PHASE A — Discovery:** Scan for doc-code drift, dead code, duplication, error handling, accessibility, security, performance, DX issues. File as GitHub issues with `needs-triage` label.
2. **PHASE B — Implement:** Pick oldest `auto-fix` issue → create branch `agent/issue-{N}-{slug}` → implement → build check → open PR. Never push to main.
3. **Labels as control surface:** `needs-triage` → human adds `auto-fix` → agent sets `in-progress` → PR opened → `ready-to-merge`. `wont-fix` = rejected. `question` = needs clarification.
4. **If nothing to do:** `[SILENT]` — no delivery.
5. If item needs DB change: update `src/db/schema.ts` AND `migrations/0001_init.sql`.
6. Append to `POLISH_LOG.md` with date, issue #, what changed, build status.
