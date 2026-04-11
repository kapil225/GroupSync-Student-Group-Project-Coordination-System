/* ═══════════════════════════════════════════
   Home — Projects overview page
   ═══════════════════════════════════════════ */

import { useGroup } from '../../context/GroupContext';
import GroupCard from '../../components/GroupCard/GroupCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Home.css';

export default function Home({ onNewGroup }) {
  const { state } = useGroup();

  return (
    <div className="home">
      {/* Page Header */}
      <div className="home__header">
        <div>
          <h1 className="home__title">Your Projects</h1>
          <p className="home__subtitle">
            {state.groups.length} project{state.groups.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      {state.groups.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No projects yet"
          subtitle="Create your first group project and start collaborating with your team."
          action={
            <button className="form-btn-primary" style={{ marginTop: 20 }} onClick={onNewGroup}>
              + Create Project
            </button>
          }
        />
      ) : (
        <div className="home__grid">
          {state.groups.map((group, i) => (
            <GroupCard key={group.id} group={group} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
