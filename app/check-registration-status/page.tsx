'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { OnboardingStatusResponse, normalizeOnboardingText, onboardingStatusLabel, statusTimeline } from '@/lib/onboardingLifecycle';

function cleanReference(value: string) { return value.trim().toUpperCase(); }
function row(label: string, value?: string | null) { return <div><strong>{label}:</strong> {value || '—'}</div>; }

export default function CheckRegistrationStatusPage() {
  const [referenceId, setReferenceId] = useState('');
  const [status, setStatus] = useState<OnboardingStatusResponse | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = cleanReference(referenceId);
    if (!clean) { setMessage('Enter the reference ID received after registration.'); return; }
    setLoading(true); setMessage(''); setStatus(null);
    try { setStatus(await webApi.onboardingStatus<OnboardingStatusResponse>(clean)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to find registration status.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: '36px 24px' }}>
      <ShellStyles />
      <section
        className="premium-panel"
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(760px, calc(100vw - 48px))',
          margin: '0 auto',
          borderRadius: 28,
          padding: '24px 28px',
        }}
      >
        <p className="eyebrow" style={{ marginBottom: 8, letterSpacing: 2.6, fontSize: 12 }}>PUBLIC ONBOARDING STATUS</p>
        <h1
          className="erp-page-title erp-school-name-title"
          style={{ margin: '0 0 10px', fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.05 }}
        >
          Check Registration Status
        </h1>
        <p
          className="erp-workspace-subtitle erp-workspace-context-title"
          style={{ margin: '0 0 14px', maxWidth: 680, fontSize: 15, lineHeight: 1.45 }}
        >
          Enter the Reference ID received after Register School or Request Pilot Demo. Login access stays disabled until the VidyaSetu Onboarding Team activates the school workspace and issues credentials.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <label style={{ display: 'grid', gap: 7, fontWeight: 900, color: '#f8ecd1', fontSize: 14 }}>
            Reference ID
            <input
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value.toUpperCase())}
              placeholder="Enter Reference ID"
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid rgba(238, 204, 112, 0.72)',
                background: 'rgba(255, 253, 245, 0.96)',
                color: '#071b34',
                padding: '13px 15px',
                fontSize: 15,
                fontWeight: 800,
                outline: 'none',
              }}
            />
          </label>
          <div className="button-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check Status'}</button>
            <Link className="secondary-button" href="/login">Back to Login</Link>
          </div>
        </form>

        {message ? <div className="notice-card" style={{ marginTop: 16 }}>{message}</div> : null}
        {status ? (
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div className="notice-card">
              <strong style={{ fontSize: 18 }}>{status.schoolName}</strong><br />
              {row('Reference ID', status.referenceId)}
              {row('School ID', status.schoolId || 'Pending')}
              {row('Registration Date', status.registrationDate || status.submittedAt)}
              {row('Current Status', onboardingStatusLabel(status.status))}
              {row('Login Access', status.loginEnabled ? (status.credentialsIssuedAt ? 'Enabled — credentials issued' : 'Enabled — credentials pending') : 'Disabled until Active + Credentials Issued')}
              {row('Next Step', normalizeOnboardingText(status.nextStep))}
            </div>

            <div className="notice-card">
              <strong>Status Message</strong>
              <p style={{ margin: '8px 0 0' }}>{normalizeOnboardingText(status.message)}</p>
            </div>

            <div className="notice-card">
              <strong>Status Timeline</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 12 }}>
                {statusTimeline(status.status).map((step) => <div key={step.key} className="secondary-button" style={{ pointerEvents: 'none', opacity: step.done ? 1 : 0.45 }}>{step.done ? '✓ ' : '○ '}{step.label}</div>)}
              </div>
            </div>

            <div className="notice-card">
              <strong>Audit History</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                {row('Submitted By', status.submittedBy || 'School Registration Portal')}
                {row('Submitted Date', status.submittedAt)}
                {row('Approved By', status.approvedBy)}
                {row('Approved Date', status.approvedAt)}
                {row('Pilot Enabled By', status.pilotEnabledBy)}
                {row('Pilot Date', status.pilotActivatedAt)}
                {row('Activated By', status.activatedBy)}
                {row('Activated Date', status.activatedAt)}
                {row('Credentials Issued By', status.credentialsIssuedBy)}
                {row('Credentials Issued Date', status.credentialsIssuedAt)}
                {status.statusHistory ? <pre style={{ whiteSpace: 'pre-wrap', margin: '10px 0 0', color: '#233044', fontWeight: 700 }}>{normalizeOnboardingText(status.statusHistory)}</pre> : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
