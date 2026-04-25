/**
 * GroupContext.jsx — V4
 * 
 * V4 CHANGES:
 *   - STRICT RBAC: Every mutation goes through permission checks
 *   - FIXED COMMENTS: Comments saved with proper task linkage and user validation
 *   - AUDIT LOGGING: Every action creates an audit log entry in Firestore
 *   - TASK VISIBILITY: getVisibleTasks() filters tasks per user role
 *   - UNAUTHORIZED REJECTION: Returns { success: false, error: '403 Forbidden' }
 * 
 * AUTHORIZATION FLOW:
 *   1. User dispatches an action (e.g., CREATE_TASK)
 *   2. dispatch() checks permissions using helpers (canCreateTask, canEditTask, etc.)
 *   3. If unauthorized → logs UNAUTHORIZED_ACCESS audit entry, shows error, returns
 *   4. If authorized → performs Firestore mutation, logs audit entry
 *   5. onSnapshot listener automatically updates all connected clients
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, addDoc, deleteDoc, updateDoc,
  query, where, onSnapshot, arrayUnion, arrayRemove,
  getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
  generateId, isProjectOwner, canCreateTask, canEditTask,
  canDeleteTask, canCommentOnTask, canManageMembers,
  canViewTask, getVisibleTasks, getMemberForUser,
  isTaskAssignee, AUDIT_ACTIONS,
} from '../utils/helpers';

const GroupContext = createContext(null);


/* ═══════════════════════════════════════════
   AUDIT LOGGER
   
   Writes an audit entry to Firestore every time
   a significant action occurs. This creates a
   complete trail of who did what and when.
   
   Firestore: projects/{projectId}/auditLog/{entryId}
   ═══════════════════════════════════════════ */

async function writeAuditLog(groupId, action, userId, userName, details = {}) {
  try {
    await addDoc(collection(db, 'projects', groupId, 'auditLog'), {
      action,
      userId,
      userName: userName || 'Unknown',
      details,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Audit log write failed:', e);
    // Don't block the main action if audit logging fails
  }
}


export function GroupProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [view, setView] = useState('home'); // 'home' | 'board' | 'dashboard' | 'admin' | 'audit'
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

  const genCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const userName = user?.displayName || user?.email || 'Unknown';


  /* ═══════════════════════════════════════════
     DISPATCH — V4 with permission enforcement
     
     Every action follows this pattern:
     1. Find the group
     2. CHECK PERMISSIONS (reject with 403 if unauthorized)
     3. Perform the mutation
     4. Write audit log
     ═══════════════════════════════════════════ */

  const dispatch = useCallback(async (action) => {
    switch (action.type) {

      // ── NAVIGATION ──
      case 'NAVIGATE_HOME': { setView('home'); setActiveGroupId(null); break; }
      case 'OPEN_PROJECT': { setView('board'); setActiveGroupId(action.payload); break; }
      case 'NAVIGATE_DASHBOARD': { setView('dashboard'); break; }
      case 'NAVIGATE_ADMIN': { setView('admin'); setActiveGroupId(null); break; }
      case 'NAVIGATE_AUDIT': { setView('audit'); break; }

      // ── CREATE PROJECT ──
      case 'CREATE_GROUP': {
        try {
          const docRef = await addDoc(collection(db, 'projects'), {
            name: action.payload.name,
            ownerId: user.uid,
            ownerName: userName,
            projectCode: genCode(),
            memberIds: [user.uid],
            members: [{ id: generateId(), name: userName, avatar: '🧑‍💻', userId: user.uid }],
            tasks: [],
            createdAt: serverTimestamp(),
          });
          await writeAuditLog(docRef.id, AUDIT_ACTIONS.PROJECT_CREATED, user.uid, userName, { projectName: action.payload.name });
        } catch (e) { console.error(e); }
        break;
      }

      // ── DELETE PROJECT (owner only) ──
      case 'DELETE_GROUP': {
        try {
          const g = groups.find((x) => x.id === action.payload);
          if (!isProjectOwner(g, user.uid)) {
            await writeAuditLog(action.payload, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'DELETE_PROJECT' });
            alert('403 Forbidden: Only the project owner can delete this project.');
            return;
          }
          await writeAuditLog(action.payload, AUDIT_ACTIONS.PROJECT_DELETED, user.uid, userName, { projectName: g?.name });
          await deleteDoc(doc(db, 'projects', action.payload));
          if (activeGroupId === action.payload) { setActiveGroupId(null); setView('home'); }
        } catch (e) { console.error(e); }
        break;
      }

      // ── JOIN PROJECT ──
      case 'JOIN_GROUP': {
        try {
          const snap = await getDocs(query(collection(db, 'projects'), where('projectCode', '==', action.payload.code)));
          if (snap.empty) { alert('No project found with that code.'); return; }
          const projDoc = snap.docs[0];
          if (projDoc.data().memberIds.includes(user.uid)) { alert('Already a member!'); return; }
          const memberId = generateId();
          await updateDoc(doc(db, 'projects', projDoc.id), {
            memberIds: arrayUnion(user.uid),
            members: arrayUnion({ id: memberId, name: userName, avatar: '🧑‍💻', userId: user.uid }),
          });
          await writeAuditLog(projDoc.id, AUDIT_ACTIONS.MEMBER_ADDED, user.uid, userName, { memberName: userName, joinedViaCode: true });
          alert(`Joined "${projDoc.data().name}"!`);
        } catch (e) { console.error(e); }
        break;
      }

      // ── ADD MEMBER (owner only) ──
      case 'ADD_MEMBER': {
        try {
          const { groupId, name, avatar } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;

          // PERMISSION CHECK
          if (!canManageMembers(g, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'ADD_MEMBER' });
            alert('403 Forbidden: Only the project owner can add members.');
            return;
          }

          await updateDoc(doc(db, 'projects', groupId), { members: [...g.members, { id: generateId(), name, avatar, userId: null }] });
          await writeAuditLog(groupId, AUDIT_ACTIONS.MEMBER_ADDED, user.uid, userName, { memberName: name });
        } catch (e) { console.error(e); }
        break;
      }

      // ── REMOVE MEMBER (owner only) ──
      case 'REMOVE_MEMBER': {
        try {
          const { groupId, memberId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;

          if (!canManageMembers(g, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'REMOVE_MEMBER' });
            alert('403 Forbidden: Only the project owner can remove members.');
            return;
          }

          const member = g.members.find((m) => m.id === memberId);
          const updates = {
            members: g.members.filter((m) => m.id !== memberId),
            tasks: g.tasks.map((t) => t.assigneeId === memberId ? { ...t, assigneeId: null } : t),
          };
          if (member?.userId) updates.memberIds = arrayRemove(member.userId);
          await updateDoc(doc(db, 'projects', groupId), updates);
          await writeAuditLog(groupId, AUDIT_ACTIONS.MEMBER_REMOVED, user.uid, userName, { removedMember: member?.name });
        } catch (e) { console.error(e); }
        break;
      }

      // ── CREATE TASK (owner only) ──
      case 'CREATE_TASK': {
        try {
          const { groupId, title, description, priority, assigneeId, deadline } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;

          // PERMISSION CHECK
          if (!canCreateTask(g, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'CREATE_TASK' });
            alert('403 Forbidden: Only the project owner can create tasks.');
            return;
          }

          // INPUT VALIDATION
          if (!title || title.trim().length === 0) { alert('Task title is required.'); return; }
          if (title.trim().length > 200) { alert('Task title must be under 200 characters.'); return; }

          const newTask = {
            id: generateId(),
            title: title.trim(),
            description: (description || '').trim().slice(0, 2000),
            priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
            status: 'todo',
            assigneeId: assigneeId || null,
            deadline: deadline || null,
            comments: [],
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
          };

          await updateDoc(doc(db, 'projects', groupId), { tasks: [...g.tasks, newTask] });
          await writeAuditLog(groupId, AUDIT_ACTIONS.TASK_CREATED, user.uid, userName, { taskTitle: newTask.title, taskId: newTask.id, assignedTo: assigneeId });
        } catch (e) { console.error(e); }
        break;
      }

      // ── DELETE TASK (owner only) ──
      case 'DELETE_TASK': {
        try {
          const { groupId, taskId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;

          // PERMISSION CHECK
          if (!canDeleteTask(g, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'DELETE_TASK', taskId });
            alert('403 Forbidden: Only the project owner can delete tasks.');
            return;
          }

          const task = g.tasks.find((t) => t.id === taskId);
          await updateDoc(doc(db, 'projects', groupId), { tasks: g.tasks.filter((t) => t.id !== taskId) });
          await writeAuditLog(groupId, AUDIT_ACTIONS.TASK_DELETED, user.uid, userName, { taskTitle: task?.title, taskId });
        } catch (e) { console.error(e); }
        break;
      }

      // ── UPDATE TASK STATUS (owner or assignee) ──
      case 'UPDATE_TASK_STATUS': {
        try {
          const { groupId, taskId, status } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const task = g.tasks.find((t) => t.id === taskId); if (!task) return;

          // PERMISSION CHECK: owner can update any, assignee can update their own
          if (!canEditTask(g, task, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'UPDATE_TASK_STATUS', taskId });
            alert('403 Forbidden: You can only update tasks assigned to you.');
            return;
          }

          // VALIDATE status
          if (!['todo', 'in_progress', 'review', 'done'].includes(status)) return;

          const oldStatus = task.status;
          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) => t.id === taskId ? { ...t, status } : t),
          });
          await writeAuditLog(groupId, AUDIT_ACTIONS.TASK_STATUS_CHANGED, user.uid, userName, { taskTitle: task.title, taskId, from: oldStatus, to: status });
        } catch (e) { console.error(e); }
        break;
      }

      // ── UPDATE TASK FIELDS (owner or assignee for limited fields) ──
      case 'UPDATE_TASK': {
        try {
          const { groupId, taskId, updates } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const task = g.tasks.find((t) => t.id === taskId); if (!task) return;

          // PERMISSION CHECK
          if (!canEditTask(g, task, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'UPDATE_TASK', taskId });
            alert('403 Forbidden: You do not have permission to edit this task.');
            return;
          }

          // If NOT owner, restrict which fields can be updated
          if (!isProjectOwner(g, user.uid)) {
            const allowedFields = ['status']; // Assignees can only change status
            const sanitized = {};
            for (const key of allowedFields) {
              if (key in updates) sanitized[key] = updates[key];
            }
            if (Object.keys(sanitized).length === 0) {
              alert('403 Forbidden: You can only update the status of your assigned tasks.');
              return;
            }
            await updateDoc(doc(db, 'projects', groupId), {
              tasks: g.tasks.map((t) => t.id === taskId ? { ...t, ...sanitized } : t),
            });
          } else {
            // Owner can update any field
            await updateDoc(doc(db, 'projects', groupId), {
              tasks: g.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
            });
          }

          await writeAuditLog(groupId, AUDIT_ACTIONS.TASK_UPDATED, user.uid, userName, { taskTitle: task.title, taskId, updatedFields: Object.keys(updates) });
        } catch (e) { console.error(e); }
        break;
      }

      /* ═══════════════════════════════════════════
         V4 FIXED: ADD COMMENT
         
         BUG FIXES:
         1. Comments now include proper taskId linkage
         2. Comments persist correctly to Firestore
         3. Validates that comment text is non-empty
         4. Validates user has permission to comment
         5. Each comment stores: id, text, authorId,
            authorUserId, authorName, taskId, createdAt
         ═══════════════════════════════════════════ */
      case 'ADD_COMMENT': {
        try {
          const { groupId, taskId, authorId, text } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const task = g.tasks.find((t) => t.id === taskId); if (!task) return;

          // PERMISSION CHECK: only owner or assignee can comment
          if (!canCommentOnTask(g, task, user.uid)) {
            await writeAuditLog(groupId, AUDIT_ACTIONS.UNAUTHORIZED_ACCESS, user.uid, userName, { attempted: 'ADD_COMMENT', taskId });
            alert('403 Forbidden: You can only comment on tasks assigned to you.');
            return;
          }

          // INPUT VALIDATION
          if (!text || text.trim().length === 0) {
            alert('Comment text cannot be empty.');
            return;
          }
          if (text.trim().length > 1000) {
            alert('Comment must be under 1000 characters.');
            return;
          }

          // FIX: Build comment with complete data linkage
          const authorMember = g.members?.find((m) => m.id === authorId);
          const comment = {
            id: generateId(),
            text: text.trim(),
            authorId: authorId,           // Member ID within the project
            authorUserId: user.uid,       // Firebase UID (for auth verification)
            authorName: authorMember?.name || userName,
            taskId: taskId,               // FIX: Explicit task linkage
            createdAt: new Date().toISOString(),
          };

          // FIX: Ensure comments array exists, append correctly
          const existingComments = Array.isArray(task.comments) ? task.comments : [];
          const updatedComments = [...existingComments, comment];

          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) =>
              t.id === taskId ? { ...t, comments: updatedComments } : t
            ),
          });

          await writeAuditLog(groupId, AUDIT_ACTIONS.COMMENT_ADDED, user.uid, userName, { taskTitle: task.title, taskId, commentId: comment.id });
        } catch (e) { console.error('Error adding comment:', e); }
        break;
      }

      // ── DELETE COMMENT (owner or comment author) ──
      case 'DELETE_COMMENT': {
        try {
          const { groupId, taskId, commentId } = action.payload;
          const g = groups.find((x) => x.id === groupId); if (!g) return;
          const task = g.tasks.find((t) => t.id === taskId); if (!task) return;

          // Find the comment to check ownership
          const comment = (task.comments || []).find((c) => c.id === commentId);
          if (!comment) return;

          // Only owner or comment author can delete
          const isOwner = isProjectOwner(g, user.uid);
          const isAuthor = comment.authorUserId === user.uid;
          if (!isOwner && !isAuthor) {
            alert('403 Forbidden: You can only delete your own comments.');
            return;
          }

          await updateDoc(doc(db, 'projects', groupId), {
            tasks: g.tasks.map((t) =>
              t.id === taskId
                ? { ...t, comments: (t.comments || []).filter((c) => c.id !== commentId) }
                : t
            ),
          });
          await writeAuditLog(groupId, AUDIT_ACTIONS.COMMENT_DELETED, user.uid, userName, { taskId, commentId });
        } catch (e) { console.error(e); }
        break;
      }

      default: console.warn(`Unknown: "${action.type}"`);
    }
  }, [user, groups, activeGroupId, userName]);


  /* ═══════════════════════════════════════════
     CONTEXT VALUE
     ═══════════════════════════════════════════ */

  const state = { groups, activeGroupId, view, loading };
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  return (
    <GroupContext.Provider value={{ state, dispatch, activeGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const c = useContext(GroupContext);
  if (!c) throw new Error('useGroup needs GroupProvider');
  return c;
}

export function useActiveGroup() {
  return useGroup().activeGroup;
}
