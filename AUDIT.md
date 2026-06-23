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
**Done (2026-06-21).** Cron job `cd2592bf56f1` rewritten with self-upgrading two-phase prompt (discovery + implementation via GitHub issues/PRs). GitHub repo `nuancedtire/inout` created with 6 control labels. ADR-006 added to `docs/adr/`. CONTEXT.md updated with label taxonomy.

---

## For the cron agent

The consolidated cron (`inout-qr-consolidated`, every 3h) is now a self-upgrading two-phase agent. See the cron prompt and `CONTEXT.md` → ADR-006 for full architecture. Key rules:

1. **PHASE A — Discovery:** Scan for doc-code drift, dead code, duplication, error handling, accessibility, security, performance, DX issues. File as GitHub issues with `needs-triage` label.
2. **PHASE B — Implement:** Pick oldest `auto-fix` issue → create branch `agent/issue-{N}-{slug}` → implement → build check → open PR. Never push to main.
3. **Labels as control surface:** `needs-triage` → human adds `auto-fix` → agent sets `in-progress` → PR opened → `ready-to-merge`. `wont-fix` = rejected. `question` = needs clarification.
4. **If nothing to do:** `[SILENT]` — no delivery.
5. If item needs DB change: update `src/db/schema.ts` AND `migrations/0001_init.sql`.
6. Append to `POLISH_LOG.md` with date, issue #, what changed, build status.

---

## 2026-06-21 — Phase A discovery (cron run)

All 17 original backlog items verified as genuinely done against the codebase.

**New issues discovered and filed as GitHub issues:**

| # | Category | Title | Labels |
|---|---|---|---|
| #1 | doc-code drift | about.tsx still has TanStack scaffold starter content | needs-triage, auto-fix |
| #2 | doc-code drift | Client-side CSV export uses naive escaping (incomplete fix for AUDIT.md #14) | needs-triage, auto-fix |
| #3 | doc-code drift | __root.tsx NotFoundPage uses hardcoded Tailwind classes instead of design tokens | needs-triage, auto-fix |
| #4 | dead code | Dead components (Header, Footer, ThemeToggle) use non-existent CSS variables and are never rendered | needs-triage, auto-fix |
| #5 | dead code | getRecentAudit and individual admin query endpoints are unused dead code | needs-triage, auto-fix |
| #6 | error handling | Missing .catch() on staff-facing fetch calls (getStaffHistory, getStatus) | needs-triage, auto-fix |
| #7 | accessibility | Missing form labels on admin inputs (PIN, date picker, manual entry fields) | needs-triage |
| #8 | accessibility | Missing ARIA roles on modal dialogs and close buttons | needs-triage |
| #9 | accessibility | SlideButton component lacks keyboard and ARIA support | needs-triage |
| #10 | security | getStatus endpoint has no rate limiting | needs-triage |
| #11 | performance | Missing index on audit_log.created_at for pruning and sorting | needs-triage |

Items #1–#6 are labeled `auto-fix` (clear-cut, well-scoped). Items #7–#11 are `needs-triage` only — human must add `auto-fix` to authorize.

---

## 2026-06-21 — Phase A+B (cron run 2)

**Phase A — Verification:**
- #1: CLOSED (fixed by commit on main — about.tsx now has real content)
- #2–#11: All valid. Human added `auto-fix` to #7–#11.

**New issues discovered:**
- #12: (none — issue numbering skips to #13)
- #13: Doc-code drift — AGENTS.md lists non-existent AddStaffSection/UploadRotaSection. Filed `needs-triage,auto-fix`.
- #14: Dead CSS — ~100 lines of unused slide animation classes in styles.css. Filed `needs-triage,auto-fix`.

**Phase B — Implementation (3 PRs):**

| PR | Issues | Branch | Title |
|---|---|---|---|
| #15 | #4, #5, #13, #14 | `agent/issue-group-4-dead-code-cleanup` | Remove dead code and fix docs |
| #16 | #2, #3, #10, #11 | `agent/issue-group-2-client-fixes` | Client-side fixes + infra hardening |
| #17 | #6, #7, #8, #9 | `agent/issue-group-6-error-handling-accessibility` | Error handling + accessibility |

All 3 PRs built successfully. #1 already resolved by human merge.

---

## 2026-06-22 — Phase A discovery (cron run)

All previous 11 issues (#1–#11) verified as `ready-to-merge` (PRs opened, awaiting human merge). 31 total issues in `ready-to-merge` state from prior runs.

**New issues discovered and filed as GitHub issues:**

| # | Category | Title | Labels |
|---|---|---|---|
| #55 | doc-code drift | manifest.json theme_color and name are outdated pre-redesign values | needs-triage, auto-fix |
| #56 | duplication | Hardcoded box-shadow string duplicated across 7 files instead of using design token | needs-triage, auto-fix |
| #57 | design consistency | DailySummary.tsx "Late arrivals" uses old blue #2563eb instead of warning tone | needs-triage |

**Phase B — Implementation (1 PR):**

| PR | Issues | Branch | Title |
|---|---|---|---|
| #58 | #55, #56 | `agent/issue-group-55-design-cleanup` | Design cleanup — PWA manifest + box-shadow dedup |

Build ✅. 7 files changed across manifest.json + 6 TSX components.

---

## 2026-06-23 — Phase A+B (cron run)

**Phase A — Discovery:** Scanned all 8 categories post-refactor (Drizzle, shadcn, Airbnb redesign).

**Closed as fixed on main:**
- #59 (history.tsx design tokens) — verified using Airbnb neutral tokens on main. Closed.
- #60 (qr.tsx design tokens) — verified using design tokens on main. Closed.
- #42 (package-lock.json stale) — verified npm project, no pnpm lockfile. Closed.
- #43 (NotFoundPage colors) — verified using design tokens on main. Closed.

**Still valid (not on main, in PR branches):**
- #55 (manifest.json) — theme_color #2563eb, name "Attendance QR". In PR #58.
- #56 (box-shadow dedup) — hardcoded in Card.tsx, DailySummary.tsx, admin/index.tsx, roster.tsx, index.tsx. In PR #58.
- #57 (DailySummary #2563eb) — line 133 accentColor. In PR #58.

**New issues discovered and filed:**

| # | Category | Title | Labels |
|---|---|---|---|
| #61 | design consistency | WhoIsInSection.tsx AVATAR_PALETTES still has old blue #2563eb | needs-triage, auto-fix |
| #62 | duplication | ConfirmDialog state type duplicated inline in roster.tsx and sessions.tsx | needs-triage, auto-fix |
| #63 | bug | print-qr.tsx missing QR URL text fallback below QR image | needs-triage, auto-fix |

**Phase B — Implementation (1 PR):**

| PR | Issues | Branch | Title |
|---|---|---|---|
| #64 | #61, #62, #63 | `agent/issue-group-61-code-cleanup` | Code quality cleanup — design tokens, type dedup, QR text fallback |

Build ✅. 5 files, +16/−18 lines.

---

## 2026-06-23 — Phase A+B (cron run 2)

**Phase A — Discovery:** Scanned all 8 categories. Verified all previous AUDIT.md items.

**Items verified in PR branches (not on main):**
- #55 (manifest.json), #56 (box-shadow), #57 (DailySummary #2563eb) — in PR #58
- #61 (AVATAR_PALETTES), #62 (ConfirmDialog type), #63 (print-qr fallback) — in PR #64

**New issues discovered and filed:**

| # | Category | Title | Labels |
|---|---|---|---|
| #65 | design consistency | about.tsx uses raw neutral palette instead of semantic tokens | needs-triage, auto-fix |
| #66 | design consistency | ErrorFallback.tsx uses raw neutral palette instead of semantic tokens | needs-triage, auto-fix |
| #67 | design consistency | __root.tsx NotFoundPage and body use raw neutral palette instead of semantic tokens | needs-triage, auto-fix |

**Phase B — Implementation (1 PR):**

| PR | Issues | Branch | Title |
|---|---|---|---|
| #68 | #65, #66, #67 | `agent/issue-group-65-design-tokens-missed-pages` | Replace raw neutral palette with semantic tokens on missed pages |

3 files, +18/−18. Build ✅.

**Open PRs awaiting human merge:** #44, #45, #48, #49, #58, #64, #68
