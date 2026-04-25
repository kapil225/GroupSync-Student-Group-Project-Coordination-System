# GroupSync V4 — Strict RBAC, Audit Logging, Fixed Comments

## What's New in V4

### Strict Role-Based Access Control (RBAC)
| Action | Project Owner | Assigned User | Other Members |
|---|---|---|---|
| Create Task | ✅ | ❌ | ❌ |
| View Task | ✅ (all) | ✅ (theirs only) | ❌ |
| Update Task | ✅ (all fields) | ✅ (status only) | ❌ |
| Delete Task | ✅ | ❌ | ❌ |
| Add Comment | ✅ (any task) | ✅ (their task) | ❌ |
| View Comments | ✅ (any task) | ✅ (their task) | ❌ |
| Add/Remove Members | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |

### Fixed Comment Section
- Comments now save correctly to Firestore (was failing silently)
- Comments persist after page refresh (proper array handling)
- Each comment linked to: taskId, userId (authorUserId), memberId (authorId)
- Input validation: non-empty, max 1000 characters
- Only owner/assignee can add/view comments (403 for others)
- Comment author or owner can delete comments

### Audit Logging
- Every action logged to Firestore subcollection: `projects/{id}/auditLog`
- Logs: action type, userId, userName, details, timestamp
- Unauthorized attempts logged as UNAUTHORIZED_ACCESS
- Audit Log page accessible from sidebar (Super Admin only)
- Shows last 100 actions with color-coded icons

### Task Visibility
- Members ONLY see tasks assigned to them on the Kanban board
- Members cannot see other members' tasks at all
- Owner sees all tasks across all columns
- "Member — viewing your tasks only" badge in header

### UI Permission Enforcement
- Create/Edit/Delete buttons hidden for unauthorized users
- Lock icons on restricted fields in task detail panel
- Permission notice banners (blue for limited access, red for no access)
- Disabled form controls with visual feedback

## Setup
```bash
npm install
npm run dev
npm test       # 40+ tests including permission engine
```

## Authorization Flow
```
User Action → dispatch() → Permission Check → Authorized?
                                                  │
                              ┌────────────────────┴────────────────────┐
                              │ YES                                     │ NO
                              ▼                                         ▼
                    Firestore Mutation                          403 Alert
                    + Audit Log Entry                    + UNAUTHORIZED Audit Log
                    + Real-time Sync                     + Action Blocked
```
