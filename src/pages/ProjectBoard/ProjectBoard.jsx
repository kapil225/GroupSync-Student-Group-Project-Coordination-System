/**
 * ProjectBoard.jsx — V4
 * 
 * V4: Tasks are filtered by visibility.
 * Owner sees ALL tasks. Members see ONLY tasks assigned to them.
 * Uses getVisibleTasks() from helpers for filtering.
 */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { AVATARS, PRIORITIES, STATUSES, isProjectOwner, canCreateTask, canManageMembers, getVisibleTasks } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import KanbanColumn from '../../components/KanbanColumn/KanbanColumn';
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal';
import DeadlineAlert from '../../components/DeadlineAlert/DeadlineAlert';
import { UserPlus, Plus, X, Copy, Check, BarChart3, Crown, Lock } from 'lucide-react';
import './ProjectBoard.css';

export default function ProjectBoard() {
  const { dispatch } = useGroup();
  const { user } = useAuth();
  const group = useActiveGroup();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState(AVATARS[0]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  if (!group || !user) return null;

  const isOwner = isProjectOwner(group, user.uid);
  const canCreate = canCreateTask(group, user.uid);
  const canManage = canManageMembers(group, user.uid);

  // V4: STRICT VISIBILITY — members only see their assigned tasks
  const visibleTasks = getVisibleTasks(group, user.uid);
  const totalVisible = visibleTasks.length;
  const doneVisible = visibleTasks.filter((t) => t.status === 'done').length;
  const progress = totalVisible > 0 ? Math.round((doneVisible / totalVisible) * 100) : 0;

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    dispatch({ type: 'ADD_MEMBER', payload: { groupId: group.id, name: memberName.trim(), avatar: memberAvatar } });
    setMemberName(''); setMemberAvatar(AVATARS[0]); setShowMemberModal(false);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    dispatch({ type: 'CREATE_TASK', payload: { groupId: group.id, title: taskTitle.trim(), description: taskDesc.trim(), priority: taskPriority, assigneeId: taskAssignee || null, deadline: taskDeadline || null } });
    setTaskTitle(''); setTaskDesc(''); setTaskPriority('medium'); setTaskAssignee(''); setTaskDeadline(''); setShowTaskModal(false);
  };

  const copyCode = () => { if (group.projectCode) { navigator.clipboard.writeText(group.projectCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <div className="project-board">
      <DeadlineAlert />

      <div className="project-board__header">
        <div>
          <h1 className="project-board__title">{group.name}</h1>
          <p className="project-board__meta">
            {isOwner && <span className="project-board__owner-badge"><Crown size={12} /> Owner</span>}
            {!isOwner && <span className="project-board__member-badge"><Lock size={11} /> Member — viewing your tasks only</span>}
            {totalVisible} task{totalVisible !== 1 ? 's' : ''} visible
          </p>
        </div>
        <div className="project-board__actions">
          {totalVisible > 0 && (
            <div className="mini-progress">
              <div className="mini-progress__track"><div className="mini-progress__fill" style={{ width: `${progress}%` }} /></div>
              <span className="mini-progress__text">{doneVisible}/{totalVisible}</span>
            </div>
          )}
          <button className="btn-secondary" onClick={() => dispatch({ type: 'NAVIGATE_DASHBOARD' })}><BarChart3 size={15} /> Dashboard</button>
          {/* V4: Only show action buttons to owner */}
          {canManage && <button className="btn-secondary" onClick={() => setShowMemberModal(true)}><UserPlus size={15} /> Add Member</button>}
          {canCreate && <button className="btn-primary" onClick={() => setShowTaskModal(true)}><Plus size={15} /> New Task</button>}
        </div>
      </div>

      {group.projectCode && (
        <div className="project-board__code-banner">
          <span className="project-board__code-label">Share code:</span>
          <span className="project-board__code">{group.projectCode}</span>
          <button className="project-board__code-copy" onClick={copyCode}>{copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}</button>
        </div>
      )}

      {group.members?.length > 0 && (
        <div className="project-board__members">
          <span className="project-board__members-label">Team</span>
          <div className="project-board__members-list">
            {group.members.map((m) => (
              <div key={m.id} className="member-chip">
                <span className="member-chip__avatar">{m.avatar}</span>
                <span className="member-chip__name">{m.name}</span>
                {m.userId === group.ownerId && <Crown size={11} style={{ color: '#f5a623' }} />}
                {canManage && m.userId !== group.ownerId && (
                  <button className="member-chip__remove" onClick={() => dispatch({ type: 'REMOVE_MEMBER', payload: { groupId: group.id, memberId: m.id } })}><X size={12} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* V4: Kanban shows ONLY visible tasks (filtered by role) */}
      <div className="project-board__kanban">
        {STATUSES.map((status) => (
          <KanbanColumn key={status.key} status={status} tasks={visibleTasks.filter((t) => t.status === status.key)} onTaskClick={(id) => setSelectedTaskId(id)} />
        ))}
      </div>

      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}

      {/* Modals - only rendered if user has permission */}
      {canManage && (
        <Modal title="Add Member" isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}>
          <label className="form-label">Name</label>
          <input className="form-input" placeholder="Member name" value={memberName} onChange={(e) => setMemberName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMember()} autoFocus />
          <label className="form-label">Avatar</label>
          <div className="avatar-picker">{AVATARS.map((a) => <span key={a} className={`avatar-picker__option ${memberAvatar === a ? 'avatar-picker__option--selected' : ''}`} onClick={() => setMemberAvatar(a)}>{a}</span>)}</div>
          <button className="form-btn-primary" onClick={handleAddMember}>Add Member</button>
        </Modal>
      )}

      {canCreate && (
        <Modal title="Create Task" isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}>
          <label className="form-label">Title</label>
          <input className="form-input" placeholder="What needs to be done?" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()} autoFocus />
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Details (optional)" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <label className="form-label">Priority</label>
          <select className="form-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>{Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <label className="form-label">Assign To</label>
          <select className="form-select" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}><option value="">Unassigned</option>{group.members?.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}</select>
          <label className="form-label">Deadline</label>
          <input type="date" className="form-input" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
          <button className="form-btn-primary" onClick={handleCreateTask}>Create Task</button>
        </Modal>
      )}
    </div>
  );
}
