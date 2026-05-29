'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { ONBOARDING_STATUS_OPTIONS, OnboardingReviewItem, OnboardingStatusResponse, onboardingStatusLabel, onboardingStatusTone } from '@/lib/onboardingLifecycle';

export default function OnboardingReviewPage() {
  const [items, setItems] = useState<OnboardingReviewItem[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeReference, setActiveReference] = useState<string | null>(null);

  async function loadQueue() {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await webApi.onboardingReviewQueue<OnboardingReviewItem[]>();
      setItems(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load onboarding review queue.');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(referenceId: string, status: string) {
    setActiveReference(referenceId);
    setMessage('');
    try {
      const response = await webApi.updateOnboardingStatus<OnboardingStatusResponse>(referenceId, status, `Moved to ${status} from onboarding review queue.`);
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
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">TENANT ACTIVATION</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Onboarding Review Queue</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>
          Review school registrations and pilot demo requests through Pending, Approved, Pilot, and Active states. Final Excel import remains disabled.
        </p>

        <div className="button-row" style={{ marginBottom: 18 }}>
          <button className="secondary-button" type="button" onClick={loadQueue}>{isLoading ? 'Loading...' : 'Refresh Queue'}</button>
          <Link className="secondary-button" href="/login">Back to Login</Link>
        </div>

        {message ? <div className="notice-card" style={{ marginBottom: 16 }}>{message}</div> : null}

        <div style={{ display: 'grid', gap: 14 }}>
          {items.length === 0 && !isLoading ? <div className="notice-card">No pending onboarding items found.</div> : null}
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
                {ONBOARDING_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    className={status === 'ACTIVE' ? 'primary-button' : 'secondary-button'}
                    type="button"
                    disabled={activeReference === item.referenceId || item.status === status}
                    onClick={() => updateStatus(item.referenceId, status)}
                  >
                    {item.status === status ? onboardingStatusLabel(status) : `Set ${onboardingStatusLabel(status)}`}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
