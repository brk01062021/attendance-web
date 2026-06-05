import MetricCard from '@/components/ui/MetricCard';
import { day25ReadinessGates, mobileFirstWorkflows, pilotMetrics, webFirstWorkflows } from '@/lib/pilotReadiness';

export default function ProductionHardeningDashboard() {
    return (
        <>
            <div className="dashboard-grid">
                {pilotMetrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                ))}
            </div>

            <section className="day25-hero gold-panel">
                <div>
                    <p className="eyebrow">SYSTEM OPERATIONS</p>
                    <h2>Operational controls for a live school workspace.</h2>
                    <p>
                        Monitor role access, tenant isolation, import validation, backup/export checks, publish status, and workspace activation health.
                    </p>
                </div>
                <div className="day25-route-card">
                    <strong>Operational endpoints</strong>
                    <span>portal.vidyasetu.co/login → ERP login</span>
                    <span>api.vidyasetu.co → VidyaSetu services</span>
                    <span>School ID → tenant-safe data boundary</span>
                    <span>Workspace Health → activation monitoring</span>
                </div>
            </section>

            <section className="day25-split">
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">Mobile daily workflows</p>
                    <h3>Available mobile operations</h3>
                    <ul className="day25-check-list">
                        {mobileFirstWorkflows.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">Web administration workflows</p>
                    <h3>Available web ERP operations</h3>
                    <ul className="day25-check-list">
                        {webFirstWorkflows.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </section>

            <section className="day25-panel gold-panel">
                <div className="day25-section-header">
                    <div>
                        <p className="eyebrow">Operational validation</p>
                        <h3>Checks before daily school use</h3>
                    </div>
                </div>
                <div className="day25-gate-grid">
                    {day25ReadinessGates.map((gate) => (
                        <article className={`day25-gate day25-gate--${gate.status.toLowerCase().replaceAll(' ', '-')}`} key={gate.area}>
                            <div className="day25-gate-top">
                                <strong>{gate.area}</strong>
                                <em>{gate.priority}</em>
                            </div>
                            <span>{gate.owner} • {gate.status}</span>
                            <ul>
                                {gate.checks.map((check) => <li key={check}>{check}</li>)}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
