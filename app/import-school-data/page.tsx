'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ImportValidationDashboard from '@/components/erp/ImportValidationDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import type { ApiEnvelope, WorkspaceChecklist } from '@/components/workspace/workspaceTypes';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

export default function Page() {
  const [checklist, setChecklist] = useState<WorkspaceChecklist | null>(null);
  const [error, setError] = useState('');
  const user = typeof window !== 'undefined' ? getStoredUser() : null;

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.schoolId) return;
    webApi.workspaceImportLock<ApiEnvelope<WorkspaceChecklist>>(stored.schoolId, stored.token)
      .then((response) => setChecklist(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to verify import lock.'));
  }, []);

  const locked = checklist?.importLocked;

  return (
    <PortalShell
      role={user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN'}
      title="Import School Data"
      subtitle="Excel-first onboarding workspace for real school activation, validation, and tenant-safe import review."
      variant="gold"
    >
      <ShellStyles />
      {(locked || error) && (
        <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
          <p className="eyebrow">Import lock</p>
          <h2>🔒 Import School Data Locked</h2>
          <p>{error || checklist?.importLockMessage}</p>
          <p>{checklist ? `${checklist.completedSteps}/${checklist.totalSteps} setup steps complete.` : 'Workspace setup status is required before import.'}</p>
          <Link className="action-card action-card--compact" href="/workspace-setup">Open Workspace Initialization</Link>
        </section>
      )}
      {!locked && !error && <ImportValidationDashboard />}
    </PortalShell>
  );
}
