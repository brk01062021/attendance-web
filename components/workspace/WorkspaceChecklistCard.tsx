import type { WorkspaceChecklist } from './workspaceTypes';

export default function WorkspaceChecklistCard({ checklist }: { checklist: WorkspaceChecklist }) {
  return (
    <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
      <p className="eyebrow">Required setup order</p>
      <h2>Workspace Checklist</h2>
      <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        {checklist.steps.map((step, index) => (
          <div key={step.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 16, background: step.completed ? 'rgba(38,166,91,.15)' : 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)' }}>
            <span>{index + 1}. {step.label}</span>
            <strong>{step.completed ? 'Completed' : 'Pending'}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
