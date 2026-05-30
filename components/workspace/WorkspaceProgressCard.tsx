import type { WorkspaceChecklist } from './workspaceTypes';

export default function WorkspaceProgressCard({ checklist }: { checklist: WorkspaceChecklist }) {
  return (
    <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
      <p className="eyebrow">Workspace Initialization</p>
      <h2>{checklist.completedSteps}/{checklist.totalSteps} Complete</h2>
      <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden', margin: '14px 0' }}>
        <div style={{ width: `${checklist.progressPercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#c89b3c,#ffe2a4)' }} />
      </div>
      <p>{checklist.progressPercent}% setup progress</p>
      <strong>{checklist.importLocked ? '🔒 Import School Data Locked' : '🔓 Import School Data Unlocked'}</strong>
      <p>{checklist.importLockMessage}</p>
    </section>
  );
}
