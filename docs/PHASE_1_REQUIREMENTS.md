# Phase 1: Requirements Validation

## Business Goals
1. **Prevent Duplicate Reservations:** Ensure no two active reservations exist for the same phone number.
2. **Data Privacy:** Shield customer information from public view while allowing status checks.
3. **Auditability:** Maintain a permanent, immutable record of all reservation activities.
4. **Operational Efficiency:** Automate reservation expiration and provide administrative tools for management.

## Stakeholders
- **Public Users:** Need to check if a phone number is "locked" without seeing details.
- **Internal Users (Staff):** Authorized to create and manage reservations.
- **Administrators:** Full system control, user management, and auditing.
- **IT/DevOps:** Responsible for system maintenance and deployment.

## Functional Requirements
- **Public Search:** Unauthenticated search by phone number returning only "ACTIVE" status.
- **Authentication:** Secure login for internal users and admins.
- **Reservation Management:** Create, update, cancel reservations (for owners/admins).
- **Auto-Expiration:** Automatic transition from ACTIVE to EXPIRED after 14 days (configurable).
- **Dashboard:** Real-time metrics on reservation statuses and user activity.
- **User Management:** Admin-only tools to manage internal user accounts.
- **Excel Export:** Secure export of reservation data for reporting.
- **Audit Logging:** Detailed logging of all sensitive actions.
- **Health Check:** API endpoint for system monitoring.

## Non-Functional Requirements
- **Security:** Argon2 hashing, RBAC, session management, CSRF/XSS protection.
- **Performance:** Optimized indexing for phone number searches; efficient Excel streaming.
- **Scalability:** Design supports future growth in users and reservation volume.
- **Maintainability:** Clean architecture, typed code (TypeScript), and structured logging.
- **Reliability:** Concurrency protection at the database level.

## Assumptions
- The system will handle approximately 60 internal users.
- Standard Thai phone number formats (normalization required).
- Deployment targets: Local (Docker/PostgreSQL) and Production (Vercel/Supabase).

## Constraints
- **Phone Number Lock:** Phone number is the unique key for active locks.
- **No Deletion:** Historical data must be preserved; use status changes instead of hard deletes.
- **Tech Stack:** Strict adherence to pinned versions (Next.js 15, Prisma 5.22.0, etc.).

## Risk Analysis
- **Concurrency:** Multiple users attempting to lock the same number simultaneously. *Mitigation: DB-level unique index and transactions.*
- **Data Leakage:** Accidental exposure of customer data to public. *Mitigation: Strict API response filtering and authorization checks.*
- **System Downtime:** Failure of cron jobs for expiration. *Mitigation: Robust logging and health monitoring.*

## Validation Checklist
- [x] Business goals are clearly defined and aligned with the "phone number lock" core concept.
- [x] All stakeholders have been identified.
- [x] Functional requirements cover public search, auth, and reservation lifecycle.
- [x] Non-functional requirements include security, performance, and concurrency.
- [x] Assumptions and constraints are documented.
- [x] Risk analysis identifies major threats and mitigation strategies.
- [x] Tech stack is confirmed (Next.js 15, Prisma, PostgreSQL).
