
'use client';

import { useEffect, useMemo, useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import { pilotOnboardingFallback, type PilotOnboardingSummary } from '@/lib/pilotOnboarding';

export default function PilotOnboardingDashboard() {
    const [summary, setSummary] = useState<PilotOnboardingSummary>(pilotOnboardingFallback);
    const [apiState, setApiState] = useState<'checking' | 'live' | 'offline'>('checking');

    useEffect(() => {
        const user = getStoredUser();

        webApi.pilotOnboardingSummary<PilotOnboardingSummary>(user?.schoolId || 'DEMO', user?.token)
            .then((data) => {
                setSummary(data);
                setApiState('live');
            })
            .catch(() => {
                setSummary(pilotOnboardingFallback);
                setApiState('offline');
            });
    }, []);

    const metrics = useMemo(() => [
        { label: 'Students', value: String(summary.targetStudents), helper: 'Current onboarding scope', trend: 'Import tracking active' },
        { label: 'Teachers', value: String(summary.targetTeachers), helper: 'Faculty onboarding', trend: 'Operational sync available' },
        { label: 'Leadership', value: String(summary.targetAdmins + summary.targetPrincipals), helper: 'Admin & Principal accounts', trend: 'Connected access control' },
        { label: 'Rollout Status', value: summary.readinessStatus.replaceAll('_', ' '), helper: 'School activation readiness', trend: apiState === 'live' ? 'Connected' : 'Offline support' },
    ], [apiState, summary]);

    return (
        <>
            <div className="dashboard-grid">
                {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>

            <section className="day25-hero gold-panel">
                <div>
                    <p className="eyebrow">SCHOOL ROLLOUT READINESS</p>
                    <h2>{summary.schoolName} operational onboarding center</h2>
                    <p>
                        Monitor onboarding readiness, school onboarding alignment, timetable readiness, and attendance activation before pilot-school rollout.
                    </p>
                </div>

                <div className="day25-route-card">
                    <strong>Operational Status</strong>
                    <span>{apiState === 'checking' ? 'Checking services...' : apiState === 'live' ? 'Connected' : 'Offline support available'}</span>
                    <span>School Access ID: {summary.schoolId}</span>
                    <span>school rollout: {summary.plannedPilotStartDate}</span>
                </div>
            </section>

            <section className="day25-panel gold-panel">
                <div className="day25-section-header">
                    <div>
                        <p className="eyebrow">ROLLOUT CHECKLIST</p>
                        <h3>Operational verification before school activation</h3>
                    </div>

                    <span className="mini-button">{summary.steps.length} checks</span>
                </div>

                <div className="day25-gate-grid">
                    {summary.steps.map((step) => (
                        <article className="day25-gate" key={step.key}>
                            <div className="day25-gate-top">
                                <strong>{step.title}</strong>
                                <em>{step.priority}</em>
                            </div>

                            <span>{step.owner} • {step.status.replaceAll('_', ' ')}</span>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
