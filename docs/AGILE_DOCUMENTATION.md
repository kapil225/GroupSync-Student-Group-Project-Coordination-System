# GroupSync — Agile Documentation (V4)

## Sprint 4 — Strict RBAC, Audit Logging, Bug Fixes
**Duration:** 2 weeks
**Sprint Goal:** Enforce strict task-level authorization, fix comment persistence bug, add audit trail.

### V4 User Stories
| ID | User Story | Points |
|---|---|---|
| US-33 | As a project owner, I want only I can create/delete tasks so members cannot change project structure | 5 |
| US-34 | As a member, I want to only see tasks assigned to me so I'm not overwhelmed | 5 |
| US-35 | As a member, I want to update only the status of my assigned tasks | 3 |
| US-36 | As a member, I should NOT see other members' tasks for privacy | 3 |
| US-37 | As a project owner, I want comments to save properly and persist after refresh (BUG FIX) | 5 |
| US-38 | As a user, I want each comment linked to a specific task and author | 2 |
| US-39 | As a project owner, I want an audit log showing who did what and when | 5 |
| US-40 | As Super Admin, I want to see unauthorized access attempts in the audit log | 3 |
| US-41 | As a member, I want clear visual feedback when I lack permission for an action | 2 |
| US-42 | As a project owner, I want input validation on all task/comment fields | 2 |

### Sprint 4 Retrospective
**What went well:** Permissions engine is centralized in helpers.js making it testable. Audit logging catches unauthorized attempts. Comment bug was a simple array handling issue — fixed cleanly.

**What didn't go well:** Firestore security rules still rely on client-side checks. The audit subcollection query requires a composite index.

**What we'd improve:** Add Firestore security rules that mirror the client-side permission logic. Add pagination to the audit log. Add real-time audit log updates via onSnapshot.

## Permissions Matrix (Complete)
| Action | Super Admin | Owner | Assignee | Other Member |
|---|---|---|---|---|
| System Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| Create Project | ✅ | ✅ | ✅ | ✅ |
| Delete Project | ✅ | ✅ (own) | ❌ | ❌ |
| Create Task | ✅ | ✅ | ❌ | ❌ |
| View Any Task | ✅ | ✅ | ❌ | ❌ |
| View Own Task | ✅ | ✅ | ✅ | ❌ |
| Edit Any Task | ✅ | ✅ | ❌ | ❌ |
| Edit Own Status | ✅ | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | ❌ | ❌ |
| Comment (any task) | ✅ | ✅ | ❌ | ❌ |
| Comment (own task) | ✅ | ✅ | ✅ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ |
| View Audit Log | ✅ | ❌ | ❌ | ❌ |
