/**
 * GroupCard.jsx — V1 with Auth
 * 
 * Project card on the Home page.
 * Now shows the project code so team members can share it.
 */

import { useGroup } from '../../context/GroupContext';
import { Users, ListTodo, Trash2, Key } from 'lucide-react';
import './GroupCard.css';

export default function GroupCard({ group, index }) {
  const { dispatch } = useGroup();

  const handleClick = () => {
    dispatch({ type: 'OPEN_PROJECT', payload: group.id });
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    if (window.confirm(`Delete "${group.name}"? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_GROUP', payload: group.id });
    }
  };

  const visibleMembers = (group.members || []).slice(0, 5);
  const extraCount = (group.members?.length || 0) - 5;

  return (
    <div className="group-card" style={{ animationDelay: `${index * 0.06}s` }} onClick={handleClick}>
      <div className="group-card__header">
        <h3 className="group-card__name">{group.name}</h3>
        <button className="group-card__delete" title="Delete project" onClick={handleDelete}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Project code */}
      {group.projectCode && (
        <div className="group-card__code">
          <Key size={12} />
          <span>{group.projectCode}</span>
        </div>
      )}

      <div className="group-card__avatars">
        {visibleMembers.map((m) => (
          <span key={m.id} className="group-card__avatar" title={m.name}>{m.avatar}</span>
        ))}
        {extraCount > 0 && <span className="group-card__avatar-more">+{extraCount}</span>}
        {(group.members?.length || 0) === 0 && (
          <span className="group-card__no-members">No members yet</span>
        )}
      </div>

      <div className="group-card__stats">
        <span className="group-card__stat"><ListTodo size={13} /> {group.tasks?.length || 0} tasks</span>
        <span className="group-card__stat"><Users size={13} /> {group.members?.length || 0} members</span>
      </div>
    </div>
  );
}
