'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { ONBOARDING_ACTIONS, OnboardingReviewItem, OnboardingStatusResponse, onboardingStatusLabel, onboardingStatusTone } from '@/lib/onboardingLifecycle';

function canRunAction(current: string, next: string) {
  if (current === 'PENDING') return next === 'APPROVED' || next === 'REJECTED';
  if (current === 'APPROVED') return next === 'PILOT' || next === 'REJECTED';
  if (current === 'PILOT') return next === 'ACTIVE' || next === 'REJECTED';
  return false;
}

function splitHistory(history?: string | null) {
  return (history || '').split('\n').map((line) => line.trim()).filter(Boolean).reverse();
}

export default function OnboardingReviewPage() {
  const [items, setItems] = useState<OnboardingReviewItem[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [selected, setSelected] = useState<OnboardingReviewItem | null>(null);

  const metrics = useMemo(() => {
    const count = (status: string) => items.filter((item) => item.status === status).length;
    return [
      { label: 'Pending Review', value: count('PENDING') },
      { label: 'Approved', value: count('APPROVED') },
      { label: 'Pilot', value: count('PILOT') },
      { label: 'Active', value: count('ACTIVE') },
    ];
  }, [items]);

  async function loadQueue() {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await webApi.onboardingReviewQueue<OnboardingReviewItem[]>();
      setItems(response);
      if (selected) {
        setSelected(response.find((item) => item.referenceId === selected.referenceId) || null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load onboarding review queue.');
    } finally {
      setIsLoading(false);
    }
  }

  async function runAction(item: OnboardingReviewItem, action: 'approve' | 'reject' | 'mark-pilot' | 'activate', label: string) {
    setActiveReference(item.referenceId);
    setMessage('');
    try {
      const response = await webApi.onboardingLifecycleAction<OnboardingStatusResponse>(item.referenceId, action, `${label} from Admin/Principal onboarding review.`);
      setMessage(`${response.schoolName} moved to ${onboardingStatusLabel(response.status)}. ${response.nextStep}`);
      await loadQueue();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update onboarding status.');
    } finally {
      setActiveReference(null);
    }
  }

  useEffect(() => { loadQueue(); }, []);

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: 24 }}>
      <ShellStyles />
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">TENANT ACTIVATION</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Admin / Principal Onboarding Review Queue</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>
          Review school registrations and pilot demo requests through Pending → Approved → Pilot → Active. Login is enabled only after Active. Final Excel import remains disabled.
        </p>

        <div className="button-row" style={{ marginBottom: 18 }}>
          <button className="secondary-button" type="button" onClick={loadQueue}>{isLoading ? 'Loading...' : 'Refresh Queue'}</button>
          <Link className="secondary-button" href="/admin">Admin Home</Link>
          <Link className="secondary-button" href="/principal">Principal Home</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
          {metrics.map((metric) => <div className="notice-card" key={metric.label}><strong>{metric.value}</strong><br />{metric.label}</div>)}
        </div>

        {message ? <div className="notice-card" style={{ marginBottom: 16 }}>{message}</div> : null}

        <div style={{ display: 'grid', gap: 14 }}>
          {items.length === 0 && !isLoading ? <div className="notice-card">No onboarding items found.</div> : null}
          {items.map((item) => (
            <article key={item.referenceId} className="notice-card" style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong>{item.schoolName}</strong>
                  <div>{item.schoolId || 'school_id pending'} • {item.requestType.replaceAll('_', ' ')} • {item.referenceId}</div>
                </div>
                <span>{onboardingStatusTone(item.status)}</span>
              </div>
              <div style={{ opacity: 0.86 }}>
                Contact: {item.contactPerson || 'Not provided'} • {item.contactPhone || 'No phone'} • {item.contactEmail || 'No email'}<br />
                Size: {item.expectedStudents ?? '—'} students / {item.expectedTeachers ?? '—'} teachers • Location: {[item.city, item.state].filter(Boolean).join(', ') || 'Not provided'}
              </div>
              <div className="button-row">
                <button className="secondary-button" type="button" onClick={() => setSelected(item)}>View Details</button>
                {item.status === 'ACTIVE' ? <span className="secondary-button" style={{ pointerEvents: 'none', opacity: 0.82 }}>Activated ✓</span> : null}
                {ONBOARDING_ACTIONS.filter((action) => canRunAction(item.status, action.status)).map((action) => (
                  <button
                    key={action.endpoint}
                    className={action.status === 'ACTIVE' ? 'primary-button' : 'secondary-button'}
                    type="button"
                    disabled={activeReference === item.referenceId}
                    onClick={() => runAction(item, action.endpoint as 'approve' | 'reject' | 'mark-pilot' | 'activate', action.label)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,22,0.72)', zIndex: 20, padding: 24, overflow: 'auto' }} onClick={() => setSelected(null)}>
          <section className="premium-panel" style={{ maxWidth: 760, margin: '40px auto', borderRadius: 26, padding: 24 }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div><p className="eyebrow">REQUEST DETAIL</p><h2 style={{ marginTop: 4 }}>{selected.schoolName}</h2></div>
              <button className="secondary-button" type="button" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div className="notice-card" style={{ marginTop: 12 }}>
              <strong>Status:</strong> {onboardingStatusLabel(selected.status)}<br />
              <strong>Reference:</strong> {selected.referenceId}<br />
              <strong>school_id:</strong> {selected.schoolId || 'Pending'}<br />
              <strong>Expected size:</strong> {selected.expectedStudents ?? '—'} students / {selected.expectedTeachers ?? '—'} teachers<br />
              <strong>Contact:</strong> {selected.contactPerson || '—'} • {selected.contactPhone || '—'} • {selected.contactEmail || '—'}<br />
              <strong>Submitted:</strong> {selected.submittedAt || '—'}<br />
              <strong>Last Updated:</strong> {selected.updatedAt || '—'}
            </div>
            <h3>Audit History</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {splitHistory(selected.statusHistory).length ? splitHistory(selected.statusHistory).map((line) => <div className="notice-card" key={line}>{line}</div>) : <div className="notice-card">No audit history found yet.</div>}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
