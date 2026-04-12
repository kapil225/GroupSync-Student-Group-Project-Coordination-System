/**
 * ProjectBoard.jsx — V1 with Auth
 * 
 * Project detail page showing members and tasks.
 * Now displays the project code so the owner can
 * share it with team members to join.
 */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { AVATARS, PRIORITIES } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import TaskCard from '../../components/TaskCard/TaskCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { UserPlus, Plus, X, Copy, Check } from 'lucide-react';
import './ProjectBoard.css';

export default function ProjectBoard() {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add Member form
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState(AVATARS[0]);

  // Create Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');

  if (!group) return null;

  const handleAddMember = () => {
    const trimmedName = memberName.trim();
    if (!trimmedName) return;
    dispatch({
      type: 'ADD_MEMBER',
      payload: { groupId: group.id, name: trimmedName, avatar: memberAvatar },
    });
    setMemberName('');
    setMemberAvatar(AVATARS[0]);
    setShowMemberModal(false);
  };

  const handleRemoveMember = (memberId) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: { groupId: group.id, memberId } });
  };

  const handleCreateTask = () => {
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) return;
    dispatch({
      type: 'CREATE_TASK',
      payload: {
        groupId: group.id,
        title: trimmedTitle,
        description: taskDescription.trim(),
        priority: taskPriority,
        assigneeId: taskAssignee || null,
      },
    });
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskAssignee('');
    setShowTaskModal(false);
  };

  /**
   * Copy project code to clipboard so the user can share it.
   */
  const copyProjectCode = () => {
    if (group.projectCode) {
      navigator.clipboard.writeText(group.projectCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="project-board">

      {/* ── Header ── */}
      <div className="project-board__header">
        <div>
          <h1 className="project-board__title">{group.name}</h1>
          <p className="project-board__meta">
            {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''} · {group.tasks?.length || 0} task{(group.tasks?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="project-board__actions">
          <button className="btn-secondary" onClick={() => setShowMemberModal(true)}>
            <UserPlus size={15} /> Add Member
          </button>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* ── Project Code Banner ── */}
      {group.projectCode && (
        <div className="project-board__code-banner">
          <span className="project-board__code-label">Share this code with your team:</span>
          <span className="project-board__code">{group.projectCode}</span>
          <button className="project-board__code-copy" onClick={copyProjectCode} title="Copy code">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* ── Members Strip ── */}
      {group.members?.length > 0 && (
        <div className="project-board__members">
          <span className="project-board__members-label">Team</span>
          <div className="project-board__members-list">
            {group.members.map((member) => (
              <div key={member.id} className="member-chip">
                <span className="member-chip__avatar">{member.avatar}</span>
                <span className="member-chip__name">{member.name}</span>
                <button
                  className="member-chip__remove"
                  title={`Remove ${member.name}`}
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Task List ── */}
      <div className="project-board__section">
        <h2 className="project-board__section-title">Tasks</h2>
        {(group.tasks?.length || 0) === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks yet"
            subtitle="Add your first task and assign it to a team member."
            action={
              <button className="form-btn-primary" style={{ marginTop: 16 }} onClick={() => setShowTaskModal(true)}>
                + Create Task
              </button>
            }
          />
        ) : (
          <div className="project-board__task-grid">
            {group.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Add Member ── */}
      <Modal title="Add Member" isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}>
        <label className="form-label">Name</label>
        <input className="form-input" placeholder="Enter member name" value={memberName} onChange={(e) => setMemberName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMember()} autoFocus />
        <label className="form-label">Choose an Avatar</label>
        <div className="avatar-picker">
          {AVATARS.map((emoji) => (
            <span key={emoji} className={`avatar-picker__option ${memberAvatar === emoji ? 'avatar-picker__option--selected' : ''}`} onClick={() => setMemberAvatar(emoji)}>{emoji}</span>
          ))}
        </div>
        <button className="form-btn-primary" onClick={handleAddMember}>Add Member</button>
      </Modal>

      {/* ── Modal: Create Task ── */}
      <Modal title="Create Task" isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <label className="form-label">Title</label>
        <input className="form-input" placeholder="What needs to be done?" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()} autoFocus />
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Add more details (optional)" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
        <label className="form-label">Priority</label>
        <select className="form-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
          {Object.entries(PRIORITIES).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <label className="form-label">Assign To</label>
        <select className="form-select" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {group.members?.map((member) => (
            <option key={member.id} value={member.id}>{member.avatar} {member.name}</option>
          ))}
        </select>
        <button className="form-btn-primary" onClick={handleCreateTask}>Create Task</button>
      </Modal>
    </div>
  );
}
