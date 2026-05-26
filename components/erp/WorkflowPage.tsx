import MetricCard from '@/components/ui/MetricCard';

type WorkflowPageProps = {
    eyebrow: string;
    title: string;
    description: string;
    metrics: Array<{ label: string; value: string; helper: string; tone?: 'success' | 'warning' | 'danger' | 'gold' }>;
    primaryItems: Array<{ icon: string; title: string; body: string }>;
    checklist: Array<{ label: string; status: string }>;
};

export default function WorkflowPage({ eyebrow, title, description, metrics, primaryItems, checklist }: WorkflowPageProps) {
    return (
        <>
            <div className="dashboard-grid">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} tone={metric.tone} />
                ))}
            </div>

            <section className="page-card gold-panel">
                <div className="section-heading-row">
                    <div>
                        <p className="eyebrow">{eyebrow}</p>
                        <h2>{title}</h2>
                    </div>
                </div>
                <p>{description}</p>

                <div className="status-list">
                    {primaryItems.map((item) => (
                        <div className="status-row" key={item.title}>
                            <strong>{item.icon} {item.title}</strong>
                            <span>{item.body}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="page-card gold-panel">
                <div className="section-heading-row section-heading-row--compact">
                    <div>
                        <p className="eyebrow">Operational status</p>
                        <h2>Workflow validation</h2>
                    </div>
                </div>

                <div className="status-list">
                    {checklist.map((item) => (
                        <div className="status-row" key={item.label}>
                            <strong>{item.label}</strong>
                            <span>{item.status}</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
