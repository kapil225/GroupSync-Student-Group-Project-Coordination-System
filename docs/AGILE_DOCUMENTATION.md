# GroupSync — Agile Documentation (V1)

## Product Vision
GroupSync is a web-based student group project coordination tool with real-time collaboration via Firebase Authentication and Firestore database.

---

## Team Composition
| Member   | Role              | Responsibilities                                    |
|----------|-------------------|-----------------------------------------------------|
| Member 1 | Scrum Master      | Sprint planning, stand-ups, retrospectives          |
| Member 2 | Lead Developer    | State management, Firebase integration, core logic  |
| Member 3 | Frontend Dev      | UI/UX design, CSS styling, responsive layout        |
| Member 4 | DevOps Engineer   | CI/CD pipeline, Docker, deployment, testing         |
| Member 5 | Developer / QA    | Feature development, unit tests, bug fixing         |

---

## Product Backlog — V1 User Stories

| ID    | User Story                                                                                   | Priority | Points |
|-------|----------------------------------------------------------------------------------------------|----------|--------|
| US-01 | As a student, I want to register with email/password so that I have my own account           | Must     | 3      |
| US-02 | As a student, I want to sign in with Google so that login is quick and easy                  | Must     | 3      |
| US-03 | As a student, I want to create a new project so that I can organize my team's work           | Must     | 3      |
| US-04 | As a student, I want to see a project code so that I can share it with my team               | Must     | 2      |
| US-05 | As a student, I want to join a project by entering a code so that I can collaborate           | Must     | 5      |
| US-06 | As a team lead, I want to add members with names and avatars so that everyone is identifiable | Must     | 3      |
| US-07 | As a team lead, I want to remove members from the project                                    | Must     | 2      |
| US-08 | As a student, I want to create tasks with title, description, and priority                    | Must     | 3      |
| US-09 | As a team lead, I want to assign tasks to specific members                                   | Must     | 3      |
| US-10 | As a student, I want to delete tasks I no longer need                                        | Must     | 1      |
| US-11 | As a student, I want my data to sync in real-time so all team members see the same thing     | Must     | 5      |
| US-12 | As a student, I want to log out securely                                                     | Must     | 1      |

---

## Sprint 1 Plan
**Duration:** 2 weeks
**Sprint Goal:** Users can register, login, create/join projects, and manage tasks with real-time sync.

| Story ID | Task                                    | Assigned To | Status |
|----------|-----------------------------------------|-------------|--------|
| US-01    | Build AuthContext with email registration | Member 2   | Done   |
| US-02    | Add Google sign-in via Firebase          | Member 2    | Done   |
| US-03    | Build GroupContext with Firestore        | Member 2    | Done   |
| US-04    | Generate and display project codes       | Member 5    | Done   |
| US-05    | Build Join Project modal and logic       | Member 5    | Done   |
| US-06    | Build Add Member modal + avatar picker   | Member 3    | Done   |
| US-07    | Add Remove Member functionality          | Member 2    | Done   |
| US-08    | Build Create Task modal                  | Member 5    | Done   |
| US-09    | Add assignee dropdown to task form       | Member 5    | Done   |
| US-10    | Add delete task functionality            | Member 2    | Done   |
| US-11    | Set up Firestore real-time listener      | Member 2    | Done   |
| US-12    | Add logout button to sidebar             | Member 3    | Done   |
| —        | Set up Firebase project                  | Member 4    | Done   |
| —        | Build Login/Register page                | Member 3    | Done   |
| —        | Build ProtectedRoute component           | Member 2    | Done   |
| —        | Set up GitHub repo + branching           | Member 4    | Done   |
| —        | Set up CI/CD pipeline                    | Member 4    | Done   |
| —        | Create Dockerfile                        | Member 4    | Done   |
| —        | Write unit tests                         | Member 4    | Done   |
| —        | Design CSS system (index.css)            | Member 3    | Done   |

**Velocity:** 34 story points

---

## Sprint 1 Retrospective

**What went well:**
- Firebase Auth setup was surprisingly smooth — Google login worked on first try
- Firestore's real-time listener (onSnapshot) eliminated the need for manual refresh
- Project code system is simple but effective for team collaboration
- CI/CD pipeline catches test failures automatically

**What didn't go well:**
- Firestore security rules were initially too permissive (test mode)
- Some team members had trouble understanding async/await with Firebase
- The task list is a flat grid — not ideal for tracking progress

**What we'll improve in V2:**
- Add a Kanban board for visual task tracking
- Add comments/discussion on tasks
- Tighten Firestore security rules

---

## Version Control Workflow
```
main ──── (V1 complete, tagged v1.0)

Commands used:
  git init, git add ., git commit, git tag v1.0
  git remote add origin, git push -u origin main
```

---

## DevOps Integration

| Practice               | Tool / Implementation                              |
|------------------------|-----------------------------------------------------|
| Version Control        | Git + GitHub                                        |
| CI (Continuous Integration) | GitHub Actions — runs tests on every push       |
| CD (Continuous Deployment)  | GitHub Actions → GitHub Pages                   |
| Containerization       | Docker multi-stage build (Node.js build → Nginx)    |
| Unit Testing           | Vitest — tests for utility functions                |
| Authentication         | Firebase Auth (Google + Email/Password)             |
| Database               | Cloud Firestore (real-time NoSQL)                   |
