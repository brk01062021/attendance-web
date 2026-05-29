'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { OnboardingStatusResponse, onboardingStatusLabel } from '@/lib/onboardingLifecycle';

function cleanReference(value: string) {
  return value.trim().toUpperCase();
}

export default function CheckRegistrationStatusPage() {
  const [referenceId, setReferenceId] = useState('');
  const [status, setStatus] = useState<OnboardingStatusResponse | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = cleanReference(referenceId);
    if (!clean) {
      setMessage('Enter the reference ID received after registration.');
      return;
    }
    setLoading(true);
    setMessage('');
    setStatus(null);
    try {
      const response = await webApi.onboardingStatus<OnboardingStatusResponse>(clean);
      setStatus(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to find registration status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: 24 }}>
      <ShellStyles />
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">PUBLIC ONBOARDING STATUS</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Check Registration Status</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>
          Schools can track onboarding by reference ID. Login credentials are issued only after the tenant becomes Active.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <label>
            Reference ID
            <input value={referenceId} onChange={(event) => setReferenceId(event.target.value.toUpperCase())} placeholder="REG-202605290012-D74FC5" />
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check Status'}</button>
            <Link className="secondary-button" href="/login">Back to Login</Link>
          </div>
        </form>
        {message ? <div className="notice-card" style={{ marginTop: 16 }}>{message}</div> : null}
        {status ? (
          <div className="notice-card" style={{ marginTop: 16 }}>
            <strong>{status.schoolName}</strong><br />
            Reference: {status.referenceId}<br />
            school_id: {status.schoolId || 'Pending'}<br />
            Status: {onboardingStatusLabel(status.status)}<br />
            Login: {status.loginEnabled ? 'Enabled after credentials are shared' : 'Disabled until Active'}<br />
            Excel Import: Disabled<br /><br />
            {status.message}<br />
            Next: {status.nextStep}
          </div>
        ) : null}
      </section>
    </main>
  );
}
