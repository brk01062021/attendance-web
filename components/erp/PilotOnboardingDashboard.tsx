'use client';

import { useEffect, useMemo, useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import { pilotOnboardingFallback, type PilotOnboardingSummary } from '@/lib/pilotOnboarding';

export default function PilotOnboardingDashboard() {
    const [summary, setSummary] = useState<PilotOnboardingSummary>(pilotOnboardingFallback);
    const [apiState, setApiState] = useState<'checking' | 'live' | 'fallback'>('checking');
    const [error, setError] = useState('');

    useEffect(() => {
        const user = getStoredUser();
        webApi.pilotOnboardingSummary<PilotOnboardingSummary>(user?.schoolId || 'DEMO', user?.token)
            .then((data) => {
                setSummary(data);
                setApiState('live');
            })
            .catch((err) => {
                setSummary(pilotOnboardingFallback);
                setApiState('fallback');
                setError(err instanceof Error ? err.message : 'Backend pilot onboarding API unavailable.');
            });
    }, []);

    const metrics = useMemo(() => [
        { label: 'Pilot Students', value: String(summary.targetStudents), helper: 'Realistic first-school target', trend: '700-student pilot' },
        { label: 'Teachers', value: String(summary.targetTeachers), helper: 'Expected teacher range', trend: '30–40 teachers' },
        { label: 'Admin + Principal', value: String(summary.targetAdmins + summary.targetPrincipals), helper: 'Initial leadership users', trend: 'Controlled rollout' },
        { label: 'Readiness', value: summary.readinessStatus.replaceAll('_', ' '), helper: 'Backend-driven Day 26 gate', trend: apiState === 'live' ? 'Live API' : 'Fallback mode' },
    ], [apiState, summary]);

    return (
        <>
            <div className="dashboard-grid">
                {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>

            <section className="day25-hero gold-panel">
                <div>
                    <p className="eyebrow">DAY 26 REAL API CLEANUP</p>
                    <h2>{summary.schoolName} onboarding command center</h2>
                    <p>
                        This board connects the web ERP to the real backend pilot onboarding API first. If the backend is not running, it shows a safe fallback checklist so UI testing can continue without breaking the portal.
                    </p>
                </div>
                <div className="day25-route-card">
                    <strong>API status</strong>
                    <span>{apiState === 'checking' ? 'Checking backend...' : apiState === 'live' ? 'Backend API connected' : 'Fallback checklist active'}</span>
                    <span>school_id: {summary.schoolId}</span>
                    <span>planned start: {summary.plannedPilotStartDate}</span>
                    {error ? <span>{error}</span> : null}
                </div>
            </section>

            <section className="day25-panel gold-panel">
                <div className="day25-section-header">
                    <div>
                        <p className="eyebrow">PILOT ONBOARDING STEPS</p>
                        <h3>One-school rollout gates before parent/student live access</h3>
                    </div>
                    <span className="mini-button">{summary.steps.length} gates</span>
                </div>
                <div className="day25-gate-grid">
                    {summary.steps.map((step) => (
                        <article className="day25-gate" key={step.key}>
                            <div className="day25-gate-top">
                                <strong>{step.title}</strong>
                                <em>{step.priority}</em>
                            </div>
                            <span>{step.owner} • {step.status.replaceAll('_', ' ')}</span>
                            <ul>
                                <li>{step.detail}</li>
                            </ul>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
