'use client';

import { useEffect, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import WorkspaceChecklistCard from '@/components/workspace/WorkspaceChecklistCard';
import WorkspaceProgressCard from '@/components/workspace/WorkspaceProgressCard';
import WorkspaceSetupForms from '@/components/workspace/WorkspaceSetupForms';
import type { ApiEnvelope, WorkspaceChecklist } from '@/components/workspace/workspaceTypes';
import { webApi } from '@/lib/apiClient';
import { getStoredUser, isValidTenantUser } from '@/lib/auth';

export default function WorkspaceSetupPage() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [checklist, setChecklist] = useState<WorkspaceChecklist | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = getStoredUser();
    if (!isValidTenantUser(stored) || !['ADMIN', 'PRINCIPAL'].includes(stored.role)) {
      setError('Workspace setup is available only for Admin and Principal users.');
      return;
    }
    setUser(stored);
    webApi.workspaceSetupStatus<ApiEnvelope<WorkspaceChecklist>>(stored.schoolId, stored.token)
      .then((response) => setChecklist(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load workspace setup.'));
  }, []);

  return (
    <PortalShell role={user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN'} title="Workspace Initialization" subtitle="Complete setup prerequisites before Import School Data is unlocked." variant="gold">
      <ShellStyles />
      {error && <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}><strong>{error}</strong></section>}
      {!error && !checklist && <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>Loading workspace setup...</section>}
      {user && checklist && (
        <>
          <WorkspaceProgressCard checklist={checklist} />
          <div className="two-column two-column--dashboard erp-section">
            <WorkspaceChecklistCard checklist={checklist} />
            <WorkspaceSetupForms user={user} checklist={checklist} onSaved={setChecklist} />
          </div>
        </>
      )}
    </PortalShell>
  );
}
