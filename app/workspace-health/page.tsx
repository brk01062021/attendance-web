'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { getStoredUser, isValidTenantUser } from '@/lib/auth';

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T } | T;

type HealthItem = {
  key: string;
  label: string;
  status: 'READY' | 'PENDING' | string;
  message: string;
};

type AuditItem = {
  eventType: string;
  title: string;
  description: string;
  status: string;
  eventAt?: string;
};

type ActivationSummary = {
  schoolId: string;
  schoolName: string;
  academicYear?: string;
  activationStatus: string;
  activationMessage: string;
  schoolProfileReady: boolean;
  academicYearReady: boolean;
  workspaceSetupReady: boolean;
  importCommitted: boolean;
  readyForActivation: boolean;
  readinessPercent: number;
  committedWorkbookCount: number;
  lastWorkbookCommittedAt?: string;
  healthItems: HealthItem[];
  auditTrail: AuditItem[];
};

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload && (payload as { data?: T }).data) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusLabel(status?: string) {
  return String(status || 'PENDING').replaceAll('_', ' ');
}

export default function WorkspaceHealthPage() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [summary, setSummary] = useState<ActivationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const role = user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN';

  const loadSummary = useCallback(async (tenantUser: NonNullable<ReturnType<typeof getStoredUser>>) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const response = await webApi.workspaceActivationSummary<ApiEnvelope<ActivationSummary>>(tenantUser.schoolId, tenantUser.token);
      setSummary(unwrap(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Workspace Health Center.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (!isValidTenantUser(stored) || !['ADMIN', 'PRINCIPAL'].includes(stored.role)) {
      setError('Workspace Health Center is available only for Admin and Principal users.');
      setLoading(false);
      return;
    }
    setUser(stored);
    loadSummary(stored);
  }, [loadSummary]);

  const gates = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'School Profile', ready: summary.schoolProfileReady },
      { label: 'Academic Year', ready: summary.academicYearReady },
      { label: 'Workspace Setup', ready: summary.workspaceSetupReady },
      { label: 'Workbook Commit', ready: summary.importCommitted },
    ];
  }, [summary]);

  async function handleActivate() {
    if (!user || !summary?.readyForActivation) return;
    setActivating(true);
    setError('');
    setNotice('');
    try {
      const response = await webApi.activateWorkspace<ApiEnvelope<ActivationSummary>>(user.schoolId, {
        activatedBy: user.displayName || user.username || user.role,
        remarks: 'Activated from Workspace Health Center',
      }, user.token);
      setSummary(unwrap(response));
      setNotice('Workspace activation checks passed. Continue with Admin/Principal operational monitoring.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workspace activation could not be completed.');
    } finally {
      setActivating(false);
    }
  }

  return (
    <PortalShell
      role={role}
      title="Workspace Health Center"
      subtitle="Review real school activation readiness, tenant status, and workspace provisioning health."
      variant="gold"
    >
      <ShellStyles />
      <style jsx>{`
        .health-hero { display: grid; grid-template-columns: 1.3fr .7fr; gap: 20px; align-items: stretch; }
        .panel { padding: 24px; border-radius: 26px; }
        .readiness { font-size: 56px; line-height: 1; color: #f6d36f; font-weight: 900; }
        .status-pill { display: inline-flex; border-radius: 999px; padding: 8px 12px; background: rgba(82, 61, 19, .52); color: #ffe5a3; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
        .gate { padding: 16px; border-radius: 20px; background: rgba(255,255,255,.48); border: 1px solid rgba(124, 90, 32, .18); }
        .gate strong, .health-card strong { display: block; color: #3a270b; }
        .gate small, .health-card p, .audit p { color: rgba(58,39,11,.72); }
        .health-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .health-card, .audit { padding: 18px; border-radius: 20px; background: rgba(255,255,255,.5); border: 1px solid rgba(124, 90, 32, .16); }
        .audit-list { display: grid; gap: 12px; }
        .actions { display:flex; gap: 12px; flex-wrap: wrap; align-items:center; }
        .primary { border:0; border-radius: 999px; padding: 12px 18px; background: linear-gradient(135deg,#8a5a13,#d49b28); color: #fff8db; font-weight: 900; cursor:pointer; }
        .primary:disabled { opacity:.58; cursor:not-allowed; }
        @media (max-width: 900px) { .health-hero, .health-grid { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>

      {error && <section className="glass-panel premium-panel erp-section panel"><strong>{error}</strong></section>}
      {notice && <section className="glass-panel premium-panel erp-section panel"><strong>{notice}</strong></section>}
      {loading && !error && <section className="glass-panel premium-panel erp-section panel">Loading Workspace Health Center...</section>}

      {!loading && summary && (
        <>
          <section className="health-hero erp-section">
            <div className="glass-panel premium-panel panel">
              <span className="status-pill">{statusLabel(summary.activationStatus)}</span>
              <h2>{summary.schoolName}</h2>
              <p>{summary.activationMessage}</p>
              <div className="grid">
                {gates.map((gate) => (
                  <div className="gate" key={gate.label}>
                    <strong>{gate.ready ? 'Ready' : 'Pending'}</strong>
                    <small>{gate.label}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel premium-panel panel">
              <p className="section-eyebrow">Readiness</p>
              <div className="readiness">{summary.readinessPercent}%</div>
              <p>Committed workbooks: {summary.committedWorkbookCount}</p>
              <p>Last commit: {formatDate(summary.lastWorkbookCommittedAt)}</p>
              <div className="actions">
                <button className="primary" disabled={!summary.readyForActivation || activating} onClick={handleActivate}>
                  {activating ? 'Checking...' : 'Activate Workspace'}
                </button>
              </div>
            </div>
          </section>

          <section className="glass-panel premium-panel erp-section panel">
            <p className="section-eyebrow">School Configuration Summary</p>
            <div className="health-grid">
              {summary.healthItems.map((item) => (
                <div className="health-card" key={item.key}>
                  <span className="status-pill">{statusLabel(item.status)}</span>
                  <strong style={{ marginTop: 10 }}>{item.label}</strong>
                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel premium-panel erp-section panel">
            <p className="section-eyebrow">Activation Audit Trail</p>
            <div className="audit-list">
              {summary.auditTrail.map((item, index) => (
                <div className="audit" key={`${item.eventType}-${index}`}>
                  <span className="status-pill">{statusLabel(item.status)}</span>
                  <strong style={{ display: 'block', marginTop: 10 }}>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>{formatDate(item.eventAt)}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </PortalShell>
  );
}
