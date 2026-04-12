/**
 * EmptyState.jsx
 * 
 * A friendly placeholder shown when there's nothing to display yet.
 * Used on the Home page (no projects) and the Project page (no tasks).
 * 
 * Props:
 *   - icon:     An emoji or character to display large
 *   - title:    A short heading ("No tasks yet")
 *   - subtitle: An optional description with a hint on what to do
 *   - action:   An optional button/element (e.g., "Create Task")
 */

import './EmptyState.css';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>

      {subtitle && (
        <p className="empty-state__subtitle">{subtitle}</p>
      )}

      {action && action}
    </div>
  );
}
