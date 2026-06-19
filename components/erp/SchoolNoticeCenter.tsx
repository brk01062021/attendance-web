'use client';

import { useEffect, useMemo, useState } from 'react';

type Notice = {
  id?: number;
  title: string;
  message: string;
  noticeType: string;
  targetRole: string;
  createdBy?: string;
  createdAt?: string;
  active?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const noticeTypes = ['GENERAL', 'HOLIDAY', 'ACADEMIC', 'ACHIEVEMENT', 'EVENT', 'EMERGENCY'];
const audiences = [
  { label: 'All / Parents / Teachers / Students', value: 'ALL' },
  { label: 'Parents only', value: 'PARENT' },
  { label: 'Teachers only', value: 'TEACHER' },
  { label: 'Students only', value: 'STUDENT' },
];
const publishModes = ['Immediate', 'Scheduled'];

const inputClass =
  'mt-2 w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm font-semibold text-[#f8f3df] outline-none transition placeholder:text-[#f8f3df]/35 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15';

function formatDate(value?: string) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function SchoolNoticeCenter() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [noticeType, setNoticeType] = useState('GENERAL');
  const [targetRole, setTargetRole] = useState('ALL');
  const [publishMode, setPublishMode] = useState('Immediate');
  const [search, setSearch] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  async function loadNotices() {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/school-notices/school/1`, {
        headers: { 'X-School-Id': 'TST2' },
      });
      if (!response.ok) throw new Error('Unable to load notices');
      const data = await response.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setStatusMessage('Notice history is not available yet. You can still use the create form once backend is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return notices;
    return notices.filter((notice) =>
      [notice.title, notice.message, notice.noticeType, notice.targetRole]
        .some((field) => String(field ?? '').toLowerCase().includes(value)),
    );
  }, [notices, search]);

  async function publishNotice() {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (trimmedTitle.length < 3) {
      setStatusMessage('Enter a notice title with at least 3 characters.');
      return;
    }

    if (trimmedMessage.length < 5) {
      setStatusMessage('Enter a notice message with at least 5 characters.');
      return;
    }

    try {
      setSaving(true);
      setStatusMessage('');

      const response = await fetch(`${API_BASE_URL}/school-notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-School-Id': 'TST2',
        },
        body: JSON.stringify({
          schoolId: 1,
          title: trimmedTitle,
          message: trimmedMessage,
          noticeType,
          targetRole,
          createdBy: 'ADMIN',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Unable to publish notice');
      }

      const saved = await response.json();
      setNotices((current) => [saved, ...current]);
      setTitle('');
      setMessage('');
      setNoticeType('GENERAL');
      setTargetRole('ALL');
      setPublishMode('Immediate');
      setStatusMessage('Notice published successfully and notification records were created for the selected audience.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Publish failed. Confirm backend is running and /school-notices is reachable.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">SCHOOL NOTICE CENTER</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#f8f3df]">Create and publish school notices</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f8f3df]/70">
              Admin/Principal can create holiday alerts, academic announcements, achievements, emergency notices, and role-targeted communication for parents, students, and teachers.
            </p>
          </div>

          <button
            type="button"
            onClick={loadNotices}
            disabled={loading}
            className="rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#08131f] shadow-lg shadow-[#d4af37]/20 disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh Notices'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">CREATE NOTICE</p>
          <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Publish announcement</h3>
          <p className="mt-1 text-sm text-[#f8f3df]/65">Use this form for school-wide notices, parent alerts, teacher notices, and student announcements.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4 lg:col-span-2">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Notice Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: School closed tomorrow" className={inputClass} />
          </label>

          <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Notice Type</span>
            <select value={noticeType} onChange={(event) => setNoticeType(event.target.value)} className={inputClass}>
              {noticeTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Audience</span>
            <select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className={inputClass}>
              {audiences.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
            </select>
          </label>

          <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Publish Date</span>
            <select value={publishMode} onChange={(event) => setPublishMode(event.target.value)} className={inputClass}>
              {publishModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </label>

          <div className="rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Delivery</span>
            <p className="mt-3 text-sm font-semibold text-[#f8f3df]">Notice Center + In-app notification records</p>
            <p className="mt-1 text-xs leading-5 text-[#f8f3df]/55">Push/SMS can be added later without changing the notice workflow.</p>
          </div>

          <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4 lg:col-span-3">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Message</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Enter the notice message for the selected audience..." className={`${inputClass} min-h-32 resize-y leading-6`} />
          </label>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">Preview</p>
            <h4 className="mt-2 text-lg font-semibold text-[#f8f3df]">{title.trim() || 'Notice title will appear here'}</h4>
            <p className="mt-1 text-xs font-bold tracking-[0.18em] text-[#d4af37]/70">{noticeType} • {targetRole} • {publishMode}</p>
            <p className="mt-3 text-sm leading-6 text-[#f8f3df]/70">{message.trim() || 'Notice message preview will appear here.'}</p>
          </div>

          <button
            type="button"
            onClick={publishNotice}
            disabled={saving}
            className="rounded-2xl bg-[#d4af37] px-6 py-4 text-sm font-bold text-[#08131f] shadow-lg shadow-[#d4af37]/20 disabled:opacity-60"
          >
            {saving ? 'Publishing...' : 'Publish Notice'}
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#08131f] p-4 text-sm font-semibold text-[#f8f3df]">
            {statusMessage}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">RECORDS</p>
            <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Published notice history</h3>
            <p className="mt-1 text-sm text-[#f8f3df]/65">Created notices remain visible here for Admin/Principal review.</p>
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notices" className="w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df] outline-none transition placeholder:text-[#f8f3df]/35 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15 lg:max-w-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#d4af37]/10">
                {['Title', 'Type', 'Audience', 'Status', 'Created'].map((column) => (
                  <th key={column} className="px-4 py-3 text-left text-xs font-semibold tracking-[0.18em] text-[#d4af37]/70">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((notice, index) => (
                <tr key={notice.id ?? `${notice.title}-${index}`} className="border-b border-[#d4af37]/5">
                  <td className="px-4 py-4 text-sm font-semibold text-[#f8f3df]">{notice.title}</td>
                  <td className="px-4 py-4 text-sm text-[#f8f3df]/80">{notice.noticeType}</td>
                  <td className="px-4 py-4 text-sm text-[#f8f3df]/80">{notice.targetRole || 'ALL'}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-emerald-300">{notice.active === false ? 'Inactive' : 'Published'}</td>
                  <td className="px-4 py-4 text-sm text-[#f8f3df]/70">{formatDate(notice.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotices.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-5 text-sm text-[#f8f3df]/70">
            No notices found yet. Create and publish the first school notice above.
          </div>
        ) : null}
      </section>
    </div>
  );
}
