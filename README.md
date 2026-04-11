# GroupSync V1 — Student Group Project Coordination

A clean, component-based project coordination tool for student group work.

---

## Tech Stack

| Layer          | Technology               |
|----------------|--------------------------|
| Framework      | React 18                 |
| Build Tool     | Vite 5                   |
| Language       | JavaScript (JSX)         |
| Icons          | lucide-react             |
| IDs            | uuid                     |
| Styling        | Plain CSS (per-component)|
| State          | React Context + useReducer |
| Persistence    | localStorage             |
| Fonts          | Instrument Serif + DM Sans (Google Fonts) |

---

## Project Structure

```
groupsync-v1/
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── README.md
└── src/
    ├── main.jsx                # React DOM mount
    ├── index.css               # Global styles & CSS variables
    ├── App.jsx                 # Root layout + routing
    ├── App.css                 # Layout styles
    ├── utils/
    │   └── helpers.js          # IDs, constants, storage utils
    ├── context/
    │   └── GroupContext.jsx     # Global state (useReducer + Context)
    ├── components/
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx     # Navigation sidebar
    │   │   └── Sidebar.css
    │   ├── GroupCard/
    │   │   ├── GroupCard.jsx    # Project card on home page
    │   │   └── GroupCard.css
    │   ├── TaskCard/
    │   │   ├── TaskCard.jsx    # Individual task display
    │   │   └── TaskCard.css
    │   ├── Modal/
    │   │   ├── Modal.jsx       # Reusable modal dialog
    │   │   └── Modal.css
    │   └── EmptyState/
    │       ├── EmptyState.jsx  # Empty placeholder
    │       └── EmptyState.css
    └── pages/
        ├── Home/
        │   ├── Home.jsx        # Projects overview grid
        │   └── Home.css
        └── ProjectBoard/
            ├── ProjectBoard.jsx # Group detail: members + tasks
            └── ProjectBoard.css
```

---

## V1 Features

- **Create Projects** — Name and manage multiple group projects
- **Add Members** — Add team members with name and emoji avatar
- **Create Tasks** — Title, description, priority (low/medium/high)
- **Assign Tasks** — Assign tasks to specific members
- **Delete** — Remove projects, members, or tasks
- **Persistence** — All data saved to localStorage automatically

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Build for production
npm run build
```

---

## Upcoming in V2

- Task status flow (To Do → In Progress → Review → Done)
- Kanban drag-and-drop board
- Comments & discussion threads on tasks

## Upcoming in V3

- Progress dashboard with charts
- Deadline tracking & alerts
- Per-member analytics
