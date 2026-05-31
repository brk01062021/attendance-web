'use client';

import { useCallback, useEffect, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import WorkspaceChecklistCard from '@/components/workspace/WorkspaceChecklistCard';
import WorkspaceProgressCard from '@/components/workspace/WorkspaceProgressCard';
import WorkspaceSetupForms from '@/components/workspace/WorkspaceSetupForms';
import type { ApiEnvelope, WorkspaceChecklist } from '@/components/workspace/workspaceTypes';
import { extractWorkspaceChecklist, normalizeWorkspaceChecklist } from '@/components/workspace/workspaceProduction';
import { webApi } from '@/lib/apiClient';
import { getStoredUser, isValidTenantUser } from '@/lib/auth';

export default function WorkspaceSetupPage() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [checklist, setChecklist] = useState<WorkspaceChecklist | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hydrateChecklist = useCallback((nextChecklist: WorkspaceChecklist) => {
    setChecklist(normalizeWorkspaceChecklist(nextChecklist));
  }, []);

  useEffect(() => {
    const stored = getStoredUser();

    if (!isValidTenantUser(stored) || !['ADMIN', 'PRINCIPAL'].includes(stored.role)) {
      setError('School Workspace Setup is available only for Admin and Principal users.');
      setLoading(false);
      return;
    }

    const tenantUser = stored;
    setUser(tenantUser);
    let cancelled = false;

    async function loadWorkspaceSetup() {
      setLoading(true);
      setError('');

      try {
        const response = await webApi.workspaceSetupStatus<ApiEnvelope<WorkspaceChecklist>>(
          tenantUser.schoolId,
          tenantUser.token
        );
        const payload = extractWorkspaceChecklist(response);

        if (!cancelled) {
          if (payload) {
            hydrateChecklist(payload);
          } else {
            setError('School Workspace Setup response format was not recognized.');
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load School Workspace Setup.';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkspaceSetup();

    return () => {
      cancelled = true;
    };
  }, [hydrateChecklist]);

  return (
    <PortalShell
      role={user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN'}
      title="School Workspace Setup"
      subtitle="Complete the required school setup before importing school data."
      variant="gold"
    >
      <ShellStyles />

      {error && (
        <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
          <strong>{error}</strong>
        </section>
      )}

      {loading && !error && (
        <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
          Loading School Workspace Setup...
        </section>
      )}

      {!loading && user && checklist && (
        <>
          <WorkspaceProgressCard checklist={checklist} />

          <div className="two-column two-column--dashboard erp-section">
            <WorkspaceChecklistCard checklist={checklist} />
            <WorkspaceSetupForms
              user={user}
              checklist={checklist}
              onSaved={hydrateChecklist}
            />
          </div>
        </>
      )}
    </PortalShell>
  );
}
