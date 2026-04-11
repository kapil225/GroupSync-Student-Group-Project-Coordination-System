/* ═══════════════════════════════════════════
   GroupContext — Global State Management
   ═══════════════════════════════════════════ */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { generateId, loadFromStorage, saveToStorage } from '../utils/helpers';

const GroupContext = createContext(null);

/* ── Initial State ── */
const initialState = {
  groups: [],
  activeGroupId: null,
  view: 'home', // 'home' | 'project'
};

/* ── Reducer ── */
function groupReducer(state, action) {
  switch (action.type) {

    /* ── Navigation ── */
    case 'NAVIGATE_HOME':
      return { ...state, view: 'home', activeGroupId: null };

    case 'OPEN_PROJECT':
      return { ...state, view: 'project', activeGroupId: action.payload };

    /* ── Groups ── */
    case 'CREATE_GROUP': {
      const newGroup = {
        id: generateId(),
        name: action.payload.name,
        members: [],
        tasks: [],
        createdAt: new Date().toISOString(),
      };
      return { ...state, groups: [...state.groups, newGroup] };
    }

    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
        activeGroupId: state.activeGroupId === action.payload ? null : state.activeGroupId,
        view: state.activeGroupId === action.payload ? 'home' : state.view,
      };

    /* ── Members ── */
    case 'ADD_MEMBER': {
      const { groupId, name, avatar } = action.payload;
      const member = { id: generateId(), name, avatar };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, member] } : g
        ),
      };
    }

    case 'REMOVE_MEMBER': {
      const { groupId: gId, memberId } = action.payload;
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === gId
            ? {
                ...g,
                members: g.members.filter((m) => m.id !== memberId),
                tasks: g.tasks.map((t) =>
                  t.assigneeId === memberId ? { ...t, assigneeId: null } : t
                ),
              }
            : g
        ),
      };
    }

    /* ── Tasks ── */
    case 'CREATE_TASK': {
      const { groupId: tgId, title, description, priority, assigneeId } = action.payload;
      const task = {
        id: generateId(),
        title,
        description: description || '',
        priority: priority || 'medium',
        assigneeId: assigneeId || null,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === tgId ? { ...g, tasks: [...g.tasks, task] } : g
        ),
      };
    }

    case 'DELETE_TASK': {
      const { groupId: dgId, taskId } = action.payload;
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === dgId ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) } : g
        ),
      };
    }

    default:
      return state;
  }
}

/* ── Provider ── */
export function GroupProvider({ children }) {
  const saved = loadFromStorage();
  const [state, dispatch] = useReducer(groupReducer, saved || initialState);

  // Persist on every state change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <GroupContext.Provider value={{ state, dispatch }}>
      {children}
    </GroupContext.Provider>
  );
}

/* ── Hook ── */
export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup must be used within GroupProvider');
  return ctx;
}

/* ── Selector: get active group ── */
export function useActiveGroup() {
  const { state } = useGroup();
  return state.groups.find((g) => g.id === state.activeGroupId) || null;
}
