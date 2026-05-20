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

            <section className="two-column">
                <div className="page-card gold-panel">
                    <p className="eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <div className="action-grid">
                        {primaryItems.map((item) => (
                            <div className="action-card" key={item.title}>
                                <span>{item.icon}</span>
                                <strong>{item.title}</strong>
                                <span>{item.body}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="page-card gold-panel">
                    <p className="eyebrow">DAY 22 READINESS</p>
                    <h2>Production checklist</h2>
                    <p>Static web foundation checklist prepared before real API form wiring and advanced CRUD screens.</p>
                    <div className="status-list">
                        {checklist.map((item) => (
                            <div className="status-row" key={item.label}>
                                <strong>{item.label}</strong>
                                <span>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
