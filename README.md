# GroupSync V3 — Roles, Admin Dashboard, Deadlines

Complete student project coordination system with role-based access control, system administration, and deadline tracking.

## What's New in V3

### Role System
- **Super Admin** — First user to register. Sees ALL users, ALL projects, system-wide analytics
- **Project Owner** — Created the project. Can create/edit/delete tasks, add/remove members
- **Member** — Can only drag tasks assigned to them. Can comment on any task. Cannot edit or create tasks

### Super Admin Dashboard
- Total registered users with roles
- All projects across the system with completion rates
- System-wide task distribution chart
- Per-user activity breakdown

### Permissions
- Non-owners see "View only" notice — create/edit buttons hidden
- Lock icon on tasks members can't drag
- Permission notice in task detail panel
- Crown icon marks the project owner

### Deadlines
- Date picker when creating tasks and in detail panel
- Overdue (red) and urgent (orange) alert bar
- Deadline indicators on task cards
- Upcoming deadlines in project dashboard

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build | Vite 5 |
| Auth | Firebase Authentication (Google + Email) |
| Database | Cloud Firestore (real-time) |
| Icons | lucide-react |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Container | Docker |

## Setup
```bash
npm install
# Add your Firebase config to src/config/firebase.js (or use .env)
npm run dev
```

## How Roles Work
1. First person to register → automatically becomes **Super Admin**
2. When someone creates a project → they are the **Owner** of that project
3. When someone joins via code → they are a **Member** of that project
4. Super Admin can access the admin dashboard from the sidebar
