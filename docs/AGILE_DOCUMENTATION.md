# GroupSync — Agile Documentation (V3)

## Sprint 3 — Admin Dashboard, Roles, Deadlines
**Duration:** 2 weeks
**Sprint Goal:** Role-based access control, Super Admin system dashboard, and deadline tracking.

### V3 User Stories
| ID    | User Story                                                                                    | Points |
|-------|-----------------------------------------------------------------------------------------------|--------|
| US-21 | As the first user to register, I want to automatically become Super Admin                     | 3      |
| US-22 | As Super Admin, I want to see ALL registered users with their roles and activity               | 5      |
| US-23 | As Super Admin, I want to see ALL projects with completion rates across the system              | 5      |
| US-24 | As Super Admin, I want a system-wide task distribution chart                                   | 3      |
| US-25 | As a project owner, I want only I can create/edit/delete tasks so members can't change things  | 5      |
| US-26 | As a member, I want to only drag tasks assigned to me so I track my own progress               | 3      |
| US-27 | As a member, I want to see a lock icon on tasks I can't edit so I know my permissions          | 2      |
| US-28 | As a project owner, I want to set deadlines on tasks so the team knows when things are due     | 3      |
| US-29 | As a student, I want to see overdue/urgent alerts at the top of the board                     | 3      |
| US-30 | As a student, I want a project dashboard with progress ring, status chart, member workload     | 5      |
| US-31 | As a member, I want to see a permission notice when viewing tasks I can't edit                 | 2      |
| US-32 | As a project owner, I want a crown icon next to my name so my role is visible                  | 1      |

### Sprint 3 Task Breakdown
| Task                                          | Assigned To | Status |
|-----------------------------------------------|-------------|--------|
| Add ROLES system to helpers.js                | Member 2    | Done   |
| Save users to Firestore on auth               | Member 2    | Done   |
| Auto-assign first user as Super Admin         | Member 2    | Done   |
| Build AdminDashboard page                     | Member 3    | Done   |
| Fetch ALL users + ALL projects for admin      | Member 2    | Done   |
| Add permission checks to GroupContext          | Member 2    | Done   |
| Add canEditTask / canDragTask helpers          | Member 2    | Done   |
| Update TaskCard with lock icon                | Member 3    | Done   |
| Update TaskDetailModal with permission notice | Member 3    | Done   |
| Hide create/edit buttons for non-owners       | Member 5    | Done   |
| Add deadline field to CREATE_TASK             | Member 5    | Done   |
| Build DeadlineAlert component                 | Member 5    | Done   |
| Add daysUntil() to helpers                    | Member 2    | Done   |
| Build Dashboard page (progress ring + charts) | Member 3    | Done   |
| Add admin link to Sidebar                     | Member 3    | Done   |
| Add crown icon for project owners             | Member 3    | Done   |
| Update unit tests for ROLES + daysUntil       | Member 4    | Done   |
| Update CI/CD pipeline                         | Member 4    | Done   |

### Sprint 3 Retrospective
**What went well:**
- Role system is clean — just 3 roles with clear permission boundaries
- Super Admin dashboard gives real system-wide visibility
- First-user-is-admin approach is simple and works perfectly for student teams
- Permission checks in GroupContext prevent unauthorized changes at the data layer

**What didn't go well:**
- Firestore security rules are still in test mode — should be tightened for production
- Admin dashboard fetches all data at once — could be slow with hundreds of projects
- No way to promote a member to owner or change roles after creation

**What we'd improve next:**
- Add Firestore security rules that enforce role-based access server-side
- Add pagination to admin dashboard for scalability
- Allow Super Admin to promote/demote users
- Add email notifications for deadline reminders

---

## Complete Feature Summary (V1 + V2 + V3)

### V1 — Core + Authentication
- Google login + email/password registration
- Create/delete projects with 6-character codes
- Join projects by code — real-time sync via Firestore
- Add/remove members with emoji avatars
- Create/assign/delete tasks with priority levels

### V2 — Kanban + Discussions
- 4-column Kanban board with drag-and-drop
- Task detail slide-out panel with status pills
- Threaded comments on tasks
- Mini progress bar in header

### V3 — Roles, Admin, Deadlines
- Role system: Super Admin / Owner / Member
- Super Admin dashboard — sees ALL users and ALL projects
- Permission-based task editing (owners only)
- Members can only drag their own assigned tasks
- Deadline tracking with date picker
- Overdue/urgent alert bar
- Project dashboard with progress ring and charts
- Lock icons and permission notices for read-only users

---

## Role Permissions Matrix

| Action                  | Super Admin | Owner | Member |
|-------------------------|-------------|-------|--------|
| See Admin Dashboard     | ✅          | ❌    | ❌     |
| Create Project          | ✅          | ✅    | ✅     |
| Delete Project          | ✅          | ✅ (own) | ❌  |
| Create Task             | ✅          | ✅    | ❌     |
| Edit Any Task           | ✅          | ✅    | ❌     |
| Delete Task             | ✅          | ✅    | ❌     |
| Drag Any Task           | ✅          | ✅    | ❌     |
| Drag Own Assigned Task  | ✅          | ✅    | ✅     |
| Add Comment             | ✅          | ✅    | ✅     |
| View Task Details       | ✅          | ✅    | ✅     |
| Add/Remove Members      | ✅          | ✅    | ❌     |
| See Project Dashboard   | ✅          | ✅    | ✅     |
