# GroupSync V1 — Core + Authentication

Student group project coordination with Firebase Authentication and real-time Firestore database. Team members sign in and collaborate on shared projects.

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Framework        | React 18                            |
| Build Tool       | Vite 5                              |
| Auth             | Firebase Authentication (Google + Email) |
| Database         | Cloud Firestore (real-time sync)    |
| Icons            | lucide-react                        |
| Styling          | Plain CSS (per-component)           |
| State            | React Context + Firestore listeners |
| Testing          | Vitest                              |
| CI/CD            | GitHub Actions                      |
| Container        | Docker (multi-stage build)          |
| Fonts            | Instrument Serif + DM Sans          |

---

## Project Structure

```
groupsync/
├── .github/workflows/ci-cd.yml    # CI/CD pipeline
├── Dockerfile                      # Multi-stage Docker build
├── nginx.conf                      # Nginx config for SPA
├── .dockerignore
├── package.json
├── vite.config.js
├── vitest.config.js
├── index.html
├── README.md
├── docs/
│   └── AGILE_DOCUMENTATION.md      # User stories, sprints, retros
├── tests/
│   └── helpers.test.js             # Unit tests
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── App.css
    ├── config/
    │   └── firebase.js              # Firebase initialization
    ├── context/
    │   ├── AuthContext.jsx           # Login, register, Google auth
    │   └── GroupContext.jsx          # Firestore project management
    ├── components/
    │   ├── Sidebar/
    │   ├── GroupCard/
    │   ├── TaskCard/
    │   ├── Modal/
    │   ├── EmptyState/
    │   └── ProtectedRoute/
    └── pages/
        ├── Login/
        ├── Home/
        └── ProjectBoard/
```

---

## Firebase Setup (Required — Do This First)

### Step 1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it `groupsync`, click Continue
4. Disable Google Analytics (optional), click Create

### Step 2: Register Your Web App
1. On the project overview, click the **web icon** (`</>`)
2. Nickname: `groupsync`, click Register
3. You'll see a `firebaseConfig` object — **copy it**

### Step 3: Paste Your Config
Open `src/config/firebase.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← paste yours
  authDomain: "groupsync-xxx.firebaseapp.com",
  projectId: "groupsync-xxx",
  storageBucket: "groupsync-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Enable Authentication
1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** → Save
3. Enable **Google** → Select your support email → Save

### Step 5: Create Firestore Database
1. In Firebase Console → **Firestore Database** → **Create database**
2. Select **Start in test mode** (for development)
3. Choose the nearest region → Done

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up Firebase (see above)

# 3. Start the dev server
npm run dev

# 4. Run tests
npm test
```

---

## How Team Collaboration Works

1. **Person A** creates an account and creates a project
2. A 6-character project code is generated (e.g., `ABC123`)
3. **Person A** shares this code with teammates
4. **Person B, C, D** create accounts and click "Join Project"
5. They enter the code → they're added to the same project
6. All changes sync in real-time via Firestore

---

## V1 Features
- Google login + email/password registration
- Create / delete projects
- Share projects via 6-character codes
- Join existing projects by code
- Add / remove team members with emoji avatars
- Create tasks with title, description, priority, assignee
- Real-time sync — all team members see the same data
- Auto-save to Firestore cloud database

---

## Docker

```bash
docker build -t groupsync .
docker run -p 8080:80 groupsync
# Open http://localhost:8080
```

---

## Upcoming in V2
- Kanban board (To Do → In Progress → Review → Done)
- Drag-and-drop between columns
- Comments and discussion threads on tasks
