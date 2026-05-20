type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: 'success' | 'warning' | 'danger' | 'gold';
};

export default function MetricCard({ label, value, helper, tone = 'gold' }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </div>
  );
}
