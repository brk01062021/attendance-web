const operationalMetrics = [
  { label: 'Active Classes', value: '20', helper: '10 classes • 2 sections' },
  { label: 'Teachers Online', value: '41', helper: 'Operational school day' },
  { label: 'Attendance Coverage', value: '96%', helper: 'Latest sync snapshot' },
  { label: 'ERP Status', value: 'Stable', helper: 'Tenant-safe operational mode' },
];

export default function OperationalPulse() {
  return (
    <section className="ops-pulse-grid">
      {operationalMetrics.map((item) => (
        <div className="ops-pulse-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.helper}</small>
        </div>
      ))}
    </section>
  );
}
