'use client';

import { useMemo, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import type {
  PrincipalTimetableIntelligence,
  TimetableArchiveSummary,
  TimetableBinaryExportResponse,
  TimetableNotification,
  TimetableOperationsStatus,
  TimetablePublishResponse,
  TimetableRepairResult,
  TimetableRolloutReadiness,
  TimetableVersion,
} from '@/types/timetable';

type ActiveLiveTimetable = { batchId?: string; published?: boolean; locked?: boolean; message?: string; entries?: { id: string; dayOfWeek: string; periodNumber: number; className: string; section: string; subjectName: string; teacherName: string }[] };

function safeRole(role?: string) {
  return role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN';
}

function downloadBase64File(file: TimetableBinaryExportResponse) {
  const byteCharacters = atob(file.base64Content);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: file.contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function TimetableOperationsPanel() {
  const user = getStoredUser();
  const role = safeRole(user?.role);
  const schoolId = user?.schoolId || '';
  const token = user?.token;

  const [batchId, setBatchId] = useState('');
  const cleanBatchId = useMemo(() => batchId.trim().toUpperCase(), [batchId]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Enter a timetable batch ID, then load operations.');
  const [status, setStatus] = useState<TimetableOperationsStatus | null>(null);
  const [readiness, setReadiness] = useState<TimetableRolloutReadiness | null>(null);
  const [intelligence, setIntelligence] = useState<PrincipalTimetableIntelligence | null>(null);
  const [versions, setVersions] = useState<TimetableVersion[]>([]);
  const [notifications, setNotifications] = useState<TimetableNotification[]>([]);
  const [archives, setArchives] = useState<TimetableArchiveSummary[]>([]);
  const [repairActions, setRepairActions] = useState<string[]>([]);
  const [activeLive, setActiveLive] = useState<ActiveLiveTimetable | null>(null);

  async function loadOperations(targetBatchId = cleanBatchId) {
    if (!targetBatchId) {
      setMessage('Enter a timetable batch ID first. Example: TT-99266EBB.');
      return;
    }
    setLoading(true);
    try {
      const [nextStatus, nextReadiness, nextIntelligence, nextVersions, nextNotifications, nextArchives] = await Promise.all([
        apiClient<TimetableOperationsStatus>(`/timetable/operations/status/${targetBatchId}`, { token, schoolId }),
        apiClient<TimetableRolloutReadiness>(`/timetable/operations/rollout-readiness/${targetBatchId}`, { token, schoolId }),
        apiClient<PrincipalTimetableIntelligence>('/timetable/operations/principal-analytics', { token, schoolId, query: { batchId: targetBatchId } }),
        apiClient<TimetableVersion[]>(`/timetable/operations/versions/${targetBatchId}`, { token, schoolId }),
        apiClient<TimetableNotification[]>(`/timetable/operations/notifications/${targetBatchId}`, { token, schoolId }),
        apiClient<TimetableArchiveSummary[]>('/timetable/operations/archives', { token, schoolId }),
      ]);
      setStatus(nextStatus);
      setReadiness(nextReadiness);
      setIntelligence(nextIntelligence);
      setVersions(nextVersions || []);
      setNotifications(nextNotifications || []);
      setArchives(nextArchives || []);
      setMessage('Timetable operations loaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load timetable operations. Confirm the batch ID and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadActivePublishedTimetable() {
    setLoading(true);
    try {
      const live = await apiClient<ActiveLiveTimetable>('/timetable/operations/live', { token, schoolId, query: { role } });
      setActiveLive(live);
      if (live.batchId) setBatchId(live.batchId);
      setMessage(live.message || 'Latest active published timetable loaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load active published timetable.');
    } finally {
      setLoading(false);
    }
  }

  async function runAutoRepair() {
    if (!cleanBatchId) return setMessage('Enter batch ID before running Auto Conflict Repair.');
    setLoading(true);
    try {
      const result = await apiClient<TimetableRepairResult>(`/timetable/auto-repair/${cleanBatchId}`, { method: 'POST', token, schoolId });
      setRepairActions(result.actions || []);
      setMessage(result.publishReady ? 'Auto repair completed. Timetable is publish-ready.' : 'Auto repair completed. Manual review is still recommended.');
      await loadOperations(result.batchId || cleanBatchId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Auto repair failed.');
    } finally {
      setLoading(false);
    }
  }

  async function runPublishLock() {
    if (!cleanBatchId) return setMessage('Enter batch ID before publishing.');
    setLoading(true);
    try {
      const response = await apiClient<TimetablePublishResponse>(`/timetable/operations/publish-lock/${cleanBatchId}`, {
        method: 'POST',
        token,
        schoolId,
        query: { role, approvedBy: role === 'PRINCIPAL' ? 'Principal' : 'Admin' },
      });
      setMessage(response.message || response.notificationMessage || 'Publish lock completed.');
      await loadOperations(cleanBatchId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Publish lock failed. Resolve conflicts first.');
    } finally {
      setLoading(false);
    }
  }

  async function runExport(format: 'PDF' | 'EXCEL') {
    if (!cleanBatchId) return setMessage('Enter batch ID before export.');
    setLoading(true);
    try {
      const file = await apiClient<TimetableBinaryExportResponse>(`/timetable/operations/export/${cleanBatchId}`, { token, schoolId, query: { format } });
      downloadBase64File(file);
      setMessage(`${file.fileName} generated and downloaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${format} export failed.`);
    } finally {
      setLoading(false);
    }
  }

  async function runRollback() {
    if (!cleanBatchId) return setMessage('Enter batch ID before rollback.');
    setLoading(true);
    try {
      const version = await apiClient<TimetableVersion>(`/timetable/operations/rollback/${cleanBatchId}/1`, {
        method: 'POST',
        token,
        schoolId,
        query: { role },
      });
      setMessage(version.notes || 'Rollback marker created. Batch is unlocked for review.');
      await loadOperations(cleanBatchId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Rollback failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-amber-300/40 bg-slate-950/90 p-6 text-white shadow-xl">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">Timetable Operations</p>
        <h2 className="mt-2 text-2xl font-black">Repair, Manual Review, Publish Lock, Export, and Principal Intelligence</h2>
        <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-white/70">{message}</p>
      </div>

      <div className="grid gap-4 rounded-[24px] border border-amber-200/70 bg-white/90 p-5 shadow-lg md:grid-cols-[1fr_auto]">
        <label className="text-sm font-black text-slate-800">
          Timetable Batch ID
          <input
            value={batchId}
            onChange={(event) => setBatchId(event.target.value.toUpperCase())}
            placeholder="Example: TT-99266EBB"
            className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-black tracking-wide text-slate-900 outline-none focus:border-amber-500"
          />
        </label>
        <button type="button" onClick={() => loadOperations()} disabled={loading} className="self-end rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-60">
          {loading ? 'Working...' : 'Load Operations'}
        </button>
      </div>

      {status ? (
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Publish Lock" value={status.locked ? 'LOCKED' : 'DRAFT'} />
          <Metric label="Latest Published" value={status.latestPublished ? 'YES' : 'NO'} />
          <Metric label="Entries" value={String(status.entries)} />
          <Metric label="Conflicts" value={String(status.conflicts)} />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <Action title="Auto Conflict Repair" body="Repair teacher overlaps and lab-heavy advisories." onClick={runAutoRepair} />
        <Action title="Manual Edit" body="Open review/edit flow after repair. Manual edits are locked after publish." onClick={() => setMessage('Manual edit is available from the timetable review flow.')} />
        <Action title="Publish Timetable" body="Admin/Principal publish lock after zero blocking conflicts." onClick={runPublishLock} />
        <Action title="Rollback / Unlock" body="Create rollback audit marker and return to review mode." onClick={runRollback} />
        <Action title="Download PDF" body="Generate PDF timetable export payload." onClick={() => runExport('PDF')} />
        <Action title="Download Excel" body="Generate Excel-compatible timetable export." onClick={() => runExport('EXCEL')} />
        <Action title="Active Published Timetable" body="Load latest ACTIVE timetable for Admin/Principal consumption." onClick={loadActivePublishedTimetable} />
        <Action title="Principal Intelligence" body="Load readiness score, risk teachers, and executive insights." onClick={() => loadOperations()} />
        <Action title="Refresh History" body="Reload publish history, archive, versions, and notifications." onClick={() => loadOperations()} />
      </div>

      {activeLive ? (
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Active Batch" value={activeLive.batchId || 'NONE'} />
          <Metric label="Published" value={activeLive.published ? 'YES' : 'NO'} />
          <Metric label="Locked" value={activeLive.locked ? 'YES' : 'NO'} />
          <Metric label="Visible Entries" value={String(activeLive.entries?.length || 0)} />
        </div>
      ) : null}

      {readiness ? (
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="rounded-[24px] border border-amber-200 bg-white/90 p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Rollout Readiness</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{readiness.readinessScore}%</p>
            <p className="mt-2 text-sm font-bold text-slate-600">{readiness.readyForRollout ? 'Ready for school rollout.' : 'Review blockers before rollout.'}</p>
          </div>
          <ListPanel title="Readiness Checks" items={[...(readiness.checks || []), ...(readiness.blockers || []).map((item) => `Blocker: ${item}`)]} />
        </div>
      ) : null}

      {intelligence ? <ListPanel title={`Principal Timetable Intelligence • ${intelligence.readinessStatus}`} items={intelligence.insights || []} /> : null}
      {repairActions.length ? <ListPanel title="Latest Auto Repair Actions" items={repairActions} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <ListPanel title="Version / Rollback History" items={versions.map((item) => `V${item.versionNumber} • ${item.changeType} • ${item.createdBy} • ${item.notes}`)} />
        <ListPanel title="Publish Notifications" items={notifications.map((item) => `${item.audience} • ${item.title} • ${item.message}`)} />
        <ListPanel title="Archive History" items={archives.map((item) => `${item.batchId} • ${item.status} • ${item.entriesCount} entries • ${item.archivedBy}`)} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[22px] border border-amber-200 bg-white/90 p-4 shadow-lg">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </article>
  );
}

function Action({ title, body, onClick }: { title: string; body: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[22px] border border-amber-200 bg-white/90 p-4 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-amber-500">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{body}</p>
    </button>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-[24px] border border-amber-200 bg-white/90 p-5 shadow-lg">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length ? items.slice(0, 8).map((item, index) => <p key={`${title}-${index}`} className="rounded-2xl bg-amber-50/80 px-3 py-2 text-xs font-bold leading-5 text-slate-700">{item}</p>) : <p className="text-sm font-bold text-slate-500">No records yet.</p>}
      </div>
    </article>
  );
}
