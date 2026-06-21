# Attendance QR — Domain Model & Architecture

## Glossary

| Term | Definition |
|---|---|
| **Rota** | A daily staff schedule. Has a date and a deterministic daily token. |
| **Roster entry** | One person on a rota. Has name, role, shift start/end. Source is "rota" (uploaded) or "manual" (ad-hoc). |
| **Session** | A check-in/check-out pair. One roster entry → at most one open session at a time (enforced by partial unique index). |
| **QR token** | A daily access token derived as `HMAC(date, QR_SEED)`. Deterministic — same every time for a given date. Encoded in the QR code URL as `/?token=...`. |
| **Session token** | A 12-hour stateless HMAC-signed token returned by `adminVerifyPin`. Used to authenticate all admin server functions. No DB storage — verified purely via signature. |
| **Audit log** | Immutable record of every state-changing action: check-in, check-out, admin edit, rota upload, ad-hoc add. |
| **Auto-checkout** | Closes any session whose roster entry's `shift_end + 60 minutes` has passed with no check-out. Admin-triggered, not automatic. |

## Architectural Decisions

### ADR-001: Stateless HMAC session tokens (no sessions table)

**Decision:** Admin authentication uses stateless HMAC-signed tokens derived from `ADMIN_PIN + QR_SEED`. 12-hour TTL. No DB.

**Rationale:** Few admins (2-3), short TTL, no cleanup burden. If a token must be revoked, rotate both secrets.

**Trade-off:** Cannot revoke individual tokens mid-session. Acceptable.

### ADR-002: Deterministic daily QR tokens

**Decision:** QR tokens are `HMAC(date, QR_SEED)`, stable for the entire day. No per-rota-upload rotation.

**Rationale:** Pre-printing for weekends/holidays. Staff trust a stable QR. Token never changes mid-day.

**Trade-off:** If `QR_SEED` leaks, all past/future tokens are compromisable. Mitigation: `QR_SEED` is server-side secret; damage limited to attendance fraud.

### ADR-003: Rota-driven staff list with mandatory check-out

**Decision:** Each day's rota is the source of truth for who should be present. Check-out is mandatory (not optional). Auto-checkout closes stale sessions at shift_end + 60min.

### ADR-004: Print-friendly admin QR page as standalone route

**Decision:** `/admin/print-qr` — standalone route, same admin auth gate as `/admin`. Has date picker. `@media print` hides chrome, maximizes QR. URL displayed below QR as text fallback.

### ADR-005: Consolidated cron-powered feature expansion via omp + ponytail

**Decision:** Single consolidated cron (`attendance-qr-consolidated`) runs every 3 hours. Each run: light audit pass (spot-check AUDIT.md vs codebase, prune/add items) + implement one backlog item. Fresh `omp -p` invocation with full project context (`AGENTS.md`, `AUDIT.md`, `POLISH_LOG.md`). Falls back to direct implementation if omp is unresponsive. One item per run, no scope creep. If backlog is empty after audit, `[SILENT]` — no delivery.

## Deployment

- **Platform:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Secrets:** `ADMIN_PIN`, `QR_SEED` via `wrangler secret put` / `.dev.vars`
