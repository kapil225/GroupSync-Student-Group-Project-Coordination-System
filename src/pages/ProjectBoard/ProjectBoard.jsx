/**
 * ProjectBoard.jsx — V2 with Firebase
 * Kanban board with drag-and-drop, project code sharing, and task detail panel.
 */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { AVATARS, PRIORITIES, STATUSES } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import KanbanColumn from '../../components/KanbanColumn/KanbanColumn';
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal';
import { UserPlus, Plus, X, Copy, Check } from 'lucide-react';
import './ProjectBoard.css';

export default function ProjectBoard() {
  const { dispatch } = useGroup();
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

  if (!group) return null;

  const totalTasks = group.tasks?.length || 0;
  const doneTasks = (group.tasks || []).filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    dispatch({ type: 'ADD_MEMBER', payload: { groupId: group.id, name: memberName.trim(), avatar: memberAvatar } });
    setMemberName(''); setMemberAvatar(AVATARS[0]); setShowMemberModal(false);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    dispatch({ type: 'CREATE_TASK', payload: { groupId: group.id, title: taskTitle.trim(), description: taskDesc.trim(), priority: taskPriority, assigneeId: taskAssignee || null } });
    setTaskTitle(''); setTaskDesc(''); setTaskPriority('medium'); setTaskAssignee(''); setShowTaskModal(false);
  };

  const copyCode = () => {
    if (group.projectCode) { navigator.clipboard.writeText(group.projectCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="project-board">
      {/* Header */}
      <div className="project-board__header">
        <div>
          <h1 className="project-board__title">{group.name}</h1>
          <p className="project-board__meta">{group.members?.length || 0} members · {totalTasks} tasks</p>
        </div>
        <div className="project-board__actions">
          {totalTasks > 0 && (
            <div className="mini-progress">
              <div className="mini-progress__track"><div className="mini-progress__fill" style={{ width: `${progress}%` }} /></div>
              <span className="mini-progress__text">{doneTasks}/{totalTasks}</span>
            </div>
          )}
          <button className="btn-secondary" onClick={() => setShowMemberModal(true)}><UserPlus size={15} /> Add Member</button>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}><Plus size={15} /> New Task</button>
        </div>
      </div>

      {/* Project Code */}
      {group.projectCode && (
        <div className="project-board__code-banner">
          <span className="project-board__code-label">Share code:</span>
          <span className="project-board__code">{group.projectCode}</span>
          <button className="project-board__code-copy" onClick={copyCode}>{copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}</button>
        </div>
      )}

      {/* Members */}
      {group.members?.length > 0 && (
        <div className="project-board__members">
          <span className="project-board__members-label">Team</span>
          <div className="project-board__members-list">
            {group.members.map((m) => (
              <div key={m.id} className="member-chip">
                <span className="member-chip__avatar">{m.avatar}</span>
                <span className="member-chip__name">{m.name}</span>
                <button className="member-chip__remove" onClick={() => dispatch({ type: 'REMOVE_MEMBER', payload: { groupId: group.id, memberId: m.id } })}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="project-board__kanban">
        {STATUSES.map((status) => (
          <KanbanColumn key={status.key} status={status} tasks={(group.tasks || []).filter((t) => t.status === status.key)} onTaskClick={(id) => setSelectedTaskId(id)} />
        ))}
      </div>

      {/* Task Detail */}
      {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}

      {/* Add Member Modal */}
      <Modal title="Add Member" isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}>
        <label className="form-label">Name</label>
        <input className="form-input" placeholder="Member name" value={memberName} onChange={(e) => setMemberName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMember()} autoFocus />
        <label className="form-label">Avatar</label>
        <div className="avatar-picker">
          {AVATARS.map((a) => <span key={a} className={`avatar-picker__option ${memberAvatar === a ? 'avatar-picker__option--selected' : ''}`} onClick={() => setMemberAvatar(a)}>{a}</span>)}
        </div>
        <button className="form-btn-primary" onClick={handleAddMember}>Add Member</button>
      </Modal>

      {/* Create Task Modal */}
      <Modal title="Create Task" isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <label className="form-label">Title</label>
        <input className="form-input" placeholder="What needs to be done?" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()} autoFocus />
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Details (optional)" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
        <label className="form-label">Priority</label>
        <select className="form-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
          {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label className="form-label">Assign To</label>
        <select className="form-select" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {group.members?.map((m) => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
        </select>
        <button className="form-btn-primary" onClick={handleCreateTask}>Create Task</button>
      </Modal>
    </div>
  );
}
