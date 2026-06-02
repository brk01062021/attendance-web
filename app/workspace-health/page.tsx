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

type ActivationTimelineItem = {
  stepKey: string;
  title: string;
  status: string;
  note: string;
  eventAt?: string;
};

type ActivationOperationsCenter = {
  schoolId: string;
  schoolName: string;
  activationStatus: string;
  reportingStatus: string;
  readinessPercent: number;
  readyForActivation: boolean;
  tenantActive: boolean;
  operationsNote: string;
  timeline: ActivationTimelineItem[];
  notesHistory: string[];
};

type WorkbookIssue = {
  sheetName?: string;
  rowNumber?: number;
  fieldName?: string;
  severity?: string;
  message?: string;
};

type WorkbookErrorGroup = {
  category: string;
  title: string;
  explanation: string;
  recommendedAction: string;
  errorCount: number;
  warningCount: number;
  issues: WorkbookIssue[];
};

type WorkbookErrorIntelligence = {
  schoolId: string;
  fileName?: string;
  status: string;
  headline: string;
  totalErrors: number;
  totalWarnings: number;
  activationBlocked: boolean;
  missingSheets: string[];
  schoolIdMismatchExplanations: string[];
  groups: WorkbookErrorGroup[];
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
  tenantActive?: boolean;
  goLiveStatus?: string;
  activationButtonLabel?: string;
  activatedBy?: string;
  activatedAt?: string;
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

function isActive(summary?: ActivationSummary | null) {
  return summary?.activationStatus === 'ACTIVE' || summary?.tenantActive === true;
}

function activatedByLabel(summary?: ActivationSummary | null) {
  return isActive(summary) && summary?.activatedBy ? summary.activatedBy : 'Not activated';
}

function activatedAtLabel(summary?: ActivationSummary | null) {
  return isActive(summary) && summary?.activatedAt ? formatDate(summary.activatedAt) : 'Not activated';
}


function normalizedGroupText(group: WorkbookErrorGroup) {
  return `${group.category || ''} ${group.title || ''}`.toUpperCase();
}

function isTeacherAssignmentGroup(group: WorkbookErrorGroup) {
  return normalizedGroupText(group).includes('TEACHER_ASSIGNMENT');
}

function isScheduleGroup(group: WorkbookErrorGroup) {
  return normalizedGroupText(group).includes('SCHEDULE');
}

function isMissingSheetsGroup(group: WorkbookErrorGroup) {
  return normalizedGroupText(group).includes('MISSING') && normalizedGroupText(group).includes('SHEET');
}

function isSchoolIdMismatchGroup(group: WorkbookErrorGroup) {
  return normalizedGroupText(group).includes('SCHOOL') && normalizedGroupText(group).includes('MISMATCH');
}

function isCompactValidationGroup(group: WorkbookErrorGroup) {
  return isTeacherAssignmentGroup(group) || isScheduleGroup(group) || isMissingSheetsGroup(group) || isSchoolIdMismatchGroup(group);
}

function compactValidationMessage(group: WorkbookErrorGroup) {
  const total = (group.errorCount || 0) + (group.warningCount || 0);
  if (isTeacherAssignmentGroup(group)) {
    return `${total} ${total === 1 ? 'issue' : 'issues'} found. Review the Web ERP Workbook Validation screen for teacher assignment row-level details and correction guidance.`;
  }
  if (isScheduleGroup(group)) {
    return `${total} ${total === 1 ? 'issue' : 'issues'} found. Review the Web ERP Workbook Validation screen for timetable row-level details and correction guidance.`;
  }
  if (isMissingSheetsGroup(group)) {
    return `${group.errorCount || total} required workbook ${group.errorCount === 1 ? 'sheet is' : 'sheets are'} missing. Download the latest VidyaSetu workbook template, add the missing tabs, and upload again.`;
  }
  if (isSchoolIdMismatchGroup(group)) {
    return 'Workbook School ID does not match the active school workspace. Update the SchoolProfile sheet to use the logged-in school workspace ID and upload again.';
  }
  return `${total} ${total === 1 ? 'issue' : 'issues'} found. Review the Web ERP Workbook Validation screen for full details and correction guidance.`;
}

function groupWorkbookUploadAttempts(timeline: ActivationTimelineItem[]) {
  const uploads = timeline.filter((item) => item.stepKey === 'WORKBOOK_IMPORT' && item.title.toLowerCase().includes('workbook uploaded'));
  const others = timeline.filter((item) => !(item.stepKey === 'WORKBOOK_IMPORT' && item.title.toLowerCase().includes('workbook uploaded')));

  if (uploads.length <= 1) return timeline;

  const latest = uploads[0];
  const previous = uploads.slice(1, 5).map((item) => formatDate(item.eventAt)).join(' • ');

  return [
    ...others.slice(0, 1),
    {
      ...latest,
      title: `Workbook uploaded (${uploads.length} attempts)`,
      note: `Latest: ${latest.note}${previous ? ` • Previous: ${previous}` : ''}`,
    },
    ...others.slice(1),
  ];
}

export default function WorkspaceHealthPage() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [summary, setSummary] = useState<ActivationSummary | null>(null);
  const [operations, setOperations] = useState<ActivationOperationsCenter | null>(null);
  const [errorIntel, setErrorIntel] = useState<WorkbookErrorIntelligence | null>(null);
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
      const [summaryResponse, operationsResponse, errorIntelResponse] = await Promise.all([
        webApi.workspaceActivationSummary<ApiEnvelope<ActivationSummary>>(tenantUser.schoolId, tenantUser.token),
        webApi.activationOperationsCenter<ApiEnvelope<ActivationOperationsCenter>>(tenantUser.schoolId, tenantUser.token),
        webApi.workbookErrorIntelligence<ApiEnvelope<WorkbookErrorIntelligence>>(tenantUser.schoolId, tenantUser.token),
      ]);
      setSummary(unwrap(summaryResponse));
      setOperations(unwrap(operationsResponse));
      setErrorIntel(unwrap(errorIntelResponse));
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
      { label: 'Go-Live Status', ready: summary.activationStatus === 'ACTIVE' || summary.tenantActive },
    ];
  }, [summary]);

  const groupedTimeline = useMemo(() => groupWorkbookUploadAttempts(operations?.timeline || []), [operations]);

  const blockerMessage = useMemo(() => {
    if (!errorIntel?.activationBlocked) return summary?.activationMessage || 'Workspace activation readiness is being reviewed.';
    const errors = errorIntel.totalErrors || 0;
    const warnings = errorIntel.totalWarnings || 0;
    return `Activation is blocked. ${errors} workbook validation errors and ${warnings} warnings must be resolved before workbook commit and activation can proceed.`;
  }, [errorIntel, summary]);

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
      setNotice('Workspace activation completed. School is now live ready for Admin/Principal operational monitoring.');
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
        .status-pill.error { background: rgba(100, 22, 22, .56); color: #ffe2d8; }
        .status-pill.warn { background: rgba(104, 72, 15, .58); color: #ffeab0; }
        .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
        .gate { padding: 16px; border-radius: 20px; background: rgba(255,255,255,.48); border: 1px solid rgba(124, 90, 32, .18); }
        .gate strong, .health-card strong { display: block; color: #3a270b; }
        .gate small, .health-card p, .audit p { color: rgba(58,39,11,.72); }
        .health-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .tri-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .health-card, .audit { padding: 18px; border-radius: 20px; background: rgba(255,255,255,.5); border: 1px solid rgba(124, 90, 32, .16); }
        .issue-list { display: grid; gap: 8px; margin-top: 12px; }
        .issue-item { padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,.44); color: rgba(58,39,11,.76); font-size: 13px; }
        .sheet-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .sheet-chip { padding: 8px 11px; border-radius: 999px; background: rgba(100, 22, 22, .14); border: 1px solid rgba(100,22,22,.18); color: #6c271b; font-weight: 800; font-size: 12px; }
        .audit-list { display: grid; gap: 12px; }
        .actions { display:flex; gap: 12px; flex-wrap: wrap; align-items:center; }
        .primary { border:0; border-radius: 999px; padding: 12px 18px; background: linear-gradient(135deg,#8a5a13,#d49b28); color: #fff8db; font-weight: 900; cursor:pointer; }
        .primary:disabled { opacity:.58; cursor:not-allowed; }
        .primary.pending { background: rgba(255,255,255,.42); color: #66420d; border: 1px solid rgba(124,90,32,.24); }
        @media (max-width: 900px) { .health-hero, .health-grid, .tri-grid { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
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
              <p>{blockerMessage}</p>
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
              <p>Activated by: {activatedByLabel(summary)}</p>
              <p>Activated at: {activatedAtLabel(summary)}</p>
              <div className="actions">
                <button className={`primary ${!summary.readyForActivation ? 'pending' : ''}`} disabled={!summary.readyForActivation || activating} onClick={handleActivate}>
                  {activating ? 'Checking...' : (summary.readyForActivation ? (summary.activationButtonLabel || 'Activate Workspace') : (errorIntel?.activationBlocked ? 'Resolve Workbook Errors First' : 'Workbook Commit Pending'))}
                </button>
              </div>
            </div>
          </section>

          {errorIntel ? (
            <section className="glass-panel premium-panel erp-section panel">
              <p className="section-eyebrow">Workbook Error Intelligence</p>
              <div className="tri-grid" style={{ marginBottom: 14 }}>
                <div className="health-card"><span className="status-pill error">{statusLabel(errorIntel.status)}</span><strong style={{ marginTop: 10 }}>Workbook Status</strong><p>{errorIntel.headline}</p></div>
                <div className="health-card"><strong>Total Errors</strong><p>{errorIntel.totalErrors}</p><strong style={{ marginTop: 10 }}>Total Warnings</strong><p>{errorIntel.totalWarnings}</p></div>
                <div className="health-card"><strong>Workbook File</strong><p>{errorIntel.fileName || 'Not available'}</p><strong style={{ marginTop: 10 }}>Activation Blocked</strong><p>{errorIntel.activationBlocked ? 'Yes' : 'No'}</p></div>
              </div>

              <div className="health-grid" style={{ marginBottom: 14 }}>
                <div className="health-card">
                  <strong>Missing Sheets Summary</strong>
                  <p>{errorIntel.missingSheets.length ? `${errorIntel.missingSheets.length} required workbook ${errorIntel.missingSheets.length === 1 ? 'sheet is' : 'sheets are'} missing before activation.` : 'No missing required sheets found.'}</p>
                  <div className="sheet-list">
                    {errorIntel.missingSheets.map((sheet) => <span className="sheet-chip" key={sheet}>{sheet}</span>)}
                  </div>
                </div>
                <div className="health-card">
                  <strong>School ID Mismatch Summary</strong>
                  <div className="issue-list">
                    {errorIntel.schoolIdMismatchExplanations.length ? (
                      <>
                        <div className="issue-item"><strong>Current Workspace</strong><br />{errorIntel.schoolId || summary.schoolId}</div>
                        <div className="issue-item"><strong>Action</strong><br />Update the SchoolProfile sheet to use the same 4-character School ID as this workspace, then upload again.</div>
                      </>
                    ) : (
                      <div className="issue-item">No School ID mismatch found for this workbook.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="health-grid">
                {errorIntel.groups.map((group) => (
                  <div className="health-card" key={group.category}>
                    <span className={`status-pill ${group.errorCount > 0 ? 'error' : 'warn'}`}>{group.errorCount} errors • {group.warningCount} warnings</span>
                    <strong style={{ marginTop: 10 }}>{group.title}</strong>
                    <p>{group.explanation}</p>
                    <p><strong>Recommended action</strong>{group.recommendedAction}</p>
                    <div className="issue-list">
                      {isCompactValidationGroup(group) ? (
                        <div className="issue-item"><strong>Validation reference</strong><br />{compactValidationMessage(group)}</div>
                      ) : (
                        <>
                          {group.issues.slice(0, 5).map((issue, index) => (
                            <div className="issue-item" key={`${group.category}-${index}`}>
                              <strong>{issue.sheetName || 'Workbook'}{issue.rowNumber ? ` • Row ${issue.rowNumber}` : ''}</strong><br />
                              {issue.fieldName ? `${issue.fieldName}: ` : ''}{issue.message || 'Review this workbook row.'}
                            </div>
                          ))}
                          {group.issues.length > 5 ? <div className="issue-item">+ {group.issues.length - 5} more issues in this category. Review the workbook validation screen for full details.</div> : null}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="glass-panel premium-panel erp-section panel">
            <p className="section-eyebrow">Admin/Principal Activation Summary</p>
            <div className="health-grid" style={{ marginBottom: 14 }}>
              <div className="health-card"><strong>Activation Status</strong><p>{statusLabel(summary.activationStatus)}</p></div>
              <div className="health-card"><strong>Go-Live Readiness</strong><p>{statusLabel(summary.goLiveStatus || 'NOT_READY')}</p></div>
              <div className="health-card"><strong>Activated By</strong><p>{activatedByLabel(summary)}</p></div>
              <div className="health-card"><strong>Operational Summary</strong><p>{blockerMessage}</p></div>
            </div>
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

          {operations ? (
            <section className="glass-panel premium-panel erp-section panel">
              <p className="section-eyebrow">Activation Operations Center</p>
              <div className="health-grid" style={{ marginBottom: 14 }}>
                <div className="health-card"><strong>Reporting Status</strong><p>{statusLabel(operations.reportingStatus)}</p></div>
                <div className="health-card"><strong>Readiness</strong><p>{operations.readinessPercent}%</p></div>
                <div className="health-card"><strong>Tenant Active</strong><p>{operations.tenantActive ? 'Yes' : 'No'}</p></div>
                <div className="health-card"><strong>Operations Note</strong><p>{blockerMessage}</p></div>
              </div>
              <p className="section-eyebrow">Activation Timeline</p>
              <div className="audit-list">
                {groupedTimeline.slice(0, 8).map((item, index) => (
                  <div className="audit" key={`${item.stepKey}-${index}`}>
                    <span className="status-pill">{statusLabel(item.status)}</span>
                    <strong style={{ display: 'block', marginTop: 10 }}>{item.title}</strong>
                    <p>{item.note}</p>
                    <small>{formatDate(item.eventAt)}</small>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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
