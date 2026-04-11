/* ═══════════════════════════════════════════
   ProjectBoard — Group detail with members & tasks
   ═══════════════════════════════════════════ */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { AVATARS, PRIORITIES } from '../../utils/helpers';
import Modal from '../../components/Modal/Modal';
import TaskCard from '../../components/TaskCard/TaskCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { UserPlus, Plus, X } from 'lucide-react';
import './ProjectBoard.css';

export default function ProjectBoard() {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  /* ── Member form state ── */
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState(AVATARS[0]);

  /* ── Task form state ── */
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');

  if (!group) return null;

  /* ── Handlers ── */
  const handleAddMember = () => {
    if (!memberName.trim()) return;
    dispatch({
      type: 'ADD_MEMBER',
      payload: { groupId: group.id, name: memberName.trim(), avatar: memberAvatar },
    });
    setMemberName('');
    setMemberAvatar(AVATARS[0]);
    setShowMemberModal(false);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    dispatch({
      type: 'CREATE_TASK',
      payload: {
        groupId: group.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        assigneeId: taskAssignee || null,
      },
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskAssignee('');
    setShowTaskModal(false);
  };

  return (
    <div className="project-board">
      {/* ── Page Header ── */}
      <div className="project-board__header">
        <div>
          <h1 className="project-board__title">{group.name}</h1>
          <p className="project-board__meta">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} · {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
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

      {/* ── Members Strip ── */}
      {group.members.length > 0 && (
        <div className="project-board__members">
          <span className="project-board__members-label">Team</span>
          <div className="project-board__members-list">
            {group.members.map((m) => (
              <div key={m.id} className="member-chip">
                <span className="member-chip__avatar">{m.avatar}</span>
                <span className="member-chip__name">{m.name}</span>
                <button
                  className="member-chip__remove"
                  title={`Remove ${m.name}`}
                  onClick={() =>
                    dispatch({
                      type: 'REMOVE_MEMBER',
                      payload: { groupId: group.id, memberId: m.id },
                    })
                  }
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

        {group.tasks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks yet"
            subtitle="Add your first task and assign it to a team member."
            action={
              <button
                className="form-btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowTaskModal(true)}
              >
                + Create Task
              </button>
            }
          />
        ) : (
          <div className="project-board__task-grid">
            {group.tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
           MODAL: Add Member
         ══════════════════════════════════════ */}
      <Modal title="Add Member" isOpen={showMemberModal} onClose={() => setShowMemberModal(false)}>
        <label className="form-label">Name</label>
        <input
          className="form-input"
          placeholder="Enter member name"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          autoFocus
        />

        <label className="form-label">Avatar</label>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <span
              key={a}
              className={`avatar-picker__option ${memberAvatar === a ? 'avatar-picker__option--selected' : ''}`}
              onClick={() => setMemberAvatar(a)}
            >
              {a}
            </span>
          ))}
        </div>

        <button className="form-btn-primary" onClick={handleAddMember}>
          Add Member
        </button>
      </Modal>

      {/* ══════════════════════════════════════
           MODAL: Create Task
         ══════════════════════════════════════ */}
      <Modal title="Create Task" isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="What needs to be done?"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
          autoFocus
        />

        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          placeholder="Add details (optional)"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />

        <label className="form-label">Priority</label>
        <select
          className="form-select"
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
        >
          {Object.entries(PRIORITIES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>

        <label className="form-label">Assign To</label>
        <select
          className="form-select"
          value={taskAssignee}
          onChange={(e) => setTaskAssignee(e.target.value)}
        >
          <option value="">Unassigned</option>
          {group.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.avatar} {m.name}
            </option>
          ))}
        </select>

        <button className="form-btn-primary" onClick={handleCreateTask}>
          Create Task
        </button>
      </Modal>
    </div>
  );
}
