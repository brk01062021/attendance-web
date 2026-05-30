'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { ActivationPackage, normalizeOnboardingText, onboardingStatusLabel, statusTimeline } from '@/lib/onboardingLifecycle';

export default function ActivationPackagePage() {
  const [referenceId, setReferenceId] = useState('');
  const [pkg, setPkg] = useState<ActivationPackage | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  async function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const clean = referenceId.trim().toUpperCase();
    if (!clean) { setMessage('Enter an ACTIVE tenant Reference ID.'); return; }
    setLoading(true); setMessage(''); setPkg(null);
    try { setPkg(await webApi.generateActivationPackage<ActivationPackage>(clean)); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to generate activation package.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: 24 }}>
      <ShellStyles />
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">ACTIVE TENANT CREDENTIALS</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Activation Package</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>Generate the first Admin and Principal accounts after a tenant reaches Active status.</p>
        <form onSubmit={generate} style={{ display: 'grid', gap: 14 }}>
          <label>Reference ID<input value={referenceId} onChange={(event) => setReferenceId(event.target.value.toUpperCase())} placeholder="Enter Reference ID" /></label>
          <div className="button-row"><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Activation Package'}</button><Link className="secondary-button" href="/onboarding-review">Review Queue</Link></div>
        </form>
        {message ? <div className="notice-card" style={{ marginTop: 16 }}>{message}</div> : null}
        {pkg ? (
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div className="notice-card"><strong>{pkg.schoolName}</strong><br />School ID: {pkg.schoolId}<br />Reference: {pkg.referenceId}<br />Status: {onboardingStatusLabel(pkg.status)}<br />Login Access: {pkg.loginEnabled ? 'Enabled' : 'Disabled'}<br />Credentials Issued: {pkg.credentialsIssuedAt || 'Just generated'}</div>
            <div className="notice-card"><strong>Activation Summary</strong><p style={{ margin: '8px 0 0' }}>{normalizeOnboardingText(pkg.message)} {normalizeOnboardingText(pkg.nextStep)}</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {pkg.credentials.map((credential) => (
                <div className="notice-card" key={credential.role}><strong>{credential.role}</strong><br />Username: {credential.username}<br />Temporary Password: {credential.initialPassword}<br />Display Name: {credential.displayName}<br />Account: {credential.created ? 'Created now' : 'Already available'}</div>
              ))}
            </div>
            <div className="notice-card"><strong>Status Timeline</strong><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 12 }}>{statusTimeline(pkg.status).map((step) => <div key={step.key} className="secondary-button" style={{ pointerEvents: 'none', opacity: step.done ? 1 : 0.45 }}>{step.done ? '✓ ' : '○ '}{step.label}</div>)}</div></div>
            <div className="notice-card"><strong>Audit History</strong><pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{normalizeOnboardingText(pkg.statusSummary?.statusHistory || 'No audit history found.')}</pre></div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
