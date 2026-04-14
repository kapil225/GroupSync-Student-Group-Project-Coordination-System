/**
 * GroupContext.jsx — V2 with Firebase
 * 
 * V2 adds: UPDATE_TASK_STATUS, UPDATE_TASK, ADD_COMMENT, DELETE_COMMENT
 * Tasks now have: status ('todo','in_progress','review','done') and comments[]
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
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);

  // Real-time Firestore listener
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

  const dispatch = useCallback(async (action) => {
    switch (action.type) {

      case 'NAVIGATE_HOME': { setView('home'); setActiveGroupId(null); break; }
      case 'OPEN_PROJECT': { setView('project'); setActiveGroupId(action.payload); break; }

      case 'CREATE_GROUP': {
        try {
          await addDoc(collection(db, 'projects'), {
            name: action.payload.name,
            ownerId: user.uid,
            projectCode: generateProjectCode(),
            memberIds: [user.uid],
            members: [{ id: generateId(), name: user.displayName || user.email, avatar: '🧑‍💻', userId: user.uid }],
            tasks: [],
            createdAt: serverTimestamp(),
          });
        } catch (e) { console.error('Error creating project:', e); }
        break;
      }

      case 'DELETE_GROUP': {
        try {
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
          await updateDoc(doc(db, 'projects', groupId), { members: [...g.members, { id: generateId(), name, avatar, userId: null }] });
        } catch (e) { console.error(e); }
        break;
      }

      case 'REMOVE_MEMBER': {
        try {
          const { groupId, memberId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const member = g.members.find((m) => m.id === memberId);
          const updates = {
            members: g.members.filter((m) => m.id !== memberId),
            tasks: g.tasks.map((t) => t.assigneeId === memberId ? { ...t, assigneeId: null } : t),
          };
          if (member?.userId) updates.memberIds = arrayRemove(member.userId);
          await updateDoc(doc(db, 'projects', groupId), updates);
        } catch (e) { console.error(e); }
        break;
      }

      case 'CREATE_TASK': {
        try {
          const { groupId, title, description, priority, assigneeId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const newTask = {
            id: generateId(), title, description: description || '', priority: priority || 'medium',
            status: 'todo',        // V2: default status
            assigneeId: assigneeId || null,
            comments: [],          // V2: empty comments
            createdAt: new Date().toISOString(),
          };
          await updateDoc(doc(db, 'projects', groupId), { tasks: [...g.tasks, newTask] });
        } catch (e) { console.error(e); }
        break;
      }

      case 'DELETE_TASK': {
        try {
          const { groupId, taskId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.filter((t) => t.id !== taskId) });
        } catch (e) { console.error(e); }
        break;
      }

      // ═══════════════════════════════════════
      // V2 NEW ACTIONS
      // ═══════════════════════════════════════

      case 'UPDATE_TASK_STATUS': {
        try {
          const { groupId, taskId, status } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) => t.id === taskId ? { ...t, status } : t),
          });
        } catch (e) { console.error(e); }
        break;
      }

      case 'UPDATE_TASK': {
        try {
          const { groupId, taskId, updates } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
          });
        } catch (e) { console.error(e); }
        break;
      }

      case 'ADD_COMMENT': {
        try {
          const { groupId, taskId, authorId, text } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const comment = { id: generateId(), authorId, text, createdAt: new Date().toISOString() };
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t),
          });
        } catch (e) { console.error(e); }
        break;
      }

      case 'DELETE_COMMENT': {
        try {
          const { groupId, taskId, commentId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) => t.id === taskId ? { ...t, comments: (t.comments || []).filter((c) => c.id !== commentId) } : t),
          });
        } catch (e) { console.error(e); }
        break;
      }

      default: console.warn(`Unknown action: "${action.type}"`);
    }
  }, [user, groups, activeGroupId]);

  const state = { groups, activeGroupId, view, loading };
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  return <GroupContext.Provider value={{ state, dispatch, activeGroup }}>{children}</GroupContext.Provider>;
}

export function useGroup() { const c = useContext(GroupContext); if (!c) throw new Error('useGroup needs GroupProvider'); return c; }
export function useActiveGroup() { return useGroup().activeGroup; }
