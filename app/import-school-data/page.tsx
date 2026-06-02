'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ImportValidationDashboard from '@/components/erp/ImportValidationDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import type { ApiEnvelope, WorkspaceChecklist } from '@/components/workspace/workspaceTypes';
import { extractWorkspaceChecklist, normalizeWorkspaceChecklist } from '@/components/workspace/workspaceProduction';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

export default function Page() {
  const [checklist, setChecklist] = useState<WorkspaceChecklist | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? getStoredUser() : null;

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.schoolId) {
      setLoading(false);
      setError('Login again to verify School Workspace Setup before import.');
      return;
    }

    let cancelled = false;
    const schoolId = stored.schoolId;
    const token = stored.token;

    async function loadImportLock() {
      setLoading(true);
      setError('');
      try {
        const response = await webApi.workspaceSetupStatus<ApiEnvelope<WorkspaceChecklist>>(schoolId, token);
        const payload = extractWorkspaceChecklist(response);
        if (!cancelled) {
          if (payload) {
            setChecklist(normalizeWorkspaceChecklist(payload));
          } else {
            setError('School Workspace Setup response format was not recognized.');
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to verify import lock.';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImportLock();

    return () => {
      cancelled = true;
    };
  }, []);

  const locked = checklist?.importLocked ?? true;

  return (
    <PortalShell
      role={user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN'}
      title="Import School Data"
      subtitle="Excel-first onboarding workspace for workbook validation, commit, import history, and school activation readiness."
      variant="gold"
    >
      <ShellStyles />
      {loading && (
        <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>Checking School Workspace Setup status...</section>
      )}
      {!loading && (locked || error) && (
        <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
          <p className="eyebrow">Import lock</p>
          <h2>🔒 Import School Data Locked</h2>
          <p>{error || checklist?.importLockMessage}</p>
          <p>{checklist ? `${checklist.completedSteps}/${checklist.totalSteps} setup steps complete.` : 'School Workspace Setup status is required before import.'}</p>
          <Link className="action-card action-card--compact" href="/workspace-setup">Open School Workspace Setup</Link>
        </section>
      )}
      {!loading && !locked && !error && (
        <>
          <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
            <p className="eyebrow">Workspace Ready</p>
            <h2>School Workbook Upload Ready</h2>
            <p>
              School Profile, Academic Year, Working Days, and School Timings are complete. Upload the Excel workbook to import and validate Classes, Sections, Teachers, Subjects, Teacher Assignments, Students, Parents, Holiday Calendar, and Academic Rules.
            </p>
          </section>
          <ImportValidationDashboard />
        </>
      )}
    </PortalShell>
  );
}
