/* ═══════════════════════════════════════════
   GroupCard — Project card on Home page
   ═══════════════════════════════════════════ */

import { useGroup } from '../../context/GroupContext';
import { Users, ListTodo, Trash2 } from 'lucide-react';
import './GroupCard.css';

export default function GroupCard({ group, index }) {
  const { dispatch } = useGroup();

  return (
    <div
      className="group-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => dispatch({ type: 'OPEN_PROJECT', payload: group.id })}
    >
      {/* Header */}
      <div className="group-card__header">
        <h3 className="group-card__name">{group.name}</h3>
        <button
          className="group-card__delete"
          title="Delete project"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_GROUP', payload: group.id });
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Members avatars */}
      <div className="group-card__avatars">
        {group.members.slice(0, 5).map((m) => (
          <span key={m.id} className="group-card__avatar" title={m.name}>
            {m.avatar}
          </span>
        ))}
        {group.members.length > 5 && (
          <span className="group-card__avatar-more">+{group.members.length - 5}</span>
        )}
        {group.members.length === 0 && (
          <span className="group-card__no-members">No members yet</span>
        )}
      </div>

      {/* Stats */}
      <div className="group-card__stats">
        <span className="group-card__stat">
          <ListTodo size={13} />
          {group.tasks.length} tasks
        </span>
        <span className="group-card__stat">
          <Users size={13} />
          {group.members.length} members
        </span>
      </div>
    </div>
  );
}
