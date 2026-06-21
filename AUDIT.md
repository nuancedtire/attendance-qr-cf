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
**What:** The cron prompt has been updated to the consolidated PART A+B workflow. The self-upgrading plan was never created but its goal (the consolidated prompt) is active.

---

## For the cron agent

The consolidated cron (`attendance-qr-consolidated`) handles both light audit and feature work in a single run. See the cron prompt for full instructions. Key rules:

1. **PART A — Audit:** Spot-check high-impact remaining items vs codebase. Prune stale ones. Add newly discovered issues.
2. **PART B — Implement:** Pick ONE remaining item. Prefer `omp -p` (one attempt, then fall back to direct). Build, log, mark done.
3. **If nothing to do:** Respond `[SILENT]`.
4. **One item per run.** No scope creep.
5. If item needs DB change: update `src/db/schema.ts` AND `migrations/0001_init.sql`.
6. Append to `POLISH_LOG.md` with date, item #, what changed, build status.
