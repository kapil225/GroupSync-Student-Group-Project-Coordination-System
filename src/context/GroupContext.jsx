/**
 * GroupContext.jsx — V1 with Firebase
 * 
 * Global state management using Firestore as the database.
 * 
 * HOW IT WORKS:
 *   Instead of localStorage, all data lives in Firebase Firestore.
 *   This means multiple team members can access the same project
 *   from different computers in real-time.
 * 
 * FIRESTORE STRUCTURE:
 *   projects/{projectId}
 *     ├── name: "CS101 Final Project"
 *     ├── ownerId: "firebase-user-id"
 *     ├── projectCode: "ABC123"         ← Team members use this to join
 *     ├── memberIds: ["uid1", "uid2"]   ← Who has access
 *     ├── members: [{ id, name, avatar, userId }]
 *     ├── tasks: [{ id, title, desc, priority, assigneeId }]
 *     └── createdAt: timestamp
 * 
 * JOINING A PROJECT:
 *   1. One person creates the project (gets a 6-character code)
 *   2. Other team members click "Join Project" and enter the code
 *   3. They're added to the project's memberIds array
 *   4. Now they can see and edit the same project
 * 
 * ACTIONS:
 *   Navigation:   NAVIGATE_HOME, OPEN_PROJECT
 *   Groups:       CREATE_GROUP, DELETE_GROUP, JOIN_GROUP
 *   Members:      ADD_MEMBER, REMOVE_MEMBER
 *   Tasks:        CREATE_TASK, DELETE_TASK
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

const GroupContext = createContext(null);


export function GroupProvider({ children }) {
  const { user } = useAuth();

  // ── App State ──
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);


  /* ─────────────────────────────────────────────
     REAL-TIME LISTENER
     
     When the user is logged in, we listen to all projects
     where their UID is in the memberIds array.
     Firestore sends us updates automatically whenever
     the data changes (even from other users).
     ───────────────────────────────────────────── */

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Query: get all projects where this user is a member
    const projectsQuery = query(
      collection(db, 'projects'),
      where('memberIds', 'array-contains', user.uid)
    );

    // Listen for real-time changes
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setGroups(projectList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to projects:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  /* ─────────────────────────────────────────────
     GENERATE A 6-CHARACTER PROJECT CODE
     
     Used for joining a project. Simple but unique enough
     for a student project with small team sizes.
     ───────────────────────────────────────────── */

  const generateProjectCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O/0, I/1, S/5 confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };


  /* ─────────────────────────────────────────────
     DISPATCH — handles all state changes
     
     Works like a reducer but with async Firestore calls.
     ───────────────────────────────────────────── */

  const dispatch = useCallback(async (action) => {
    switch (action.type) {

      // ── NAVIGATION ──

      case 'NAVIGATE_HOME': {
        setView('home');
        setActiveGroupId(null);
        break;
      }

      case 'OPEN_PROJECT': {
        setView('project');
        setActiveGroupId(action.payload);
        break;
      }

      // ── CREATE PROJECT ──

      case 'CREATE_GROUP': {
        try {
          await addDoc(collection(db, 'projects'), {
            name: action.payload.name,
            ownerId: user.uid,
            projectCode: generateProjectCode(),
            memberIds: [user.uid],       // Creator is automatically a member
            members: [{
              id: generateId(),
              name: user.displayName || user.email,
              avatar: '🧑‍💻',
              userId: user.uid,
            }],
            tasks: [],
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error creating project:', error);
        }
        break;
      }

      // ── DELETE PROJECT ──

      case 'DELETE_GROUP': {
        try {
          await deleteDoc(doc(db, 'projects', action.payload));
          if (activeGroupId === action.payload) {
            setActiveGroupId(null);
            setView('home');
          }
        } catch (error) {
          console.error('Error deleting project:', error);
        }
        break;
      }

      // ── JOIN PROJECT (by code) ──

      case 'JOIN_GROUP': {
        try {
          const projectsRef = collection(db, 'projects');
          const joinQuery = query(projectsRef, where('projectCode', '==', action.payload.code));
          const snapshot = await getDocs(joinQuery);

          if (snapshot.empty) {
            alert('No project found with that code. Please check and try again.');
            return;
          }

          const projectDoc = snapshot.docs[0];
          const projectData = projectDoc.data();

          // Check if already a member
          if (projectData.memberIds.includes(user.uid)) {
            alert('You are already a member of this project!');
            return;
          }

          // Add user to the project
          await updateDoc(doc(db, 'projects', projectDoc.id), {
            memberIds: arrayUnion(user.uid),
            members: arrayUnion({
              id: generateId(),
              name: user.displayName || user.email,
              avatar: '🧑‍💻',
              userId: user.uid,
            }),
          });

          alert(`Joined "${projectData.name}" successfully!`);
        } catch (error) {
          console.error('Error joining project:', error);
        }
        break;
      }

      // ── ADD MEMBER (manual, without auth account) ──

      case 'ADD_MEMBER': {
        try {
          const { groupId, name, avatar } = action.payload;
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const newMember = {
            id: generateId(),
            name: name,
            avatar: avatar,
            userId: null,   // Not linked to a Firebase account
          };

          const updatedMembers = [...group.members, newMember];
          await updateDoc(doc(db, 'projects', groupId), {
            members: updatedMembers,
          });
        } catch (error) {
          console.error('Error adding member:', error);
        }
        break;
      }

      // ── REMOVE MEMBER ──

      case 'REMOVE_MEMBER': {
        try {
          const { groupId, memberId } = action.payload;
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const memberToRemove = group.members.find((m) => m.id === memberId);
          const updatedMembers = group.members.filter((m) => m.id !== memberId);

          // Unassign from tasks
          const updatedTasks = group.tasks.map((task) => {
            if (task.assigneeId === memberId) {
              return { ...task, assigneeId: null };
            }
            return task;
          });

          const updates = { members: updatedMembers, tasks: updatedTasks };

          // If the member has a Firebase account, remove from memberIds too
          if (memberToRemove?.userId) {
            updates.memberIds = arrayRemove(memberToRemove.userId);
          }

          await updateDoc(doc(db, 'projects', groupId), updates);
        } catch (error) {
          console.error('Error removing member:', error);
        }
        break;
      }

      // ── CREATE TASK ──

      case 'CREATE_TASK': {
        try {
          const { groupId, title, description, priority, assigneeId } = action.payload;
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const newTask = {
            id: generateId(),
            title: title,
            description: description || '',
            priority: priority || 'medium',
            assigneeId: assigneeId || null,
            createdAt: new Date().toISOString(),
          };

          const updatedTasks = [...group.tasks, newTask];
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: updatedTasks,
          });
        } catch (error) {
          console.error('Error creating task:', error);
        }
        break;
      }

      // ── DELETE TASK ──

      case 'DELETE_TASK': {
        try {
          const { groupId, taskId } = action.payload;
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const updatedTasks = group.tasks.filter((t) => t.id !== taskId);
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: updatedTasks,
          });
        } catch (error) {
          console.error('Error deleting task:', error);
        }
        break;
      }

      default:
        console.warn(`Unknown action: "${action.type}"`);
    }
  }, [user, groups, activeGroupId]);


  /* ─────────────────────────────────────────────
     CONTEXT VALUE
     ───────────────────────────────────────────── */

  const state = { groups, activeGroupId, view, loading };
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  return (
    <GroupContext.Provider value={{ state, dispatch, activeGroup }}>
      {children}
    </GroupContext.Provider>
  );
}


/* ─────────────────────────────────────────────
   HOOKS
   ───────────────────────────────────────────── */

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup() must be called inside <GroupProvider>.');
  return context;
}

export function useActiveGroup() {
  const { activeGroup } = useGroup();
  return activeGroup;
}
