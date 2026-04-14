# GroupSync V2 — Kanban Board + Discussions

Builds on V1 with a drag-and-drop Kanban board and threaded task discussions.

## What's New in V2
- **Kanban Board** — 4 columns: To Do → In Progress → Review → Done
- **Drag & Drop** — Move tasks between columns by dragging
- **Task Detail Panel** — Click any task to edit status, priority, assignee
- **Status Pills** — Quick status change in the detail panel
- **Comments** — Threaded discussions on each task
- **Comment Badges** — See comment count on task cards
- **Progress Bar** — Mini done/total indicator in header

## New Files
- `components/KanbanColumn/` — Drop-target column
- `components/TaskDetailModal/` — Slide-out task panel
- `components/CommentThread/` — Discussion thread

## Updated Files
- `helpers.js` — Added STATUSES, getStatus(), formatDate()
- `GroupContext.jsx` — 4 new Firestore actions
- `TaskCard` — Draggable + comment badge
- `ProjectBoard` — Rewritten as Kanban layout

## Setup
```bash
npm install
npm run dev
```

## Git Update from V1
See instructions below for merging into your repo.
