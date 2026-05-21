import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import {
    day25ReadinessGates,
    mobileFirstWorkflows,
    pilotMetrics,
    webFirstWorkflows,
} from '@/lib/pilotReadiness';

const timeline = [
    ['Days 1–2', 'Protect routes, verify role access, confirm school_id isolation checks.'],
    ['Days 3–5', 'Stabilize Import School Data validation and missed-day attendance import.'],
    ['Days 6–8', 'Finish timetable effective dates, publish lifecycle, and auto notice draft.'],
    ['Days 9–10', 'Add holiday calendar overrides and dashboard holiday/timetable alerts.'],
    ['Days 11–12', 'Pilot rehearsal with 700-student sample import and teacher/principal flows.'],
    ['Days 13–14', 'Deployment readiness, demo script, backup/export checks, and school handoff.'],
];

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
                    <p className="eyebrow">DAY 25 PRODUCTION HARDENING</p>
                    <h2>Mobile-first operations, web-first administration, pilot-ready in 14 days.</h2>
                    <p>
                        This page converts Day 25 into a practical launch checklist for the first realistic school pilot. It avoids large new modules and keeps the focus on stability, usability, onboarding, attendance, timetable lifecycle, holidays, notices, and deployment readiness.
                    </p>
                </div>
                <div className="day25-route-card">
                    <strong>Route plan</strong>
                    <span>vidyasetu.co → public website</span>
                    <span>portal.vidyasetu.co/login → ERP login</span>
                    <span>app.vidyasetu.co → mobile app/deep links</span>
                    <span>api.vidyasetu.co → backend APIs</span>
                </div>
            </section>

            <section className="day25-split">
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">MOBILE-FIRST DAILY WORKFLOWS</p>
                    <h3>Use mobile for everyday school activity</h3>
                    <ul className="day25-check-list">
                        {mobileFirstWorkflows.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">WEB-FIRST BULK WORKFLOWS</p>
                    <h3>Use web ERP for bulk and detailed administration</h3>
                    <ul className="day25-check-list">
                        {webFirstWorkflows.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </section>

            <section className="day25-panel gold-panel">
                <div className="day25-section-header">
                    <div>
                        <p className="eyebrow">PILOT READINESS GATES</p>
                        <h3>P0/P1 validation before onboarding the first school</h3>
                    </div>
                    <Link className="mini-button" href="/pilot-readiness">Open pilot board</Link>
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

            <section className="day25-split">
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">14-DAY PILOT PATH</p>
                    <h3>Build only what improves launch confidence</h3>
                    <div className="day25-timeline">
                        {timeline.map(([days, body]) => (
                            <div key={days}>
                                <strong>{days}</strong>
                                <span>{body}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">DO NOT ADD IN DAY 25</p>
                    <h3>Keep scope tight</h3>
                    <ul className="day25-danger-list">
                        <li>Exam generation</li>
                        <li>Advanced AI learning</li>
                        <li>WhatsApp/SMS automation</li>
                        <li>Large new ERP modules</li>
                    </ul>
                </div>
            </section>
        </>
    );
}
