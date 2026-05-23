type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: 'success' | 'warning' | 'danger' | 'gold' | 'info' | 'neutral';
  trend?: string;
};

export default function MetricCard({ label, value, helper, tone = 'gold', trend }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__topline">
        <p>{label}</p>
        {trend ? <span className="metric-card__trend">{trend}</span> : null}
      </div>
      <strong>{value}</strong>
      <span>{helper}</span>
    </div>
  );
}
