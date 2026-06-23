'use client';

import { useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';

type Notice = { id?: number | string; title?: string; message?: string; noticeType?: string; targetRole?: string; createdAt?: string; active?: boolean };

function formatDate(value?: string) {
  if (!value) return 'Published date not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function visibleForStudent(notice: Notice) {
  const target = String(notice.targetRole || 'ALL').toUpperCase();
  return target === 'ALL' || target === 'STUDENT' || target === 'STUDENTS';
}

export default function Page() {
  const user = getStoredUser();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await apiClient<Notice[]>('/school-notices', { token: user?.token, schoolId: user?.schoolId });
        setNotices((data || []).filter((notice) => notice.active !== false && visibleForStudent(notice)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load school notices.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.schoolId, user?.token]);

  const visibleNotices = useMemo(() => notices.slice(0, 20), [notices]);

  return (
    <PortalShell role="STUDENT" title="School Notices" subtitle="View published school announcements and holiday notices.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Notices</p>
            <h2>School Notice Board</h2>
            <p>Only active notices published for students are shown here.</p>
          </div>
        </div>

        {loading ? <div className="notice-card">Loading published notices...</div> : null}
        {error ? <div className="notice-card">{error}</div> : null}
        {!loading && !error && visibleNotices.length === 0 ? <div className="notice-card">No active student notices published yet.</div> : null}

        <div className="status-list">
          {visibleNotices.map((notice) => (
            <div className="status-row" key={notice.id || `${notice.title}-${notice.createdAt}`}>
              <strong>{notice.title || 'School Notice'}</strong>
              <span>{notice.message || 'No message provided.'}</span>
              <small>{notice.noticeType || 'GENERAL'} • {formatDate(notice.createdAt)}</small>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
