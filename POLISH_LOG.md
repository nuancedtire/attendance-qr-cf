# UI Polish Log

## 2026-06-19

- QR page (`src/routes/qr.tsx`): replaced `window.location.href` full-page reload with TanStack `useNavigate` search-param navigation; removed `useSearch` cast by using `Route.useSearch()`; default date now uses UK `todayDate()`; added clearer QR-generation loading placeholder.
- Created shared date/time formatter (`src/utils/dateTime.ts`) with UK timezone, human-readable formats, relative time, and duration helpers.
- Replaced raw ISO timestamps across admin: Who is in, Session history, Audit log, CSV export.
- Redesigned audit log: event labels, actor badges, color-coded chips, collapsible JSON details, relative timestamps.
- Added admin PIN persistence via `localStorage` with unlock/lock UI and auto-refresh on login.
- Added loading states and auto-dismissing, closable message banners on admin and staff pages.
- Staff page now remembers last selected name and shows relative check-in time.
- Updated server-side `todayDate()` to Europe/London timezone instead of UTC.
- Seeded local D1 with 80 simulated staff and 63 sessions for UI/load testing.
- Added sticky section nav on admin page: 7-section quick-jump bar with `overflow-x-auto` for mobile.
- Added error boundaries / fallback UI (`src/components/ErrorFallback.tsx`, `src/components/EmptyState.tsx`) wired into root and all routes; added retry-capable refresh error banner on admin; added QR generation error state; replaced plain empty copy with `EmptyState` components on admin and staff pages; disabled Export CSV when roster is empty.
- Staff check-in page (`src/routes/index.tsx`): removed the unsafe `useSearch({ from: '/' }) as { token?: string }` cast by adding `validateSearch` to the route and using typed `Route.useSearch()`; `token` now defaults to `''` when absent. Build healthy.
- Split `src/routes/admin.tsx` (~757 lines) into focused route components: `AdminHeader`, `MessageBanner`, `RefreshError`, `SectionNav`, `UploadRotaSection`, `QrSection`, `AddStaffSection`, `WhoIsInSection`, `RosterSection`, `SessionSection`, `AuditLogSection`, plus shared `-hooks.ts` and `-types.ts`. Reduced `admin.tsx` to ~270 lines of orchestration logic. Preserved all behavior, loading states, inline editing, and auto-dismiss banners. Build healthy; dev server returns 200.

## 2026-06-19 (manual pass)

- **Fixed JSON parse crash**: malformed `{date:...}` audit row from an old simulation run caused `adminGetAuditLog` to throw, breaking the whole dashboard. Made `JSON.parse` defensive (`safeJsonParse`) so one bad row can't crash the admin page; fixed the bad row in local D1.
- **Added day-by-day exploration**: admin page now has a date picker with previous/next buttons and a "Today" jump. All data loads (roster, who's in, sessions) and upload/export respect the selected date.
- **Design system**: created `src/theme.css` with Tailwind v4 tokens (primary, success, warning, danger, neutral palettes; typography; radius; shadows). Updated `src/styles.css` to import it and set global focus/transition defaults.
- **Shared components**: added `Button`, `Card`, `Badge`; refactored staff page and all admin sections to use them.
- **Mobile-first admin**: roster and session tables now render as cards on small screens and tables on desktop; section nav is sticky and horizontally scrollable; stats cards summarize on-rota / checked-in / currently-in counts.
- **Icons**: added Lucide icons to headers, buttons, empty states, and action links.
- **Re-seeded simulation**: 100 staff, 80 sessions for load testing.

## 2026-06-19 (cron run)

- UI polish pass complete — no remaining items. All UI/UX items from AUDIT.md (timestamps, audit log, admin login UX, loading states, message toasts, mobile layout/navigation, form polish, empty/error states, QR page UX, admin page UX) have been addressed. Remaining audit items are security/auth/backend architecture or low-priority cleanup, which this cron job skips per instructions.

## 2026-06-19 (cron run)

- QR page (`src/routes/qr.tsx`): replaced hardcoded `gray-*` utility colors with design-system tokens (`neutral-*`, `primary-*`); added accessible `htmlFor`/`id` pairing for the date picker and consistent input focus styling; swapped the plain emoji error icon for the shared `alert` EmptyState icon; improved the QR loading placeholder to a branded skeleton with a `QrCode` icon, rounded corners, and shadow on the generated QR image. Build healthy; dev server restarted and returns 200.

## 2026-06-20 (cron run — feature expansion)

- **Item 6 — `getText` missing `cell.v` fallback** (`src/utils/rotaParser.ts:22`): Added `typeof cell === 'object' && 'v' in cell` check to `getText()`. Formula-result cells in XLSX files (which have `{v: "value"}` but no `w` property) previously fell through to `String(cell)` → `"[object Object]"`. Now they correctly return `String(cell.v).trim()`. Build healthy.

- **Item 1 — Late/early flagging on admin dashboard**: Added late check-in (>15 min after shift_start) and early check-out (>15 min before shift_end) visual flags. `RosterSection.tsx`: now accepts `viewDate` prop, computes late/early per-entry, shows `⚠ Late` / `⚠ Early` badges inline next to check-in/out times in both desktop table and mobile card views. `AttendanceSummary.tsx`: now accepts `entries` + `viewDate` props, computes and displays "Late arrivals" and "Early departures" summary boxes (5-column grid on lg screens). `admin.tsx`: passes `viewDate` and `entries` to both components. Also incidentally completed items 9 (`parseShiftTime`/`addDays` moved to `dateTime.ts`). omp was unresponsive (2 attempts, no file changes); implemented directly via Hermes tools. Build healthy.

## 2026-06-21 (cron run — feature expansion: #7 widen rota parser roles)

- **Item #7 — Widen rota parser role detection** (`src/utils/rotaParser.ts:28`): Added 16 missing NHS role categories to `looksLikeTier` regex: Physiotherapists, Pharmacists, Radiographers, Paramedics, OTs, SALTs, Midwives, Porters, Domestics, Catering, Security, Phlebotomists, Healthcare Scientists, Physician Associates, Anaesthetists, Surgeons, Psychologists, Social Workers. Each gets the optional `s?` suffix for singular/plural matching. Build healthy.

## 2026-06-21 (cron run — #12: PWA / offline resilience)

- **Item #12**: Customized `public/manifest.json` (name: "Attendance QR", short_name: "Attendance", theme_color: "#2563eb"). Created `public/sw.js` with cache-first for static assets (JS/CSS/images/fonts) and network-first for navigation/API calls; offline navigation returns a styled fallback HTML page. Added service worker registration script to `__root.tsx` RootDocument shell (gated on `'serviceWorker' in navigator`). Build healthy.
- **Audit**: Marked #17 (cron stale prompt) as ~done~ — consolidated cron prompt is active, plan file never created. No POLISH_LOG entries to prune (all within 15 days).



## 2026-06-20 (item #2 — Staff check-in history)

- **New server function `getStaffHistory`** in `sessions.functions.ts`: QR-token-gated query joining sessions → roster_entries → rotas to return all completed sessions for a staff member across all dates. Returns `{ date, shiftStart, shiftEnd, checkInAt, checkOutAt, hours }` ordered by most recent first. Hours computed via `julianday` same as `adminExportSessions`.
- **New route `/history`** (`src/routes/history.tsx`): staff-facing page showing personal check-in history. Reuses `useStaffIdentity` hook for identity persistence, `IdentityBar` + identity picker modal, `EmptyState` for no-token/no-data states. Each session card shows date, shift, in/out times, and total hours. Back link to check-in page.
- **Added "View my history →" link** on staff page (`index.tsx`), after the locum section.
- No DB schema changes needed (uses existing tables).
- Build healthy; typecheck clean (pre-existing errors only).

## 2026-06-20 — Weekly rollup (AUDIT.md #3)

- Added `getWeekStart(date)` to `dateTime.ts` — returns Monday of the week containing `date`.
- Added `adminWeeklyRollup` server function in `sessions.functions.ts` — groups completed sessions by staff+date for a given week range, returns hours via `(julianday(check_out_at) - julianday(check_in_at)) * 24`.
- Created `WeeklyRollupSection` component — pivot table with staff names as rows, Mon-Sun as columns, total column. Follows `viewDate`'s week. Loading/error/empty states.
- Wired into admin page and `SectionNav` as "Hours".

## 2026-06-20 — ConfirmDialog (AUDIT.md #4)

- Created `src/components/ConfirmDialog.tsx` — modal with overlay, centered card, AlertTriangle icon, cancel/confirm buttons. Uses `confirmVariant` (danger|warning) for icon + button styling, loading state on confirm.
- Replaced 3 `window.confirm()` calls in `admin.tsx` (`handleDeleteSession`, `handleDeleteEntry`, `handleAutoCheckout`) with `ConfirmDialog` state. Confirm calls stored async handler; dialog closes after handler resolves.
- Build healthy.

## 2026-06-20 — Shift validation warnings (AUDIT.md #5)

- `rotaParser.ts` already propagated `rawShift` on `ParsedEntry` entries — no change needed.
- `rotas.functions.ts` `uploadRota` handler: counts entries where `rawShift` is set but `shiftStart` is null (unparseable shift times), returns `unparseableShifts` in the response.
- `admin.tsx` `handleUpload`: shows warning message with count when `unparseableShifts > 0`, e.g. "Uploaded 45 staff (⚠ 3 had unparseable shift times)".
- Build healthy.

## 2026-06-21 — Extract shared withLoading hook (AUDIT.md #8)

- Created `src/hooks/useLoading.ts` with `useLoading()` hook returning `{ loading: Record<string, boolean>, withLoading }`. Uses `useCallback` for stable reference.
- Updated `src/routes/admin.tsx`: replaced inline `useState<Record<string, boolean>>` + `withLoading` function with `const { loading, withLoading } = useLoading()`.
- Removed duplicate inline implementation. All 12 `withLoading(key, fn)` call sites in admin.tsx remain unchanged.
- Build healthy.

- Already completed by prior cron run. `SessionEditForm.tsx` exists with `checkInAt`, `checkOutAt`, `onChange`, `onSave`, `onCancel`, `className`, `inputClassName` props.
- Used in both desktop table (`className="flex flex-wrap gap-2 items-center"`) and mobile cards (`className="space-y-2 mt-3" inputClassName="w-full"`) in `SessionSection.tsx`.
- Build healthy, no duplicate markup remaining.
