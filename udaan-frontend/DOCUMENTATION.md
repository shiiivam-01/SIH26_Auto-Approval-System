# UDAAN - Project Documentation & Architecture Specifications

This document consolidates all core project specifications, user flows, role matrices, API contracts, and architecture for the UDAAN frontend.

---



# 1. Project Requirements Document (PRD)


# Product Requirements Document (PRD)

## UDAAN — Unified Digital Approval & Assistance Network
**SIH Problem Statement:** PS-130 — Efficiency in Streamlining Industrial Approvals, Compliance Processes, and Access to Government Support Services

**Version:** 1.0
**Status:** Draft for SIH submission

---

## 1. Executive Summary

UDAAN is an AI-powered, unified platform that dynamically determines the exact set of approvals, licences, and NOCs an industrial unit needs — based on sector, location, project scale, and lifecycle stage — then guides the applicant through documentation, pre-validates submissions, coordinates parallel departmental workflows, schedules joint inspections, and surfaces applicable government incentive schemes, all from a single dashboard.

Unlike static single-window portals, UDAAN is built around a **Regulatory Knowledge Graph** and a **Risk-Based Scrutiny Engine**, so the system adapts per-applicant instead of relying on hardcoded checklists — making it scalable across states, sectors, and future regulatory changes.

---

## 2. Problem Statement (Summary)

- Entrepreneurs must navigate multiple approvals across different departments, with requirements varying by sector, location, size, and stage.
- Applicants struggle to identify applicable approvals, meet documentation requirements, track timelines, and access incentives.
- Departments face incomplete applications, duplicate scrutiny, manual coordination, poor delay visibility, and inconsistent compliance monitoring.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target (illustrative) |
|---|---|---|
| Reduce approval time | Avg. days from application to final approval | ↓ 40% vs baseline |
| Reduce incomplete applications | % applications rejected/returned for missing docs | ↓ 60% |
| Improve transparency | % applicants with real-time status visibility | 100% |
| Reduce compliance cost | Avg. no. of physical department visits per unit | ↓ 70% |
| Improve scheme utilization | % eligible units availing at least 1 incentive scheme | ↑ 50% |
| Reduce inspection burden | Avg. no. of separate inspections per unit per year | ↓ via joint inspection bundling |

---

## 4. User Personas

1. **Entrepreneur / Industrial Unit Applicant** — needs clarity, guidance, single point of tracking.
2. **Department Officer / Scrutiny Officer** — needs complete applications, reduced duplication, clear queue prioritization.
3. **Inspector** — needs consolidated inspection schedules and checklists.
4. **Nodal Agency / Single Window Admin** — needs cross-department visibility, bottleneck analytics, escalation control.
5. **Policy Maker / Department Head** — needs dashboards on delays, scheme uptake, and process health.

---

## 5. Core Modules

### 5.1 Regulatory Knowledge Engine (Dynamic Checklist Generator)
- Graph-based rule engine mapping: Sector (NIC code) × Location (state/district/zone) × Project scale (investment, land, power load, employee count) × Stage (pre-establishment, construction, operational, renewal) → required approvals.
- Rules maintained centrally by department admins via a no-code rule builder (so it scales without engineering effort per new regulation).
- Outputs a personalized, sequenced checklist with document requirements per approval.

### 5.2 Applicant Journey & Data Reuse Vault
- Guided application wizard with contextual help per document.
- One-time KYC/data capture: Udyam, GSTIN, PAN, land title/lease, DigiLocker-integrated document fetch.
- "Verified Once" data vault — reused automatically across every department's application, eliminating repeat submission.
- Auto-fill of department-specific forms from vault data.

### 5.3 Pre-Validation & Auto-Scrutiny
- Rule-based + ML document validation (format checks, expiry checks, cross-field consistency, missing-field detection) before submission — reduces "incomplete application" rejections at source.
- OCR-based extraction and validation for scanned documents.

### 5.4 Risk-Based Scrutiny & Approval Routing
- Risk score per applicant based on: sector hazard classification, self-certification eligibility, compliance/violation history, project scale.
- Routing: Green (auto-approve/self-certify), Yellow (desk scrutiny), Red (full scrutiny + inspection).

### 5.5 Parallel Workflow Orchestration
- Workflow engine triggers dependent and independent departmental processes in parallel (not sequentially) wherever legally permissible.
- Dependency mapping so applicants/departments see what's blocking what.

### 5.6 Common Inspection Planner
- Detects overlapping inspection requirements across departments (Fire, Pollution, Factories, Labour, etc.) for the same unit/location.
- Auto-schedules a bundled joint inspection with a shared checklist, reducing visits and coordination overhead.

### 5.7 SLA Tracking, Alerts & Escalation
- Statutory SLA clock per approval type; auto-alerts to officers nearing breach.
- Auto-escalation matrix to next authority on SLA breach.
- Applicant-facing real-time status + notification (SMS/email/app).

### 5.8 Grievance Redressal
- In-app grievance ticketing linked to specific application/approval stage.
- Time-bound escalation hierarchy with resolution tracking.

### 5.9 Incentive & Scheme Matching Engine
- Matches applicant profile (sector, location, investment, employment generated) against a scheme database (state + central).
- Proactively notifies eligible schemes/subsidies and guides application.

### 5.10 Unified Analytics Dashboard
- For admins/policy makers: bottleneck heatmaps by department/approval type, delay trend analysis, predictive SLA-breach flags (ML-based), scheme uptake analytics.
- For applicants: single dashboard of all applications, approvals, renewals due, and incentives availed.

---

## 6. Functional Requirements (Sample)

| ID | Requirement |
|---|---|
| FR-1 | System shall generate a personalized approval checklist based on sector, location, scale, and stage inputs. |
| FR-2 | System shall allow one-time document upload reused across all applicable departmental applications. |
| FR-3 | System shall validate submitted documents against defined rules before allowing submission. |
| FR-4 | System shall assign a risk score and route applications accordingly. |
| FR-5 | System shall detect and bundle overlapping inspection requirements across departments. |
| FR-6 | System shall track SLA timelines per approval and trigger alerts/escalations on breach risk. |
| FR-7 | System shall recommend applicable incentive schemes based on applicant profile. |
| FR-8 | System shall provide role-based dashboards for applicants, officers, inspectors, and admins. |
| FR-9 | System shall support grievance logging linked to specific application stages with escalation tracking. |
| FR-10 | System shall provide analytics on delays, bottlenecks, and scheme utilization. |

## 7. Non-Functional Requirements

- **Security:** Role-based access control, encrypted data at rest/in transit, audit logs for every scrutiny action.
- **Interoperability:** API integration with DigiLocker, Udyam, GSTIN, state land record systems, PAN verification.
- **Scalability:** Rule engine must support onboarding new states/sectors without code changes.
- **Availability:** 99.5%+ uptime target for citizen-facing portal.
- **Accessibility:** Multi-lingual UI, mobile-responsive, WCAG-compliant for accessibility.
- **Auditability:** Immutable log of all approvals/rejections for statutory compliance (e.g., append-only audit trail).

---

## 8. Suggested Tech Stack

- **Frontend:** React.js / Next.js (citizen portal + admin dashboard), React Native or PWA for mobile.
- **Backend:** Node.js (NestJS) or Python (FastAPI/Django) microservices.
- **Rule/Knowledge Engine:** Graph DB (Neo4j) or a rules engine (Drools) for the Regulatory Knowledge Graph.
- **ML components:** Python (scikit-learn/XGBoost for risk scoring & delay prediction), OCR via Tesseract/Cloud Vision for document validation.
- **Database:** PostgreSQL (transactional), Neo4j (regulatory graph), Redis (caching/queues).
- **Workflow orchestration:** Camunda / Temporal for parallel departmental workflow management.
- **Integrations:** DigiLocker API, Udyam Registration API, GSTIN verification API, state land record APIs, SMS/Email gateway.
- **Infra:** Cloud-hosted (MeghRaj/NIC cloud for govt deployment feasibility), Docker/Kubernetes.

---

## 9. High-Level User Flow

1. Applicant registers → enters sector, location, project scale, stage.
2. System generates dynamic checklist + estimated timeline.
3. Applicant uploads documents once → auto-validated → auto-filled into relevant department forms.
4. Risk engine scores application → routes to auto-approval / desk scrutiny / inspection.
5. Parallel workflows trigger across relevant departments simultaneously.
6. If inspections needed, common inspection scheduler bundles them.
7. SLA tracker monitors each stage; alerts/escalates on delay risk.
8. Applicant receives approvals on dashboard; system recommends matching incentive schemes.
9. Renewals tracked automatically with pre-expiry reminders.
10. Any grievance can be raised against a specific stage, with tracked escalation.

---

## 10. Hackathon MVP Scope (What to actually build in the time available)

Given hackathon time constraints, build a working slice, not the whole system:

1. Dynamic checklist generator (pick 2–3 sectors × 1 state, rule engine working end-to-end).
2. One-time document vault with reuse across 2 mock departments.
3. Basic risk-scoring logic (rule-based is fine, ML optional stretch goal).
4. SLA tracker with mock timeline + alert simulation.
5. Applicant dashboard + one admin analytics view (bottleneck chart).
6. Scheme-matching engine with a small sample scheme database (5–10 schemes).

Stretch goals (mention in pitch as roadmap, don't over-promise as built): common inspection scheduler, ML-based delay prediction, DigiLocker live integration.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Integration with real govt APIs (DigiLocker, Udyam) may be restricted/unavailable during hackathon | Use sandbox/mock APIs; clearly label as simulated in demo |
| Rule engine complexity across many sectors/states | Scope MVP to 2–3 sectors and 1 state; show extensibility |
| Statutory safeguards vs speed trade-off (risk of overpromising "auto-approval") | Keep human-in-the-loop for all Red/Yellow risk cases; auto-approval only for pre-defined low-risk self-certification categories already permitted by policy |
| Data privacy of sensitive business data in vault | Encryption, access logs, consent-based sharing model |

---

## 12. Differentiation Summary (for pitch deck)

| Typical Single-Window Portal | UDAAN |
|---|---|
| Static checklist per sector | Dynamic graph-based checklist (sector × location × scale × stage) |
| Manual document re-submission per dept | One-time verified data vault, reused everywhere |
| Fixed inspection schedule | Risk-based routing + common inspection bundling |
| Reactive delay reporting | Predictive delay/SLA-breach flagging |
| Passive scheme listing | Proactive, profile-matched scheme recommendation |



---



# 2. User Roles & Permission Matrix


# UDAAN — Frontend Role / Permission Matrix

> Permissions below are extracted **from backend code** (`routes/*.js` `authorize(...)` calls +
> controller-level checks + tests). They describe what the **backend enforces**.
> Frontend route guards are **UX only** — the backend remains the security boundary.

Legend: ✅ allowed · ❌ denied by backend · ⚠️ allowed by backend but flagged as a gap/quirk.

## 1. Authentication & Account

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Register account | ✅ | ❌ (always created as applicant) | ❌ | ❌ | `role` in body is ignored; privileged roles come from seed only |
| Login | ✅ | ✅ | ✅ | ✅ | 401 on bad credentials |
| JWT session (7d, no refresh) | ✅ | ✅ | ✅ | ✅ | 401 ⇒ clear session |
| View own profile (`/applicant/profile/me`) | ✅ | ✅ | ✅ | ✅ | Returns 404 if none (only applicants ever have one) |
| Create applicant profile | ✅ | ⚠️ | ⚠️ | ⚠️ | Route is `authenticate` only — no role restriction (backend quirk) |

## 2. Checklist & Schemes

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| View dynamic checklist | ✅ own only | ✅ any | ✅ any | ✅ any | Applicant → 403 on other profiles |
| View matched schemes | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **No ownership/role check** — any authenticated user for any applicantId (gap) |

## 3. Document Vault

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Upload document | ✅ own only | ✅ any | ✅ any | ✅ any | JSON + `file_url` (no multipart); applicant's `verified_status` is **ignored** → always `pending` |
| View vault | ✅ own only | ✅ any | ✅ any | ✅ any | |
| Set verified_status (`pending`/`verified`/`rejected` at upload) | ❌ | ✅ | ❌ | ✅ | Officer/admin only |
| Verify/reject document (`PATCH /vault/:id/verify`) | ❌ | ✅ | ❌ | ✅ | `authorize('officer','admin')` |
| Self-verify own documents | ❌ | — | — | — | Impossible by design (security requirement) |

## 4. Applications

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Submit application bundle | ✅ own only | ✅ any | ✅ any | ✅ any | In practice officers/inspectors have no profile to submit for |
| Track applications (SLA countdown) | ✅ own only | ✅ any | ✅ any | ✅ any | `GET /applications/:applicantId` |
| Decide (`approved`/`rejected`) | ❌ | ✅ own department only | ❌ | ✅ all | Fail-closed: null/mismatched dept ⇒ 403 |
| Browse a *queue* of all applications | ❌ | ❌ **no endpoint** | ❌ | ❌ **no endpoint** | Gap: officers/admins must know an `applicantId` (see Gap Report) |

## 5. Inspections

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Trigger bundle inspection | ✅ own only | ❌ (403 at route) | ❌ (403 at route) | ✅ any | Applicant initiates the joint inspection |
| View inspections | ✅ own only | ❌ (403 at route) | ✅ **assigned-to-them only**, and only if ≥1 exists (else 403) | ✅ any | `GET /inspections/:applicantId` |
| Assign inspector | ❌ | ❌ | ❌ | ✅ | Target must have role `inspector` |
| Complete inspection (`pass`/`fail`/`conditional`) | ❌ | ❌ | ✅ assignee only | ✅ bypass | Notes required for `fail`/`conditional`; 409 on cancelled/completed |

## 6. Grievances

| Capability | Applicant | Officer | Inspector | Admin | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Create grievance | ✅ | ❌ | ❌ | ❌ | Controller-enforced applicant-only |
| View own grievances (`/mine`) | ✅ | ❌ | ❌ | ❌ | |
| View assigned queue (`/assigned`) | ❌ | ✅ dept-scoped | ❌ | ✅ + filters | Officer sees own + unassigned in dept (level < 2) |
| Classify (set department) | ❌ | ❌ | ❌ | ✅ | Not for application-linked grievances |
| Claim / assign | ❌ | ✅ self, dept match, level < 2 | ❌ | ✅ any officer or null | |
| Update status | ✅ only `closed`, only from `resolved` | ✅ transitions (own, dept match) | ❌ | ✅ transitions | Staff cannot close; optimistic `state_version` |
| Manual escalate | ✅ | ❌ | ❌ | ❌ | Idempotency-Key header; cooldown ⇒ 409 |

## 7. Notifications

| Capability | Applicant | Officer | Inspector | Admin |
|---|:---:|:---:|:---:|:---:|
| List own notifications (paged) | ✅ | ✅ | ✅ | ✅ |
| Mark one / all read | ✅ | ✅ | ✅ | ✅ |

## 8. Analytics (officer strictly department-scoped)

| Capability | Applicant | Officer | Inspector | Admin |
|---|:---:|:---:|:---:|:---:|
| Overview / trends / SLA / departments / inspections / grievances analytics | ❌ | ✅ own department only (403 if no/unknown dept) | ❌ | ✅ global + `?department=` filter |
| Trigger SLA check (`run-sla-check`) | ❌ | ✅ | ❌ | ✅ |

## 9. Frontend route-guard plan (UX only — mirrors backend, never replaces it)

| Route prefix | Guard | Redirect on violation |
|---|---|---|
| `/login`, `/register` | public (redirect to `/{role}` if session exists) | — |
| `/applicant/**` | role ∈ {applicant} | `/403` |
| `/officer/**` | role ∈ {officer, admin}* | `/403` |
| `/inspector/**` | role ∈ {inspector, admin}* | `/403` |
| `/admin/**` | role ∈ {admin} | `/403` |

\* e.g. admin may view officer/inspector pages where the underlying APIs allow admin access
(application decide, inspection view/complete). Route guarding must never be wider than what
the backend authorizes for that specific endpoint; per-feature buttons still respect the matrix above.




---



# 3. Status Catalog & State Machine


# UDAAN — Frontend Status Catalog

> Every status/enum extracted from the backend models, controllers and seed data.
> **Never rename or translate these values in API calls.** Mapping below is for
> presentation only (badges, labels, colours + icons — never colour alone).

## 1. User

| Source | Value | Frontend label | Badge style / icon |
|---|---|---|---|
| `User.role` ENUM | `applicant` | Applicant | Neutral (User icon) |
| | `officer` | Officer | Blue (ShieldCheck) |
| | `inspector` | Inspector | Purple (ClipboardCheck) |
| | `admin` | Admin | Slate (KeyRound) |
| `User.department` | `null` or string | — | Show "No department" chip when null (affects officer permissions!) |

## 2. Application status (`Application.status` ENUM)

| Backend value | Frontend label | Meaning (from code/tests) | Badge | Terminal? |
|---|---|---|---|---|
| `submitted` | Submitted | Initial (only as DB default) | Grey | No |
| `auto_approved` | Auto-Approved | Low risk, self-certification path | Green (Zap) | **Yes (final)** |
| `pending_review` | Under Officer Review | Medium risk — desk scrutiny / or `conditional` inspection result | Amber (Eye) | No |
| `pending_inspection` | Pending Inspection | High risk — awaiting joint inspection | Indigo (Search) | No |
| `approved` | Approved | Officer decision or inspection `pass` | Green (CheckCircle) | **Yes (final)** |
| `rejected` | Rejected | Officer decision or inspection `fail` | Red (XCircle) | **Yes (final)** |

Notes:
- Resubmission rule: `approved`, `auto_approved`, `rejected` are **final**; all others are re-submittable over via `allow_resubmission: true`.
- Officer `decide` accepts `approved`/`rejected` for **any** non-final status (no backend status-transition guard beyond that).

## 3. Risk level (`Application.risk_level` / `ApprovalRule.hazard_level` ENUM)

| Backend value | Frontend label | Badge |
|---|---|---|
| `low` | Low | Green (Shield) |
| `medium` | Medium | Amber (AlertTriangle) |
| `high` | High | Red (AlertOctagon) |

`hazard_level` (rule) shares values/labels; `requires_inspection` → "Inspection required" chip.

## 4. SLA (computed by backend, not an enum)

| Field | Presentation |
|---|---|
| `days_left` (int, from `GET /applications/:applicantId`) | "N days left" / "Due today" (0) |
| `sla_breached: true` | Red "SLA Breached" badge (Clock icon) |
| `sla_deadline` | ISO date — format for display only |

Notification levels (`Application.last_notified_level` ENUM, surfaced in analytics): `none` / `warning` (≤48h) / `breach`.

## 5. Document vault (`DocumentVault.verified_status` ENUM)

| Backend value | Frontend label | Badge |
|---|---|---|
| `pending` | Pending Verification | Amber (Hourglass) |
| `verified` | Verified | Green (BadgeCheck) |
| `rejected` | Rejected | Red (FileX) |

Derived (frontend-computed from `expiry_date` — display only, backend re-validates at submit):
- Expired: `expiry_date < now` → Red "Expired" chip.
- Expiring soon (e.g. ≤30 days) → Amber "Expiring" chip.
- Only `verified` + non-expired latest doc counts toward submission completeness (backend rule — render it, don't recompute for decisions).

## 6. Inspection (`Inspection.status` / `Inspection.result` ENUMs)

| Backend value | Frontend label | Badge |
|---|---|---|
| `scheduled` (status) | Scheduled | Indigo (CalendarClock) |
| `completed` (status) | Completed | Green (CheckCircle) |
| `cancelled` (status) | Cancelled | Red (Ban) — terminal; blocks assign & complete (409) |
| `pass` (result) | Passed | Green |
| `fail` (result) | Failed | Red |
| `conditional` (result) | Conditional | Amber — cascades applications to `pending_review` |
| `null` (result) | Awaiting outcome | Grey — any scheduled/completed-without-result state |

## 7. Grievance (`Grievance.status` / `Grievance.priority` ENUMs)

| Backend value | Frontend label | Badge | Allowed transitions (authoritative) |
|---|---|---|---|
| `open` | Open | Slate | staff → `in_progress` / `resolved`; applicant → `closed` (after resolve) |
| `in_progress` | In Progress | Blue | staff → `resolved` |
| `escalated` | Escalated (Level N) | Orange (ArrowUp) | staff → `in_progress` / `resolved` |
| `resolved` | Resolved | Green | applicant → `closed` |
| `closed` | Closed | Grey | terminal |

Priority: `low` / `medium` / `high` → Grey / Amber / Red chips.
Escalation level 0–3 shown as "Level N"; level ≥ 2 unassigned from officer.

## 8. Profile stage (`ApplicantProfile.stage` / `ApprovalRule.stage` ENUM)

| Backend value | Frontend label |
|---|---|
| `pre_establishment` | Pre-Establishment |
| `construction` | Construction |
| `operational` | Operational |
| `renewal` | Renewal |
| `all` (rules only) | Any Stage |

## 9. Sectors / Departments / States (free-form strings — from seed)

- Sectors in seed: `food_processing`, `textile`, `all`.
- Departments in seed: `MSME Department`, `Labour Department`, `State Pollution Control Board`, `Fire Department`, `Food Safety Department` (+ any added via rules; analytics department filter validates against `ApprovalRule.department`).
- State in seed: `Madhya Pradesh` (rules use it or `all`).
- Frontend select options for profile creation should mirror seed values; treat as data, not enums.

## 10. Notification types (`Notification.type` ENUM)

| Backend value | Frontend label / icon |
|---|---|
| `sla_warning` | SLA Warning (Clock) |
| `sla_breach` | SLA Breached (AlarmClock) |
| `grievance_update` | Grievance Update (MessageSquare) |
| `application_update` | Application Update (FileText) |
| `scheme_recommendation` | Scheme Recommendation (Gift) |

## 11. Inspection results → application status mapping (backend-authoritative, for tooltips only)

| `result` | Linked applications become |
|---|---|
| `pass` | `approved` |
| `fail` | `rejected` |
| `conditional` | `pending_review` |




---



# 4. User Journey & Step-by-Step Flows


# UDAAN — Frontend User Flows

> Every step below maps to a **real, verified backend endpoint**. No fabricated actions,
> no frontend-computed authoritative state. Where the backend cannot support a step it is
> marked ⛔ and listed in the Gap Report of the analysis report.

## 1. Applicant

### 1.1 Registration → Profile
1. `/register` — `POST /api/auth/register` `{name, email, password}` → session stored, role fixed `applicant`. (No role selector.)
2. Redirect `/applicant` → dashboard checks `GET /api/applicant/profile/me`.
3. 404 ⇒ onboarding wizard: `POST /api/applicant/profile` (business_name, sector, state, district?, nic_code?, investment_amount, employee_count, stage).
   - Frontend guard: never POST profile if one exists (backend has no duplicate guard → would create duplicates).
   - ⛔ Profile **editing** has no backend endpoint — display read-only after creation (report gap).

### 1.2 Dashboard (profile id = `applicantId` for all subsequent calls)
- Applications: `GET /api/applications/:applicantId` → status cards w/ `days_left`, `sla_breached`.
- Requirements: `GET /api/checklist/:applicantId` → approvals + required documents.
- Vault: `GET /api/vault/:applicantId` → documents w/ `verified_status`, expiry chips.
- Schemes: `GET /api/schemes/match/:applicantId`.
- Notifications: `GET /api/notifications` (polling).

### 1.3 Requirements → Documents → Completeness
1. Checklist view: for each approval show `required_documents`.
2. Upload dialog: file picker → `data:` URL → `POST /api/vault/upload` `{applicant_id, document_type, file_url, expiry_date?}`.
   - UI states: uploading (disabled), 201 success, 400 (invalid URL / expired date) inline errors.
   - Typeahead options = union of checklist `required_documents` names (free text still allowed — backend accepts any non-empty string).
3. Completeness readiness is **derived from backend data** for *display* (all required types present & `verified` & non-expired), but the authoritative check is the submit call itself.

### 1.4 Submit
1. `POST /api/applications/submit` `{applicant_id}` — button disabled in-flight; no double clicks.
2. 201 → toast "N applications created" (some may be `auto_approved` immediately).
3. 200 → idempotent outcome: "Applications already exist — nothing new created" + list `already_existed` entries.
4. 400 `missing_by_approval` → per-approval "missing documents" panel linking to upload.
5. Optional "resubmit finalized approvals" action → repeat with `allow_resubmission: true` + confirmation dialog.

### 1.5 Track (timeline, backend-derived only)
- Created/Submitted → Documents uploaded → Submitted (201 event) → per-status: `pending_review` (Officer Review), `pending_inspection` (Inspection), final `approved`/`auto_approved`/`rejected`.
- SLA countdown per approval from `days_left` / `sla_breached`.

### 1.6 Inspection (when `pending_inspection`)
1. "Schedule joint inspection" → `POST /api/inspections/bundle` `{applicant_id, scheduled_date?}`.
2. 201 "New inspection created…" / 200 with `already_existed: true` (+`new_links_added`) → show scheduled date & linked applications via `GET /api/inspections/:applicantId`.
3. Once admin assigns: card shows assigned inspector; after completion shows `result` + notes (read-only for applicant).

### 1.7 Grievances
1. Raise: `POST /api/grievances` (subject, description, priority?, application_id?).
2. List: `GET /api/grievances/mine` (paginated).
3. Escalate: `POST /api/grievances/:id/escalate` with generated `Idempotency-Key` header; handle 409 cooldown.
4. Close: `PATCH /api/grievances/:id` `{status:'closed', state_version}` **only when resolved**.

## 2. Officer (department-scoped; demo entry = known applicantId)

### 2.1 Login → Dashboard
1. `POST /api/auth/login` → redirect `/officer`.
2. Dashboard: `GET /api/admin/analytics/overview` + `/sla` (auto-scoped to officer department by backend; 403 for null-dept officers → show explanatory error state).

### 2.2 Application review
1. Open applicant: enter/select an `applicantId` (search box fed by demo data) → `GET /api/applications/:applicantId` + `GET /api/checklist/:applicantId` + `GET /api/vault/:applicantId`.
2. Document review: verify/reject uploads → `PATCH /api/vault/:documentId/verify` `{verified_status}` (confirmation dialog, optimistic-lock-free).
3. Decision: `PATCH /api/applications/:applicationId/decide` `{decision:'approved'|'rejected'}`.
   - 403 "You can only decide applications for your own department" → show department-scoping notice; null-dept officer sees decisions disabled with explanation.

### 2.3 Grievances
1. Queue: `GET /api/grievances/assigned` (auto-scoped).
2. Claim: `PATCH /api/grievances/:id/claim` `{state_version}` → 409 "Grievance already assigned" handled gracefully.
3. Process: `PATCH /api/grievances/:id` `{status:'in_progress'|'resolved', resolution_notes?, state_version}` (notes mandatory for resolve).

### 2.4 SLA monitoring
- `GET /api/admin/analytics/sla` + notifications; optional manual sweep `POST /api/admin/run-sla-check`.
- ⛔ Officers **cannot** trigger/assign inspections (backend 403s bundle/assign for officers). Inspection involvement is notification-only (`sla_warning`/`sla_breach`).

## 3. Inspector

### 3.1 Login → Assigned work
1. `POST /api/auth/login` → `/inspector`.
2. ⛔ No "list all my inspections" endpoint exists — inspector opens an inspection via an applicantId (demo: provided list) → `GET /api/inspections/:applicantId` returns **only inspections assigned to them** (403 if none assigned → empty-state with explanation).

### 3.2 Inspection execution (bundle = inspection + linked applications in one call)
1. Bundle view: scheduled date, linked applications (`approval_name`, `department`, statuses), assigned inspector.
2. Complete: `PATCH /api/inspections/:inspectionId/complete` `{result:'pass'|'fail'|'conditional', inspector_notes?}`.
   - Notes textarea enforced required for `fail`/`conditional` (mirrors backend 400).
   - 409 "Inspection is already completed" / "Cannot complete a cancelled inspection" → refresh + show backend message; completed inspections render read-only.

## 4. Admin

### 4.1 Login → Dashboard
1. `POST /api/auth/login` → `/admin`.
2. KPI cards: `GET /api/admin/analytics/overview`; charts: `/trends` (`interval` day/week/month); SLA: `/sla`; bottlenecks: `/departments`; inspections: `/inspections`; grievances: `/grievances`. Optional `?department=` filter (400 on unknown → surface error).
3. `POST /api/admin/run-sla-check` button (with confirmation + result summary).

### 4.2 Inspection management
1. Open applicant (applicantId) → `GET /api/inspections/:applicantId`.
2. Assign: `PATCH /api/inspections/:inspectionId/assign` `{assigned_inspector_id}` (inspector picker; 400/409 states surfaced).
3. Admin may also complete inspections (assignee check bypassed) and trigger bundles for any applicant.

### 4.3 Grievance oversight
1. `GET /api/grievances/assigned` with filters (`status`, `department`, `assigned`, `escalation_level`).
2. Classify: `PATCH /api/grievances/:id/classify` `{department, state_version}`.
3. Reassign: `PATCH /api/grievances/:id/claim` `{assignee_id, state_version}`.

### ⛔ Not supported by backend (do not build)
- Approval-rule CRUD (planned in implementation_plan "Priority 6" but **never implemented**).
- User management / role assignment (no endpoints).
- Officer-wide application queue (no endpoint) — applicantId must be known.
- Profile editing; application deletion/cancellation; inspection scheduling edit (date fixed at creation).




---



# 5. Frontend-Backend API Contract


# UDAAN — Backend → Frontend API Contract

> Derived **entirely** from the current backend implementation
> (`udaan-backend/backend/src/**` — routes, controllers, middleware, models, seed, tests).
> If this document and the backend ever disagree, **the backend is authoritative**.
>
> Backend root: `udaan-backend/backend/` · Port `4000` (`.env` `PORT`) · DB: SQLite via Sequelize.

---

## 0. Global Conventions

### Base URL
- All routes are mounted under `/api` (see `src/app.js`).
- Frontend must use `VITE_API_BASE_URL` (e.g. `http://localhost:4000/api`). Never hardcode.

### Authentication
- **JWT Bearer** in `Authorization: Bearer <token>` header (`src/middleware/auth.js#authenticate`).
- Token payload: `{ id, role, department }` — signed with `JWT_SECRET`, **expires in 7 days**.
- Token returned by `POST /api/auth/register` and `POST /api/auth/login` only. **There is no refresh endpoint.**
- Missing/invalid/expired token → **401** `{ error: 'Missing or invalid Authorization header' }` or `{ error: 'Invalid or expired token' }`.
- Authenticated but wrong role → **403** `{ error: 'Insufficient permissions' }` (from `authorize()`).
- **401 ≠ 403.** Frontend: 401 ⇒ session expired → clear session, redirect to login. 403 ⇒ show "access denied" state, keep session.

### Error shape
- Almost all errors: `{ "error": "<message>" }` (some add extra fields — noted per endpoint).
- Unknown route: 404 `{ error: 'Route not found' }` (global Express fallback).
- Many controllers return 500 with `err.message` — frontend should show a generic retry-able error and surface `error` text when present.

### Roles (from `User` model ENUM — do not invent others)
`applicant` · `officer` · `inspector` · `admin`
- Officers carry a `department` string (may be `null` — fail-closed in most flows).
- Public registration **always** creates `applicant` with `department: null`. Privileged roles exist only via seed data (see §Seed accounts).

### Seed accounts (`src/seed/seed.js`, password `password123`)
| Email | Role | Department |
|---|---|---|
| `applicant@test.com` | applicant | null |
| `fire_officer@test.com` | officer | Fire Department |
| `pcb_officer@test.com` | officer | State Pollution Control Board |
| `null_dept_officer@test.com` | officer | null |
| `fire_inspector@test.com` | inspector | Fire Department |
| `pcb_inspector@test.com` | inspector | State Pollution Control Board |
| `admin@test.com` | admin | null |

---

## 1. Health

### GET /health (public)
- Purpose: liveness probe.
- Response 200: `{ "status": "ok", "service": "UDAAN backend" }`.
- Frontend: optional connectivity banner / demo health check.

---

## 2. Auth — `/api/auth`

### POST /api/auth/register (public)
- Purpose: create an account. **Always role `applicant`, department `null`.** Any `role` in the body is ignored by the backend.
- Request body: `{ name*, email*, password* }` (all required strings).
- Response **201**: `{ token, user: { id, name, email, role: 'applicant', department: null } }`.
- Errors: 400 missing fields · 409 `{ error: 'Email already registered' }` · 500.
- Frontend screen: `RegisterPage` — **no role selector**.

### POST /api/auth/login (public)
- Purpose: authenticate any role.
- Request body: `{ email*, password* }`.
- Response **200**: `{ token, user: { id, name, email, role, department } }`.
- Errors: 401 `{ error: 'Invalid credentials' }` · 500.
- Frontend screen: `LoginPage` → role-aware redirect to `/{role}` dashboard.

---

## 3. Applicant Profile — `/api/applicant`

### POST /api/applicant/profile (JWT required — any role; intended for applicants)
- Purpose: create the business profile that drives checklist/scheme matching.
- Request body:
  - Required: `business_name`, `sector`, `state`, `investment_amount` (INR lakhs), `employee_count`
  - Optional: `nic_code`, `district`, `stage` (`pre_establishment` | `construction` | `operational` | `renewal`; default `pre_establishment`)
- Response **201**: full profile row `{ id, user_id, business_name, sector, nic_code, state, district, investment_amount, employee_count, stage }`.
- Errors: 400 missing required fields · 500 (including invalid `stage` value — surfaced as Sequelize error).
- ⚠️ Backend note: no duplicate/update guard — **repeated POSTs create duplicate profiles**. Frontend must call `GET /profile/me` first and only create when it 404s.

### GET /api/applicant/profile/me (JWT required)
- Purpose: fetch the caller's own profile.
- Response **200**: profile row (same shape as above).
- Errors: 404 `{ error: 'Profile not found' }`.
- Frontend screen: Applicant onboarding / Profile page. Profile `id` is the `applicantId` used by checklist/vault/applications/inspections endpoints.

---

## 4. Dynamic Checklist — `/api/checklist`

### GET /api/checklist/:applicantId (JWT required)
- Purpose: the core differentiator — approvals that genuinely apply to a profile (sector/state/stage/investment match against `ApprovalRule` table).
- Authorization:
  - `applicant`: only own profile (`applicantId` must map to a profile with `user_id = token.id`) else **403** `{ error: 'Applicant profile not found or access denied' }`.
  - `officer` / `inspector` / `admin`: any profile; **404** `{ error: 'Applicant profile not found' }` if id unknown.
- Response **200**:
```json
{
  "applicant": { "id": 1, "business_name": "...", "sector": "food_processing", "state": "Madhya Pradesh", "stage": "pre_establishment" },
  "total_approvals_required": 5,
  "checklist": [
    { "approval_rule_id": 1, "approval_name": "Udyam Registration", "department": "MSME Department",
      "required_documents": ["Aadhaar", "PAN", "Business Address Proof"],
      "sla_days": 3, "hazard_level": "low", "requires_inspection": false }
  ]
}
```
- Frontend screen: Applicant "Requirements" tab (per-approval required documents); document completeness cross-reference with vault.

## 5. Document Vault — `/api/vault`

> ⚠️ **No multipart file upload exists.** Upload is a JSON POST registering `file_url`.
> The frontend file picker should convert the selected file to a `data:` URL (or any URL) —
> backend only validates that `file_url` parses as a URL via `new URL()`.

### POST /api/vault/upload (JWT required)
- Purpose: register a document in the "verify once, reuse everywhere" vault.
- Request body:
  - Required: `applicant_id`, `document_type` (non-empty string; must match the rule's `required_documents` names exactly for completeness), `file_url` (valid URL)
  - Optional: `expiry_date` (parseable date, **not in the past**), `verified_status` (**ignored for applicants**; `officer`/`admin` may set `pending` | `verified` | `rejected`)
- Response **201**: `{ id, applicant_id, document_type, file_url, verified_status: 'pending', uploaded_at, expiry_date }`.
- Errors: 400 missing fields / bad `document_type` / invalid `file_url` / expired `expiry_date` · 403 (applicant, not own profile) · 404 (non-applicant, unknown profile) · 500.
- Frontend screen: Applicant Document Vault upload dialog. **Applicants can never self-verify.**

### GET /api/vault/:applicantId (JWT required)
- Purpose: list everything in the vault for a profile (all verification states).
- Authorization: same ownership model as checklist (applicant own-only → 403; others 404 if unknown).
- Response **200**: array of `{ id, applicant_id, document_type, file_url, verified_status, uploaded_at, expiry_date }`.
- Frontend screens: Applicant vault list; submission readiness check; officer document review.

### PATCH /api/vault/:documentId/verify (JWT + `authorize('officer','admin')`)
- Purpose: officer/admin verification decision.
- Request body: `{ verified_status* }` ∈ `verified` | `rejected` | `pending`.
- Response **200**: updated document row.
- Errors: 400 invalid value · 404 `{ error: 'Document not found' }` · 403 other roles · 500.
- Frontend screen: Officer document review actions only.

## 6. Applications — `/api/applications`

### POST /api/applications/submit (JWT required)
- Purpose: submit the applicant for **all** matching approvals at once — creates one `Application` per rule, risk-scored and routed (`riskEngine.js`): risk `low` → `auto_approved`, `medium` → `pending_review`, `high` → `pending_inspection`.
- Request body: `{ applicant_id*, allow_resubmission? }` (`allow_resubmission` accepted as boolean or `'true'`).
- Pre-conditions enforced by backend (render, don't re-implement):
  1. ≥1 matching `ApprovalRule` else **400** `{ error: 'No matching approval rules found for this profile' }`.
  2. **Document completeness**: for every rule, every `required_documents` entry must exist as the **latest** vault doc of that type with `verified_status === 'verified'` **and** non-expired. Else **400**:
```json
{ "error": "Missing required documents",
  "missing_by_approval": [
    { "approval_name": "Fire NOC", "department": "Fire Department", "missing_documents": ["Fire Safety Layout"] } ] }
```
- **Idempotency / resubmission** (authoritative):
  - Without `allow_resubmission`: any existing application for `(applicant_id, rule_id)` → returned with `already_existed: true`.
  - With `allow_resubmission: true`: existing rows in a **non-final** status (`approved` / `auto_approved` / `rejected` are final) are returned as `already_existed: true`; final-status rules get fresh applications.
- Response: **201** if ≥1 new application, **200** if all already existed:
```json
{ "message": "3 approval application(s) processed",
  "applications": [ { "application_id": 7, "approval_name": "Fire NOC", "department": "Fire Department",
                      "risk_level": "medium", "status": "pending_inspection", "sla_deadline": "...", "already_existed": false } ] }
```
- Errors: 400 / 403 / 404 / 500 as above.
- Frontend screen: Applicant "Submit" — disable while in-flight, **distinguish 201 vs 200**, render `missing_by_approval` actionably. Never fake success.

### GET /api/applications/:applicantId (JWT required)
- Purpose: tracking dashboard — one row per approval with computed SLA countdown.
- Authorization: applicant own-only (403 otherwise); other roles unrestricted in code.
- Response **200**: array of `{ id, approval_name, department, status, risk_level, sla_deadline, days_left, sla_breached }` (`sla_breached` backend-computed). Empty array = none yet (valid empty state).
- Frontend screens: Applicant tracking timeline; also the only way officers/admins can enumerate an applicant's applications (requires knowing `applicantId` — see Gap Report).

### PATCH /api/applications/:applicationId/decide (JWT + `authorize('officer','admin')`)
- Purpose: manual officer decision on a pending application.
- Request body: `{ decision* }` ∈ `approved` | `rejected`.
- Authorization (fail-closed, controller-level): `admin` bypasses; `officer` **must** match `rule.department === token.department` — null/mismatched ⇒ **403** `{ error: 'You can only decide applications for your own department' }`.
- Response **200**: full Application row (`{ id, applicant_id, approval_rule_id, status, risk_level, sla_deadline, submitted_at, decided_at, last_notified_level, ... }`).
- Errors: 400 invalid decision · 404 application/rule not found · 403 · 500.
- Frontend screen: Officer review → Approve/Reject with confirmation dialog. No department-scoped application *queue* endpoint exists (Gap Report).

---

## 7. Scheme Matching — `/api/schemes`

### GET /api/schemes/match/:applicantId (JWT required — **no role restriction, no ownership check**)
- Purpose: proactively surface eligible government incentive schemes.
- Response **200**: `{ "eligible_scheme_count": 3, "schemes": [ { id, name, description, sector, state, min_investment, max_investment, min_employees, benefit_description } ] }`.
- Errors: 404 `{ error: 'Applicant profile not found' }` · 500.
- Frontend screen: Applicant "Schemes/Incentives" tab. ⚠️ Any authenticated user can query any `applicantId` — backend gap, report only.

## 8. Inspections (Common Inspection Planner) — `/api/inspections`

### POST /api/inspections/bundle (JWT + `authorize('applicant','admin')` — officers/inspectors 403 at route)
- Purpose: bundle ALL of an applicant's `pending_inspection` applications (whose rule `requires_inspection`) into ONE joint site-visit inspection. **Additive merge**: if a `scheduled` inspection already exists, new eligible applications are linked to it — never duplicated.
- Request body: `{ applicant_id*, scheduled_date? }` (optional ISO date; must be valid; **not in the past** for a *new* inspection; ignored for an existing one; default = now + 7 days).
- Response **201** (new) / **200** (existing merged):
```json
{ "message": "New inspection created with 2 application(s) linked",
  "inspection": { "id": 4, "applicant_id": 1, "scheduled_date": "...", "status": "scheduled",
                  "assigned_inspector_id": null, "result": null, "inspector_notes": null, "completed_at": null,
                  "Inspector": null,
                  "Applications": [ { "id": 7, "status": "pending_inspection",
                                      "ApprovalRule": { "approval_name": "Fire NOC", "department": "Fire Department" } } ] },
  "already_existed": false, "new_links_added": 2 }
```
- Errors: 400 missing `applicant_id` / invalid date / past date for new / `{ error: 'No applications pending inspection for this applicant' }` · 403 (applicant not own profile) · 404 (admin, unknown profile) · 500.
- Frontend screen: Applicant inspection card ("Schedule joint inspection") — surface `already_existed` / `new_links_added` distinctly.

### GET /api/inspections/:applicantId (JWT; roles `applicant` | `inspector` | `admin` — officers 403 at route)
- Purpose: list inspections for an applicant, each with `Inspector` (`id,name,email,role,department`) and `Applications` (with `ApprovalRule.approval_name/department`).
- Authorization (fail-closed):
  - `applicant`: own profile only → else **403** `'Access denied — you can only view your own inspections'`.
  - `admin`: any applicant → **404** if profile unknown.
  - `inspector`: returns **only inspections assigned to them** for that applicant; if none → **403** `'Access denied — no inspections assigned to you for this applicant'`.
- Response **200**: array of inspection objects (same shape as bundle `inspection`).
- Errors: 400 invalid `applicantId` · 403 · 404 · 500.
- Frontend screens: Applicant inspection timeline; **Inspector "my assigned inspections" view** (inspector must know the `applicantId` — Gap Report).

### PATCH /api/inspections/:inspectionId/assign (JWT + `authorize('admin')`)
- Purpose: assign an inspector to a scheduled inspection.
- Request body: `{ assigned_inspector_id* }` — target user must exist and have role `inspector`.
- Response **200**: updated inspection with `Inspector` + `Applications` (shape above).
- Errors: 400 invalid id / missing field / `'Assigned user must have role inspector'` · 404 inspection or user not found · **409** `'Cannot assign inspector to a cancelled|completed inspection'` · 500.
- Frontend screen: Admin inspection management (list inspections per applicant, then assign).

### PATCH /api/inspections/:inspectionId/complete (JWT + `authorize('inspector','admin')`)
- Purpose: complete a scheduled inspection; atomically cascades results to linked `pending_inspection` applications: `pass` → `approved` · `fail` → `rejected` · `conditional` → `pending_review`.
- Request body: `{ result* }` ∈ `pass` | `fail` | `conditional`; `inspector_notes` **required** for `fail` and `conditional` (non-empty).
- Authorization (controller-level, authoritative): inspector must be the assigned inspector (`403` `'You are not the assigned inspector for this inspection'` / `'This inspection has no assigned inspector'`); admin bypasses. Any caller fails with **400** `'Cannot complete an inspection with no assigned inspector'` if none assigned.
- Response **200**: `{ "message": "Inspection completed successfully", "inspection": { ...full shape with result, inspector_notes, completed_at, Inspector, Applications... } }`.
- Errors: 400 invalid result / missing notes / no inspector · 403 not assignee · 404 not found · **409** `'Cannot complete a cancelled inspection'` / `'Inspection is already completed'` (latter includes current `inspection` in body) · 500.
- Frontend screen: Inspector inspection detail (result radio + notes textarea, notes mandatory for fail/conditional); on 409 refresh state and show the backend message.

---

## 9. Analytics — `/api/admin/analytics/*` + `/api/admin/run-sla-check`

All guarded by `authenticate` + `authorize('admin','officer')` + `analyticsScope` middleware:
- `admin`: no `department` param = global; `?department=X` filters (unknown canonical department ⇒ **400** `'Unknown or invalid department'`).
- `officer`: **scoped to own `department`** — no/blank department ⇒ **403** `'Officer has no assigned department'`; department not in `ApprovalRule` table ⇒ **403**; querying another department ⇒ **403** `'Cannot query analytics outside assigned department'`.
- Query validation (overview & range endpoints): only `department`, `startDate`, `endDate` (+ `interval` for trends) allowed; unknown/repeated keys ⇒ 400; `startDate`+`endDate` both-or-neither; ISO-8601 full timestamps; range ≤ 366 days; default last 30 days; startDate inclusive, endDate exclusive.

| Endpoint | Purpose / `data` highlights |
|---|---|
| `GET /api/admin/analytics/overview` (alias `GET /api/admin/analytics`) | Funnel: submitted in range, decisions in range, `application_statuses`, approval/rejection/auto-approval rates, avg turnaround, `pending_workload` |
| `GET /api/admin/analytics/sla` | Current SLA snapshot: `sla_state {breached, warning, on_track, missing_deadline}`, `notification_levels_for_pending`, `warning_hours` |
| `GET /api/admin/analytics/departments` | Bottleneck ranking (score = pending + 2×breached + 2×high-escalation grievances) |
| `GET /api/admin/analytics/inspections` | `completed_inspections_in_range`, `inspection_results {pass,fail,conditional}`, avg duration, `unassigned_scheduled_inspections` |
| `GET /api/admin/analytics/grievances` | Grievances created/resolved in range, `grievance_statuses`, avg resolution, `unresolved_grievance_levels` |
| `GET /api/admin/analytics/trends` | Pre-aggregated time-series buckets (`interval` day/week/month, 366-bucket cap) |
| `POST /api/admin/run-sla-check` | Manually trigger SLA notification/escalation job (`{ warnings_sent, breaches_sent, ... }`); 500 on total failure |

- Envelope: `{ success, generated_at, historical_range, current_state_scope, department_scope, data }` — see `udaan-backend/backend/analytics_api_docs.md`.
- Frontend screens: Admin analytics dashboard (KPI cards + charts + filters); Officer department dashboard. **Read-only — never mutate from analytics views.**
- ⚠️ Doc mismatch: the final `getTrendsAnalytics` implementation returns buckets **without** `start`/`end` fields (only `{ application_decisions, inspections_completed, grievances_created, grievances_resolved }`) — differs from `analytics_api_docs.md`. Backend is authoritative; visualize what it returns.

## 10. Notifications — `/api/notifications` (all JWT required; all roles)

### GET /api/notifications
- Query: `page` (≥1, default 1), `limit` (1–100, default 20).
- Response **200**: `{ total, page, limit, pages, notifications: [ { id, user_id, type, title, message, reference_type, reference_id, is_read, createdAt } ] }`.
- `type` ∈ `sla_warning` | `sla_breach` | `grievance_update` | `application_update` | `scheme_recommendation`.
- Frontend: bell/menu notification center (all roles).

### PATCH /api/notifications/read-all
- Response **200**: `{ message: 'Notifications marked as read', affectedCount }`.

### PATCH /api/notifications/:id/read
- Response **200**: `{ message: 'Notification marked as read', notification: {...} }`.
- Errors: 400 `'Invalid notification ID'` · 403 `'Forbidden: You do not own this notification'` · 404 `'Notification not found'`.

---

## 11. Grievances — `/api/grievances`

> Optimistic locking everywhere: mutations require `state_version` (current value) and
> fail with **409** `{ error: 'State conflict' }` when stale.

### POST /api/grievances (JWT + applicant-only, controller-enforced)
- Purpose: file a grievance (optionally linked to an application; department auto-derived from the application's rule).
- Body: `subject*` (1–200 chars), `description*` (1–2000), `priority?` (`low`|`medium`|`high`, default `medium`), `application_id?` (positive int, must be owned by the applicant).
- Privileged fields (`applicant_id`, `department`, `status`, `assigned_to`, `escalation_level`, `sla_deadline`, `state_version`, etc.) in body ⇒ **400** `'Field X is privileged and cannot be set directly'`.
- Errors: 403 (non-applicant / no profile / not own application) · 404 application not found · 409 (rule missing / empty department) · 400/409/500.
- Response **201**: grievance row (`status: 'open'`, `escalation_level: 0`, `state_version: 0`, `sla_deadline` = +7 days).
- Frontend: Applicant "Raise grievance" form.

### GET /api/grievances/mine (applicant-only)
- Query: `page`, `limit` (≤100). Response **200**: `{ grievances: [...], pagination: { page, limit, total, total_pages } }`.

### GET /api/grievances/assigned (officer/admin)
- Officer: auto-scoped — grievances assigned to them **or** unassigned in their department (escalation_level < 2, not resolved/closed). No-department officer ⇒ 403.
- Admin filters: `status`, `department`, `assigned` (`true`/`false`), `escalation_level` (0–3).
- Response: same paginated shape as `/mine`.

### PATCH /api/grievances/:id/classify (admin-only)
- Body: `{ department*, state_version* }`. Cannot classify a **linked** grievance (409); same department ⇒ 409; unknown canonical department ⇒ 400.

### PATCH /api/grievances/:id/claim (officer/admin)
- Officer: body `{ state_version* }` — claims for self. Rules: must have department; grievance department must match (403 cross-department); escalation_level < 2 (403); unassigned (409 already assigned).
- Admin: body `{ assignee_id|null, state_version* }` — assignee must be an existing **officer** with matching department.
- Response **200**: `{ message: 'Claim successful' }`.

### PATCH /api/grievances/:id (applicant/officer/admin)
- Body: `{ status*, state_version*, resolution_notes? }`.
- **Applicant**: only `closed`, and only from `resolved`; cannot set notes; must own the grievance.
- **Officer/admin** (staff cannot `close` ⇒ 403): valid transitions —
  `open → in_progress | resolved` · `in_progress → resolved` · `escalated → in_progress | resolved`.
- `resolved` requires `resolution_notes` (1–2000 chars). Officer must be assignee + same department.
- Response **200**: `{ message: 'Status updated successfully' }`. Errors: 400/403/404/409.

### POST /api/grievances/:id/escalate (applicant-only)
- Headers: `Idempotency-Key` (required, `[A-Za-z0-9._:-]{1,100}`).
- Body: `{ reason* (1–2000), state_version* }`.
- Behaviour: escalates to level+1 (max 3); cooldown via `next_escalation_at` ⇒ **409** `'Escalation cooldown active'`; level ≥ 2 unassigns officer. Replaying an existing key returns the original result with `replayed: true`.
- Response **200**: `{ message, replayed, grievance: {...}, escalation: {...} }`.

---

## 12. Endpoint Inventory Summary (29 routes)

| # | Method & Route | Roles |
|---|---|---|
| 1 | GET /health | public |
| 2 | POST /api/auth/register | public |
| 3 | POST /api/auth/login | public |
| 4 | POST /api/applicant/profile | any authenticated |
| 5 | GET /api/applicant/profile/me | any authenticated |
| 6 | GET /api/checklist/:applicantId | any authenticated (applicant own-only) |
| 7 | POST /api/vault/upload | any authenticated (applicant own-only) |
| 8 | GET /api/vault/:applicantId | any authenticated (applicant own-only) |
| 9 | PATCH /api/vault/:documentId/verify | officer, admin |
| 10 | POST /api/applications/submit | any authenticated (applicant own-only in practice) |
| 11 | GET /api/applications/:applicantId | any authenticated (applicant own-only) |
| 12 | PATCH /api/applications/:applicationId/decide | officer, admin |
| 13 | GET /api/schemes/match/:applicantId | any authenticated (no ownership check) |
| 14 | POST /api/inspections/bundle | applicant, admin |
| 15 | GET /api/inspections/:applicantId | applicant, inspector, admin |
| 16 | PATCH /api/inspections/:inspectionId/assign | admin |
| 17 | PATCH /api/inspections/:inspectionId/complete | inspector (assignee), admin |
| 18–23 | GET /api/admin/analytics/{overview,trends,sla,departments,inspections,grievances} | officer (dept-scoped), admin |
| 24 | GET /api/admin/analytics (legacy alias) | officer, admin |
| 25 | POST /api/admin/run-sla-check | officer, admin |
| 26 | GET /api/notifications | any authenticated |
| 27 | PATCH /api/notifications/read-all | any authenticated |
| 28 | PATCH /api/notifications/:id/read | owner only |
| 29 | /api/grievances (7 routes) | per-route: applicant / officer / admin |








---



# 6. Implementation Plan & Architecture


# UDAAN Backend — Full Implementation Plan (v3 — final)

## Current State

The existing backend covers **6 of 10 PRD modules**:

| PRD Module | Status | Existing Files |
|---|---|---|
| 5.1 Regulatory Knowledge Engine (Dynamic Checklist) | ✅ Implemented | `checklistController.js`, `ApprovalRule.js` |
| 5.2 Applicant Journey & Data Reuse Vault | ✅ Implemented | `vaultController.js`, `DocumentVault.js` |
| 5.3 Pre-Validation & Auto-Scrutiny | ⚠️ Partial (auto-verified on upload, no real validation) | `vaultController.js` L20 |
| 5.4 Risk-Based Scrutiny & Routing | ✅ Implemented | `riskEngine.js`, `applicationController.js` |
| 5.5 Parallel Workflow Orchestration | ⚠️ Partial (parallel creation, no dependency mapping) | `applicationController.js` |
| 5.6 Common Inspection Planner | ❌ Missing | — |
| 5.7 SLA Tracking, Alerts & Escalation | ⚠️ Partial (countdown exists, no alerts/escalation) | `applicationController.js`, `adminController.js` |
| 5.8 Grievance Redressal | ❌ Missing | — |
| 5.9 Incentive & Scheme Matching | ✅ Implemented | `schemeController.js`, `Scheme.js` |
| 5.10 Unified Analytics Dashboard | ⚠️ Partial (basic stats, no trends/predictive) | `adminController.js` |

---

## Decisions Already Made

- **Inspector** is a separate role from officer.
- **Notifications** are in-database + polling only for this MVP; no SMS/email.
- **SQLite** for dev, Postgres-ready via `.env` switch.
- After any model ENUM change, re-run `npm run seed` for a clean DB.
- Work is done in priority order; each section is curl-verified before the next.

---

## Key Fixes in This Plan (v3 vs v2)

| # | Bug in v2 | Fix in v3 |
|---|---|---|
| FIX-1 | **Hardcoded ALLOWED_DOCUMENT_TYPES** blocked uploads for doc types added by new approval rules at runtime (Priority 6) | **Dynamic**: no document_type allowlist — validate non-empty string only. The rule engine decides what's required, not the vault. |
| FIX-2 | **Fail-open department scoping**: `if (req.user.department && ...)` silently waves through officers with null department | **Fail-closed**: strict `rule.department !== req.user.department` with no null guard. Officers with no department → 403. Only admins bypass. |
| FIX-3 | **Plain idempotency on inspection bundling**: returning existing inspection as-is ignores new pending_inspection apps submitted after the first bundle | **Additive merge**: finds existing scheduled inspection AND links any newly-pending applications not already joined. |
| FIX-4 | **SLA notifications only query officers**: pending_inspection apps handled by inspectors get zero notifications if no officer is staffed for that dept | **Query both**: `role: { [Op.in]: ['officer', 'inspector'] }` for warning and breach notifications. |
| FIX-5 | **No automatic grievance escalation**: manual-only escalateGrievance doesn't deliver PRD's "time-bound escalation" promise | **Cron-driven**: `checkGrievanceEscalations()` runs alongside SLA check, auto-escalates overdue grievances. |
| FIX-6 | **Delete guard only checks non-terminal applications**: deleting a rule after its apps reach 'approved' orphans FK references, crashes analytics | **Block ALL references**: `Application.count({ where: { approval_rule_id } })` with no status filter. Optionally soft-delete via `is_active` field. |

---

## Priority 1: Fix Correctness Gaps in Existing Code

### 1a. Document-Completeness Validation Before Submission

#### [MODIFY] `src/controllers/applicationController.js`

In `submitApplication`, after fetching matching `ApprovalRule` rows and BEFORE creating any `Application` rows, cross-check the applicant's `DocumentVault` entries against each rule's `required_documents` array.

```js
// Move vaultDocs fetch BEFORE the creation loop (currently at line 33)
const vaultDocs = await DocumentVault.findAll({ where: { applicant_id } });
const vaultDocTypes = vaultDocs.map(d => d.document_type);

// NEW: Completeness check — reject the entire submission if any docs are missing
// Why: the existing code silently creates applications even with an empty vault,
// which defeats the PRD's "reduces incomplete-application rejections at source" goal
const missingByApproval = [];
for (const rule of rules) {
  const missing = rule.required_documents.filter(
    docType => !vaultDocTypes.includes(docType)
  );
  if (missing.length > 0) {
    missingByApproval.push({
      approval_name: rule.approval_name,
      department: rule.department,
      missing_documents: missing,
    });
  }
}
if (missingByApproval.length > 0) {
  return res.status(400).json({
    error: 'Missing required documents',
    missing_by_approval: missingByApproval,
  });
}
```

---

### 1b. Submission Idempotency

#### [MODIFY] `src/controllers/applicationController.js`

Inside the `for (const rule of rules)` loop, before creating a new `Application`:

```js
// NEW: Idempotency check — skip if an active application already exists
// Why: prevents duplicate rows if the user (or frontend) calls submit twice
const existing = await Application.findOne({
  where: {
    applicant_id,
    approval_rule_id: rule.id,
    status: { [Op.notIn]: ['approved', 'auto_approved', 'rejected'] },
  },
});

if (existing) {
  createdApplications.push({
    application_id: existing.id,
    approval_name: rule.approval_name,
    department: rule.department,
    risk_level: existing.risk_level,
    status: existing.status,
    sla_deadline: existing.sla_deadline,
    already_existed: true,
  });
  continue;
}

// ...existing risk scoring + Application.create logic, adding already_existed: false...
```

---

### 1c. Document Pre-Validation on Upload — DYNAMIC (FIX-1)

#### [MODIFY] `src/models/DocumentVault.js`

Add: `expiry_date: { type: DataTypes.DATE, allowNull: true }`

#### [MODIFY] `src/controllers/vaultController.js`

**CRITICAL (FIX-1):** Do NOT hardcode an ALLOWED_DOCUMENT_TYPES list. Priority 6 lets admins create new approval rules with arbitrary `required_documents` values at runtime (e.g. a new "pharma" sector needing "Manufacturing License", "GMP Certificate"). A hardcoded allowlist would permanently block uploads for those types.

Instead, validate only structural properties:

```js
async function uploadDocument(req, res) {
  try {
    const { applicant_id, document_type, file_url, expiry_date } = req.body;
    if (!applicant_id || !document_type || !file_url) {
      return res.status(400).json({ error: 'applicant_id, document_type and file_url are required' });
    }

    // Validate document_type is a non-empty string (but do NOT check against a
    // fixed allowlist — the rule engine is the source of truth for what's required,
    // not the vault. Admins can create rules with arbitrary required_documents
    // via Priority 6's API, and we must accept uploads for those types.)
    if (typeof document_type !== 'string' || document_type.trim().length === 0) {
      return res.status(400).json({ error: 'document_type must be a non-empty string' });
    }

    // Validate file_url is a well-formed URL
    try { new URL(file_url); } catch {
      return res.status(400).json({ error: 'file_url is not a valid URL' });
    }

    // If expiry_date is provided and in the past, reject
    if (expiry_date && new Date(expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Document has expired (expiry_date is in the past)' });
    }

    const profile = await ApplicantProfile.findByPk(applicant_id);
    if (!profile) return res.status(404).json({ error: 'Applicant profile not found' });

    const doc = await DocumentVault.create({
      applicant_id,
      document_type: document_type.trim(),
      file_url,
      expiry_date: expiry_date || null,
      // Mocked auto-verification for demo purposes — in production this would
      // integrate with DigiLocker/OCR for real document validation (stretch goal)
      verified_status: 'verified',
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

---

### Priority 1 Verification

```bash
npm run seed && npm start
# 1a: submit with empty vault -> expect 400 with missing_by_approval detail
# 1b: upload all docs, submit, then submit again -> second call shows already_existed: true
# 1c: upload with invalid URL -> 400; upload with past expiry_date -> 400
# 1c: upload "Manufacturing License" (NOT in seed data) -> should SUCCEED (proves FIX-1)
```

---

## Priority 2: Add Inspector Role and Department Scoping (Fail-Closed)

### 2a. Add `inspector` Role and `department` Field

#### [MODIFY] `src/models/User.js`

```js
role: {
  type: DataTypes.ENUM('applicant', 'officer', 'inspector', 'admin'),
  defaultValue: 'applicant',
},
department: { type: DataTypes.STRING, allowNull: true },
```

#### [MODIFY] `src/controllers/authController.js`

- Accept `department` from `req.body` in register.
- Pass to `User.create()`.
- Update role validation: `['applicant', 'officer', 'inspector', 'admin']`.
- Include `department` in JWT payload: `jwt.sign({ id, role, department }, ...)`.
- Include `department` in response `user` object (both register and login).

---

### 2b. Department Scoping — FAIL-CLOSED (FIX-2)

#### [MODIFY] `src/controllers/applicationController.js` — `decideApplication`

```js
// NEW: Department scoping — FAIL-CLOSED (FIX-2)
// CRITICAL: this is a strict equality check with NO `req.user.department &&` guard.
// An officer with a null/missing department MUST be denied, not waved through.
// Only admins bypass this check entirely.
// Why fail-closed: if an officer is registered without a department (data entry error),
// they should see 403 until an admin fixes their profile — not silently gain access
// to every department's applications.
if (req.user.role !== 'admin') {
  const rule = await ApprovalRule.findByPk(application.approval_rule_id);
  if (rule.department !== req.user.department) {
    return res.status(403).json({
      error: 'You can only decide applications for your own department',
    });
  }
}
```

---

### Priority 2 Verification

```bash
npm run seed && npm start
# Register officer WITH department: 'Fire Department'
# Register officer WITHOUT department (or department: null)
# Officer with Fire Dept deciding Fire NOC app → success
# Officer with Fire Dept deciding Pollution NOC app → 403
# Officer with NO department deciding ANY app → 403 (proves FIX-2 fail-closed)
```

---

## Priority 3: Common Inspection Planner (PRD §5.6)

### New Models

#### [NEW] `src/models/Inspection.js`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER, PK, autoIncrement | |
| `applicant_id` | INTEGER, not null | FK to ApplicantProfile |
| `scheduled_date` | DATE, not null | Default: now + 7 days |
| `status` | ENUM('scheduled','completed','cancelled') | Default: 'scheduled' |
| `inspector_notes` | TEXT, nullable | Filled on completion |
| `result` | ENUM('pass','fail','conditional'), nullable | Filled on completion |
| `assigned_inspector_id` | INTEGER, nullable | FK to User (inspector role) |

#### [NEW] `src/models/InspectionApplication.js`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER, PK, autoIncrement | |
| `inspection_id` | INTEGER, not null | FK to Inspection |
| `application_id` | INTEGER, not null | FK to Application |

Unique constraint on `(inspection_id, application_id)` to prevent duplicate join rows.

### Associations

```js
Inspection.belongsToMany(Application, { through: InspectionApplication, foreignKey: 'inspection_id' });
Application.belongsToMany(Inspection, { through: InspectionApplication, foreignKey: 'application_id' });
Inspection.belongsTo(ApplicantProfile, { foreignKey: 'applicant_id' });
ApplicantProfile.hasMany(Inspection, { foreignKey: 'applicant_id' });
Inspection.belongsTo(User, { as: 'Inspector', foreignKey: 'assigned_inspector_id' });
```

### Controller — Additive Merge (FIX-3)

#### [NEW] `src/controllers/inspectionController.js`

**`bundleInspections(req, res)`**
```
Input: { applicant_id, assigned_inspector_id? }

1. Validate applicant profile exists.
2. Find all Applications where:
   - applicant_id matches
   - status = 'pending_inspection'
   Include ApprovalRule, filter to requires_inspection = true
3. If none found → 400: "No applications pending inspection"
4. Look for an existing Inspection where applicant_id matches, status='scheduled'
5. IF EXISTS (FIX-3 — additive merge, not plain idempotency):
   - Fetch all application_ids already linked via InspectionApplication
   - Find which of the pending applications from step 2 are NOT yet linked
   - Create InspectionApplication rows for the new ones
   - Return the updated inspection with its FULL set of linked applications
   Why: handles the case where the applicant submitted new approvals needing
   inspection after the first bundle was created — plain "return as-is"
   would silently ignore the new applications.
6. IF NOT EXISTS:
   - Create new Inspection (scheduled_date = now+7, status='scheduled',
     assigned_inspector_id if provided)
   - Create InspectionApplication join rows for all found applications
   - Return bundled inspection
```

**`getInspections(req, res)`**
- List inspections for applicant, including linked Applications → ApprovalRule and Inspector info.

**`assignInspector(req, res)`**
- Admin-only. Verify target user has role='inspector'. Set and save.

**`completeInspection(req, res)`**
```
Auth: inspector (must be assigned_inspector_id for THIS inspection) or admin.
Validation: inspection.status must be 'scheduled'.

1. Update Inspection: status='completed', result, inspector_notes
2. For each linked Application:
   - result='pass'        → status='approved', decided_at=now
   - result='fail'        → status='rejected', decided_at=now
   - result='conditional' → status='pending_review' (officer desk-reviews notes)
3. Return updated inspection + application statuses
```

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/api/inspections/bundle` | authenticate | `bundleInspections` |
| GET | `/api/inspections/:applicantId` | authenticate | `getInspections` |
| PATCH | `/api/inspections/:inspectionId/assign` | authenticate, authorize('admin') | `assignInspector` |
| PATCH | `/api/inspections/:inspectionId/complete` | authenticate, authorize('inspector','admin') | `completeInspection` |

---

### Priority 3 Verification

```bash
# Bundle → single inspection with multiple linked applications
# Call bundle again with no new pending_inspection apps → same inspection, no new links
# Submit a NEW application that also needs inspection, call bundle again →
#   the existing scheduled inspection now includes this new application too (proves FIX-3)
# Assign inspector, complete as that inspector → linked applications update
# Try completing as a different inspector → 403
```

---

## Priority 4: SLA Escalation + Notifications (PRD §5.7)

### Models

#### [NEW] `src/models/Notification.js`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER, PK, autoIncrement | |
| `user_id` | INTEGER, not null | FK to User |
| `type` | ENUM('sla_warning','sla_breach','grievance_update','application_update','scheme_recommendation') | |
| `title` | STRING, not null | |
| `message` | TEXT, not null | |
| `reference_type` | STRING, nullable | 'application', 'grievance', 'inspection' |
| `reference_id` | INTEGER, nullable | |
| `is_read` | BOOLEAN, default false | |
| `created_at` | DATE, default NOW | |

#### Associations

```js
Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });
```

#### [MODIFY] `src/models/Application.js`

Add: `last_notified_level: { type: DataTypes.ENUM('none','warning','breach'), defaultValue: 'none' }`

### Service — Recipients Include Inspectors (FIX-4)

#### [NEW] `src/services/slaEscalationService.js` (new `src/services/` directory)

```js
async function checkAndEscalate() {
  // ...fetch non-terminal applications with ApprovalRule...
  for (const app of applications) {
    const daysLeft = Math.ceil((new Date(app.sla_deadline) - now) / (1000*60*60*24));
    const rule = app.ApprovalRule;

    if (daysLeft <= 2 && daysLeft >= 0 && app.last_notified_level !== 'warning') {
      // FIX-4: Query BOTH officers AND inspectors for this department.
      // Why: applications in 'pending_inspection' status are handled by inspectors,
      // not officers. If a department only has inspectors staffed (no officer),
      // querying only role='officer' means zero notifications — a silent failure.
      const recipients = await User.findAll({
        where: {
          role: { [Op.in]: ['officer', 'inspector'] },
          department: rule.department,
        },
      });
      // ...create sla_warning notifications for each recipient...
      app.last_notified_level = 'warning';
      await app.save();
    }

    if (daysLeft < 0 && app.last_notified_level !== 'breach') {
      // For breaches: department officers+inspectors PLUS all admins
      const deptStaff = await User.findAll({
        where: {
          role: { [Op.in]: ['officer', 'inspector'] },
          department: rule.department,
        },
      });
      const admins = await User.findAll({ where: { role: 'admin' } });
      const recipients = [...deptStaff, ...admins];
      // ...create sla_breach notifications...
      app.last_notified_level = 'breach';
      await app.save();
    }
  }
  return { warnings_sent, breaches_sent };
}
```

### Controller

#### [NEW] `src/controllers/notificationController.js`

- `getMyNotifications` — findAll where user_id = req.user.id, order by created_at DESC, limit 50
- `markAsRead` — find by PK, **verify user_id matches req.user.id** (prevents cross-user marking), set is_read = true
- `markAllRead` — update is_read=true where user_id = req.user.id and is_read = false

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/api/notifications` | authenticate | `getMyNotifications` |
| PATCH | `/api/notifications/:id/read` | authenticate | `markAsRead` |
| PATCH | `/api/notifications/read-all` | authenticate | `markAllRead` |

#### [MODIFY] `src/routes/adminRoutes.js`

Add: `POST /api/admin/run-sla-check` — admin/officer only, calls checkAndEscalate(), returns summary.

#### [MODIFY] `src/server.js`

```js
const cron = require('node-cron');
const { checkAndEscalate } = require('./services/slaEscalationService');
// After app.listen():
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled SLA escalation check...');
  checkAndEscalate().catch(err => console.error('SLA cron error:', err));
});
```

#### [MODIFY] `package.json` — add `"node-cron": "^3.0.3"`

---

### Priority 4 Verification

```bash
npm install && npm run seed && npm start
# POST /api/admin/run-sla-check → { warnings_sent, breaches_sent }
# CRITICAL (FIX-4 proof): Create an application in pending_inspection status,
#   past its SLA deadline, in a department staffed ONLY by an inspector (no officer).
#   Run SLA check → verify the INSPECTOR receives a notification.
```

---

## Priority 5: Grievance Redressal (PRD §5.8) + Auto-Escalation (FIX-5)

### Model

#### [NEW] `src/models/Grievance.js`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER, PK, autoIncrement | |
| `applicant_id` | INTEGER, not null | FK to ApplicantProfile |
| `application_id` | INTEGER, nullable | FK to Application |
| `subject` | STRING, not null | |
| `description` | TEXT, not null | |
| `status` | ENUM('open','in_progress','escalated','resolved','closed') | Default: 'open' |
| `priority` | ENUM('low','medium','high') | Default: 'medium' |
| `assigned_to` | INTEGER, nullable | FK to User |
| `resolution_notes` | TEXT, nullable | |
| `escalation_level` | INTEGER, default 0 | Range 0–3 |
| `sla_deadline` | DATE | Auto-set to now + 7 days |
| `created_at` | DATE, default NOW | |
| `resolved_at` | DATE, nullable | |

### Associations

```js
Grievance.belongsTo(ApplicantProfile, { foreignKey: 'applicant_id' });
ApplicantProfile.hasMany(Grievance, { foreignKey: 'applicant_id' });
Grievance.belongsTo(Application, { foreignKey: 'application_id' });
Application.hasMany(Grievance, { foreignKey: 'application_id' }); // both directions
Grievance.belongsTo(User, { as: 'AssignedOfficer', foreignKey: 'assigned_to' });
```

### Controller

#### [NEW] `src/controllers/grievanceController.js`

- `createGrievance` — validate profile; if application_id given, validate it belongs to applicant; auto-set sla_deadline = now+7; status='open', escalation_level=0.
- `getMyGrievances` — look up profile by req.user.id; **if no profile, return []** (not 404); include Application for context.
- `getAssignedGrievances` — where assigned_to = req.user.id; order by priority DESC, created_at ASC.
- `updateGrievanceStatus` — validate status enum; if resolved/closed set resolved_at; validate assigned_to target role.
- `escalateGrievance` — **block if resolved/closed** (400); block if level >= 3 (400); bump level, set status='escalated'; if level >= 2, reassign to admin.

### Auto-Escalation via Cron (FIX-5)

#### [MODIFY] `src/services/slaEscalationService.js`

Add a second exported function:

```js
async function checkGrievanceEscalations() {
  // FIX-5: The PRD promises "time-bound escalation" but a manually-called
  // escalateGrievance endpoint alone doesn't deliver that — nothing currently
  // checks grievance SLA deadlines automatically. This function runs on the
  // same cron schedule as checkAndEscalate().
  const now = new Date();
  const overdue = await Grievance.findAll({
    where: {
      sla_deadline: { [Op.lt]: now },
      status: { [Op.notIn]: ['resolved', 'closed'] },
      escalation_level: { [Op.lt]: 3 },
    },
  });
  let escalated = 0;
  for (const g of overdue) {
    g.escalation_level += 1;
    g.status = 'escalated';
    if (g.escalation_level >= 2) {
      const admin = await User.findOne({ where: { role: 'admin' } });
      g.assigned_to = admin ? admin.id : g.assigned_to;
    }
    await g.save();
    // Notify the applicant that their grievance was auto-escalated
    const profile = await ApplicantProfile.findByPk(g.applicant_id);
    if (profile) {
      await Notification.create({
        user_id: profile.user_id,
        type: 'grievance_update',
        title: `Grievance auto-escalated: ${g.subject}`,
        message: `Your grievance has been automatically escalated to level ${g.escalation_level} due to SLA breach.`,
        reference_type: 'grievance',
        reference_id: g.id,
      });
    }
    escalated++;
  }
  return { grievances_escalated: escalated };
}
```

#### [MODIFY] `src/server.js` cron schedule

```js
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled SLA + grievance escalation check...');
  const sla = await checkAndEscalate().catch(err => { console.error(err); return {}; });
  const grv = await checkGrievanceEscalations().catch(err => { console.error(err); return {}; });
  console.log('Results:', sla, grv);
});
```

#### [MODIFY] `POST /api/admin/run-sla-check` response

Return combined results: `{ warnings_sent, breaches_sent, grievances_escalated }`.

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/api/grievances` | authenticate | `createGrievance` |
| GET | `/api/grievances/mine` | authenticate | `getMyGrievances` |
| GET | `/api/grievances/assigned` | authenticate, authorize('officer','admin') | `getAssignedGrievances` |
| PATCH | `/api/grievances/:id` | authenticate, authorize('officer','admin') | `updateGrievanceStatus` |
| POST | `/api/grievances/:id/escalate` | authenticate | `escalateGrievance` |

---

### Priority 5 Verification

```bash
# Full lifecycle: create → assign → manual escalate → resolve → try escalating resolved → 400
# FIX-5 proof: create a grievance with sla_deadline in the past (via seed data),
#   run /api/admin/run-sla-check → verify it auto-escalates without manual /escalate call,
#   AND verify the applicant receives a grievance_update notification
```

---

## Priority 6: Approval Rule Management API (PRD §5.1) + Soft-Delete (FIX-6)

### Controller

#### [NEW] `src/controllers/approvalRuleController.js`

- `listRules` — filterable by sector/state/stage query params, paginated via findAndCountAll. **If `is_active` field exists, default filter to `is_active: true`.**
- `createRule` — validate required fields (sector, state, approval_name, department, required_documents as non-empty array); validate enums.
- `updateRule` — partial update, same validation, 404 if not found.
- `deleteRule` (FIX-6):

```js
async function deleteRule(req, res) {
  const rule = await ApprovalRule.findByPk(req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  // FIX-6: Block deletion if ANY application references this rule — including
  // terminal (approved/rejected) ones. Why: those Application rows still have
  // approval_rule_id as a FK, and adminController.getAnalytics does
  // `include: [{ model: ApprovalRule }]` which would return null for the deleted
  // rule, crashing on `a.ApprovalRule.department`.
  const anyApps = await Application.count({ where: { approval_rule_id: rule.id } });
  if (anyApps > 0) {
    // Soft-delete: mark inactive instead of destroying
    rule.is_active = false;
    await rule.save();
    return res.json({
      message: 'Rule deactivated (has existing applications). It will no longer appear in new checklists.',
      rule,
    });
  }

  // Hard-delete: no applications reference this rule, safe to destroy
  await rule.destroy();
  res.json({ message: 'Rule deleted' });
}
```

#### [MODIFY] `src/models/ApprovalRule.js`

Add: `is_active: { type: DataTypes.BOOLEAN, defaultValue: true }`

#### [MODIFY] `src/controllers/checklistController.js` and `applicationController.js`

Add `is_active: true` to the rule-matching where clause so deactivated rules stop appearing in checklists and submissions.

### Routes

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/api/approval-rules` | authenticate, authorize('admin','officer') | `listRules` |
| POST | `/api/approval-rules` | authenticate, authorize('admin') | `createRule` |
| PUT | `/api/approval-rules/:id` | authenticate, authorize('admin') | `updateRule` |
| DELETE | `/api/approval-rules/:id` | authenticate, authorize('admin') | `deleteRule` |

---

### Priority 6 Verification

```bash
# Create a rule, list, update, delete (no apps → hard delete, success)
# Create a rule, generate an application against it, delete → soft-delete (is_active=false)
# Verify checklist engine no longer returns the deactivated rule
```

---

## Priority 7: Enhanced Analytics (PRD §5.10)

#### [MODIFY] `src/controllers/adminController.js`

Add to `getAnalytics` (reusing already-loaded `allApplications`, no extra queries):

**7a. avg_processing_time_by_department** — average (decided_at - submitted_at) in days for terminal-status apps.

**7b. weekly_submission_trend** — applications per week for last 4 weeks, using `week_start`/`week_end` date strings.

**7c. top_bottleneck_departments** — departments sorted by pending count descending, as array.

---

## Priority 8: Lightweight Audit Logging

### Model

#### [NEW] `src/models/AuditLog.js`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER, PK, autoIncrement | |
| `actor_user_id` | INTEGER, not null | |
| `action` | STRING, not null | |
| `entity_type` | STRING, not null | |
| `entity_id` | INTEGER, not null | |
| `previous_status` | STRING, nullable | |
| `new_status` | STRING, nullable | |
| `notes` | TEXT, nullable | |
| `created_at` | DATE, default NOW | |

Association: `AuditLog.belongsTo(User, { as: 'Actor', foreignKey: 'actor_user_id' })`

### Integration (inline, not middleware)

- `applicationController.decideApplication` — capture previousStatus BEFORE update
- `inspectionController.completeInspection` — log inspection + each linked application change
- `grievanceController.updateGrievanceStatus` and `escalateGrievance`

### Endpoint

`adminController.getAuditLog` — paginated, filterable by entity_type/entity_id, include Actor.

Route: `GET /api/admin/audit-log` (admin-only).

---

## Cross-Cutting Changes

### [MODIFY] `src/models/index.js`

All new models + associations (including both-direction Grievance↔Application, Notification↔User, AuditLog→User).

### [MODIFY] `src/app.js`

Mount: `/api/grievances`, `/api/inspections`, `/api/notifications`, `/api/approval-rules`.

### [MODIFY] `src/seed/seed.js`

Full demo data in dependency order (users with bcrypt.hashSync → rules → schemes → profile → vault docs → applications with varied statuses/SLA deadlines → inspection → grievances with one past-SLA for FIX-5 demo → notifications). Include at least one department staffed ONLY by an inspector (no officer) for FIX-4 demo.

---

## File Change Summary

| Action | File | Key Changes |
|---|---|---|
| MODIFY | `src/models/User.js` | inspector role + department |
| MODIFY | `src/models/Application.js` | last_notified_level |
| MODIFY | `src/models/DocumentVault.js` | expiry_date |
| MODIFY | `src/models/ApprovalRule.js` | is_active (FIX-6) |
| MODIFY | `src/models/index.js` | 5 new models + all associations |
| MODIFY | `src/controllers/authController.js` | department in register/login/JWT |
| MODIFY | `src/controllers/applicationController.js` | doc validation, idempotency, fail-closed dept scoping (FIX-2), is_active filter, audit log |
| MODIFY | `src/controllers/vaultController.js` | dynamic pre-validation (FIX-1) |
| MODIFY | `src/controllers/checklistController.js` | is_active filter (FIX-6) |
| MODIFY | `src/controllers/adminController.js` | enhanced analytics + getAuditLog |
| MODIFY | `src/routes/adminRoutes.js` | SLA check + audit log endpoints |
| MODIFY | `src/app.js` | mount 4 new route modules |
| MODIFY | `src/server.js` | node-cron for SLA + grievance escalation |
| MODIFY | `src/seed/seed.js` | full demo data with bcrypt + edge-case scenarios |
| MODIFY | `package.json` | add node-cron |
| NEW | `src/models/Grievance.js` | |
| NEW | `src/models/Inspection.js` | |
| NEW | `src/models/InspectionApplication.js` | |
| NEW | `src/models/Notification.js` | |
| NEW | `src/models/AuditLog.js` | |
| NEW | `src/controllers/grievanceController.js` | 5 functions |
| NEW | `src/controllers/inspectionController.js` | 4 functions (bundle w/ FIX-3, get, assign, complete) |
| NEW | `src/controllers/notificationController.js` | 3 functions |
| NEW | `src/controllers/approvalRuleController.js` | 4 functions (CRUD w/ FIX-6) |
| NEW | `src/services/slaEscalationService.js` | checkAndEscalate (FIX-4) + checkGrievanceEscalations (FIX-5) |
| NEW | `src/routes/grievanceRoutes.js` | 5 routes |
| NEW | `src/routes/inspectionRoutes.js` | 4 routes |
| NEW | `src/routes/notificationRoutes.js` | 3 routes |
| NEW | `src/routes/approvalRuleRoutes.js` | 4 routes |

**Total: 15 modified + 14 new = 29 files**



---

