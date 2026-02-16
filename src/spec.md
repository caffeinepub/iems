# Specification

## Summary
**Goal:** Build the core IEMS browser-based school management app with role selection, phone+OTP-only login, RBAC-secured dashboards, and key modules (profiles, attendance, homework, fees, messaging) with consistent Undo and online-only syncing behavior.

**Planned changes:**
- Add opening role-selection screen with exactly: “Student / Parent”, “Teacher”, “Non-Teaching Staff”, routing to phone + OTP login (no Chairperson option there).
- Implement phone number + OTP-only authentication for all roles, including a dedicated Chairperson login path; enforce profile completion (name + address/location) on first successful login; permanently link accounts to phone numbers.
- Define and enforce backend RBAC for Student, Teacher, Non-Teaching Staff, and Chairperson; Chairperson can view everything but cannot edit user profiles; users can edit only their own profile; validate authorization server-side for all restricted reads/writes.
- Create profile model + UI (name, phone, address/location) and store/retrieve it keyed to the authenticated phone number; add Undo for profile changes.
- Implement teacher/class assignments and attendance: only the form teacher can mark attendance for their assigned class; store attendance by class and date; provide role-appropriate attendance views; add Undo for attendance edits.
- Implement homework: teachers create/send to assigned classes; students/parents view homework; auto-refresh for near-real-time updates; add Undo for homework edits.
- Implement fees: track pending/paid/advance; only Chairperson can approve final fee changes; show school contact and chairperson contact in fees area; add Undo for fee edits.
- Implement messaging/announcements with notification panel: Chairperson broadcasts to all or selected groups; teachers send class-scoped notices/homework alerts; auto-refresh across sessions.
- Create role-specific dashboards and navigation visibility:
  - Student/Parent: attendance, homework, printable student ID card
  - Teacher: assigned classes, attendance marking, homework sending
  - Chairperson: full overview, fees summary, all users list
  - Non-Teaching Staff: mostly view-only dashboard with assigned notices
- Implement an app-wide Undo pattern for profile/attendance/homework/fees that restores the previous persisted state (permission-checked server-side).
- Build backend storage + APIs for users, attendance, homework, fees, messages to support required dashboard queries and role-permitted mutations for many simultaneous users.
- Enforce online-only syncing UX: disable sync-dependent actions while offline with clear messaging; resume automatic refresh when back online.
- Apply a consistent, school-friendly visual theme across the app (avoid blue/purple as primary colors).
- Add and use generated static IEMS branding assets served from frontend/public/assets/generated.

**User-visible outcome:** Users can select a role (or use a separate Chairperson login), sign in via phone+OTP, complete their profile on first login, and access a role-appropriate dashboard to view and (when permitted) manage attendance, homework, fees, and messages with automatic refresh, offline indicators, and Undo for major edits.
