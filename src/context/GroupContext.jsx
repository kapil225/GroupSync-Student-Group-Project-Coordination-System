/**
 * GroupContext.jsx — V3
 * 
 * V3 adds:
 *   - NAVIGATE_DASHBOARD, NAVIGATE_ADMIN
 *   - Task deadlines
 *   - Permission checks: only owner/creator can edit tasks, members can only drag their own
 *   - getUserRole(groupId) helper
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, deleteDoc, updateDoc, query, where, onSnapshot, arrayUnion, arrayRemove, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [view, setView] = useState('home'); // 'home' | 'board' | 'dashboard' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setGroups([]); setLoading(false); return; }
    const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const generateProjectCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  /**
   * V3: Check user's role in a specific project.
   * Returns 'owner' | 'member' | null
   */
  const getUserProjectRole = useCallback((groupId) => {
    if (!user) return null;
    const g = groups.find((x) => x.id === groupId);
    if (!g) return null;
    if (g.ownerId === user.uid) return 'owner';
    if (g.memberIds?.includes(user.uid)) return 'member';
    return null;
  }, [user, groups]);

  /**
   * V3: Check if user can edit a specific task.
   * Owner can edit any task. Members can only update status of tasks assigned to them.
   */
  const canEditTask = useCallback((groupId, task) => {
    if (!user) return false;
    const role = getUserProjectRole(groupId);
    if (role === 'owner') return true;
    // Task creator can edit their own task
    if (task.createdBy === user.uid) return true;
    return false;
  }, [user, getUserProjectRole]);

  /**
   * V3: Check if user can drag a task (update status).
   * Owner can drag any. Members can only drag tasks assigned to them.
   */
  const canDragTask = useCallback((groupId, task) => {
    if (!user) return false;
    const role = getUserProjectRole(groupId);
    if (role === 'owner') return true;
    // Members can only drag their own assigned tasks
    const member = groups.find((g) => g.id === groupId)?.members?.find((m) => m.userId === user.uid);
    if (member && task.assigneeId === member.id) return true;
    return false;
  }, [user, groups, getUserProjectRole]);

  const dispatch = useCallback(async (action) => {
    switch (action.type) {

      case 'NAVIGATE_HOME': { setView('home'); setActiveGroupId(null); break; }
      case 'OPEN_PROJECT': { setView('board'); setActiveGroupId(action.payload); break; }
      case 'NAVIGATE_DASHBOARD': { setView('dashboard'); break; }
      case 'NAVIGATE_ADMIN': { setView('admin'); setActiveGroupId(null); break; }

      case 'CREATE_GROUP': {
        try {
          await addDoc(collection(db, 'projects'), {
            name: action.payload.name,
            ownerId: user.uid,
            ownerName: user.displayName || user.email,
            projectCode: generateProjectCode(),
            memberIds: [user.uid],
            members: [{ id: generateId(), name: user.displayName || user.email, avatar: '🧑‍💻', userId: user.uid }],
            tasks: [],
            createdAt: serverTimestamp(),
          });
        } catch (e) { console.error(e); }
        break;
      }

      case 'DELETE_GROUP': {
        try {
          const g = groups.find((x) => x.id === action.payload);
          if (g?.ownerId !== user.uid) { alert('Only the project owner can delete this project.'); return; }
          await deleteDoc(doc(db, 'projects', action.payload));
          if (activeGroupId === action.payload) { setActiveGroupId(null); setView('home'); }
        } catch (e) { console.error(e); }
        break;
      }

      case 'JOIN_GROUP': {
        try {
          const snap = await getDocs(query(collection(db, 'projects'), where('projectCode', '==', action.payload.code)));
          if (snap.empty) { alert('No project found with that code.'); return; }
          const projDoc = snap.docs[0];
          if (projDoc.data().memberIds.includes(user.uid)) { alert('Already a member!'); return; }
          await updateDoc(doc(db, 'projects', projDoc.id), {
            memberIds: arrayUnion(user.uid),
            members: arrayUnion({ id: generateId(), name: user.displayName || user.email, avatar: '🧑‍💻', userId: user.uid }),
          });
          alert(`Joined "${projDoc.data().name}"!`);
        } catch (e) { console.error(e); }
        break;
      }

      case 'ADD_MEMBER': {
        try {
          const { groupId, name, avatar } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          if (g.ownerId !== user.uid) { alert('Only the project owner can add members.'); return; }
          await updateDoc(doc(db, 'projects', groupId), { members: [...g.members, { id: generateId(), name, avatar, userId: null }] });
        } catch (e) { console.error(e); }
        break;
      }

      case 'REMOVE_MEMBER': {
        try {
          const { groupId, memberId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          if (g.ownerId !== user.uid) { alert('Only the project owner can remove members.'); return; }
          const member = g.members.find((m) => m.id === memberId);
          const updates = { members: g.members.filter((m) => m.id !== memberId), tasks: g.tasks.map((t) => t.assigneeId === memberId ? { ...t, assigneeId: null } : t) };
          if (member?.userId) updates.memberIds = arrayRemove(member.userId);
          await updateDoc(doc(db, 'projects', groupId), updates);
        } catch (e) { console.error(e); }
        break;
      }

      case 'CREATE_TASK': {
        try {
          const { groupId, title, description, priority, assigneeId, deadline } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          if (g.ownerId !== user.uid) { alert('Only the project owner can create tasks.'); return; }
          const newTask = {
            id: generateId(), title, description: description || '', priority: priority || 'medium',
            status: 'todo', assigneeId: assigneeId || null,
            deadline: deadline || null,
            comments: [], createdBy: user.uid, createdAt: new Date().toISOString(),
          };
          await updateDoc(doc(db, 'projects', groupId), { tasks: [...g.tasks, newTask] });
        } catch (e) { console.error(e); }
        break;
      }

      case 'DELETE_TASK': {
        try {
          const { groupId, taskId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const task = g.tasks.find((t) => t.id === taskId);
          if (g.ownerId !== user.uid && task?.createdBy !== user.uid) { alert('Only the project owner or task creator can delete tasks.'); return; }
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.filter((t) => t.id !== taskId) });
        } catch (e) { console.error(e); }
        break;
      }

      case 'UPDATE_TASK_STATUS': {
        try {
          const { groupId, taskId, status } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.map((t) => t.id === taskId ? { ...t, status } : t) });
        } catch (e) { console.error(e); }
        break;
      }

      case 'UPDATE_TASK': {
        try {
          const { groupId, taskId, updates } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t) });
        } catch (e) { console.error(e); }
        break;
      }

      case 'ADD_COMMENT': {
        try {
          const { groupId, taskId, authorId, text } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const comment = { id: generateId(), authorId, text, createdBy: user.uid, createdAt: new Date().toISOString() };
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.map((t) => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t) });
        } catch (e) { console.error(e); }
        break;
      }

      case 'DELETE_COMMENT': {
        try {
          const { groupId, taskId, commentId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.map((t) => t.id === taskId ? { ...t, comments: (t.comments || []).filter((c) => c.id !== commentId) } : t) });
        } catch (e) { console.error(e); }
        break;
      }

      default: console.warn(`Unknown: "${action.type}"`);
    }
  }, [user, groups, activeGroupId]);

  const state = { groups, activeGroupId, view, loading };
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  return (
    <GroupContext.Provider value={{ state, dispatch, activeGroup, getUserProjectRole, canEditTask, canDragTask }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() { const c = useContext(GroupContext); if (!c) throw new Error('useGroup needs GroupProvider'); return c; }
export function useActiveGroup() { return useGroup().activeGroup; }
