'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

type LeaveHistoryItem = {
  id: number;
  teacherId: number;
  teacherName?: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  adminRemarks?: string;
  requestedAt?: string;
  decidedAt?: string;
};

type TeacherNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  createdAt?: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function prettyDate(value?: string) {
  if (!value) return 'Pending';
  return String(value).replace('T', ' ').slice(0, 16);
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('approved')) return 'status-pill status-pill--approved';
  if (normalized.includes('rejected')) return 'status-pill status-pill--rejected';
  return 'status-pill status-pill--pending';
}

export default function TeacherLeaveEnquiryPanel() {
  const user = useMemo(() => getStoredUser(), []);
  const teacherId = Number(user?.teacherId || user?.userId || 101);
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [leaveType, setLeaveType] = useState('PLANNED_LEAVE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);

  async function loadTeacherActivity() {
    setHistoryLoading(true);
    try {
      const [historyResponse, notificationResponse] = await Promise.allSettled([
        webApi.teacherLeaveHistory<LeaveHistoryItem[]>(teacherId, user?.token, user?.schoolId),
        webApi.teacherNotifications<TeacherNotification[]>(Number(user?.userId || teacherId), 'TEACHER', user?.token, user?.schoolId),
      ]);
      if (historyResponse.status === 'fulfilled') setHistory(historyResponse.value || []);
      if (notificationResponse.status === 'fulfilled') setNotifications(notificationResponse.value || []);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void loadTeacherActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const teacherName = user?.displayName && !/admin/i.test(user.displayName) ? user.displayName : 'Teacher';
      const response = await webApi.submitTeacherLeaveEnquiry<Record<string, unknown>>({
        teacherId,
        teacherName,
        fromDate,
        toDate,
        leaveType,
        reason,
      }, user?.token, user?.schoolId);
      setReason('');
      setMessage(`Leave enquiry submitted successfully. Status: ${String(response?.status || 'PENDING')}`);
      await loadTeacherActivity();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit leave enquiry.');
    } finally {
      setLoading(false);
    }
  }

  const latestNotification = notifications.find((item) => item.type === 'TEACHER_LEAVE_STATUS') || notifications[0];

  return (
    <div className="two-column">
      <section className="work-panel glass-panel premium-panel">
        <p className="eyebrow">TEACHER WEB FLOW</p>
        <h2>Request Leave Enquiry</h2>
        <p>Teacher can request leave, then track Pending, Approved, or Rejected status with Admin/Principal remarks and timeline in the same page.</p>

        <form className="form-grid" onSubmit={submit}>
          <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required /></label>
          <label>To Date<input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} required /></label>
          <label>Leave Type<select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}><option value="PLANNED_LEAVE">Planned Leave</option><option value="UNPLANNED_LEAVE">Unplanned Leave</option><option value="HALF_DAY">Half Day</option></select></label>
          <label>Teacher ID<input value={teacherId} readOnly /></label>
          <label className="form-grid--full">Reason<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter leave reason for Admin/Principal review" rows={5} required /></label>
          <div className="form-grid--full button-row"><button className="primary-button" disabled={loading} type="submit">{loading ? 'Submitting...' : 'Request Leave Enquiry'}</button><button className="secondary-button" type="button" onClick={loadTeacherActivity} disabled={historyLoading}>{historyLoading ? 'Refreshing...' : 'Refresh Status'}</button></div>
        </form>

        {message ? <div className="notice-card">{message}</div> : null}
        {latestNotification ? <div className="notice-card"><strong>{latestNotification.title}</strong><br />{latestNotification.message}</div> : null}
      </section>

      <section className="work-panel glass-panel premium-panel">
        <p className="eyebrow">LEAVE HISTORY + TIMELINE</p>
        <h2>My Leave Enquiries</h2>
        <p>Approval/rejection status, Admin/Principal remarks, and timeline are visible here after review.</p>
        <div className="history-grid">
          {history.length === 0 ? <div className="notice-card">No leave enquiries found yet.</div> : history.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-card-top">
                <div>
                  <h3>{item.leaveType?.replaceAll('_', ' ') || 'Leave Enquiry'}</h3>
                  <div className="history-meta">{item.fromDate} → {item.toDate}</div>
                </div>
                <span className={statusClass(item.status)}>{item.status}</span>
              </div>
              {item.reason ? <div className="history-meta"><strong>Reason:</strong> {item.reason}</div> : null}
              <div className="timeline">
                <div><span className="timeline-dot" />Requested: {prettyDate(item.requestedAt)}</div>
                <div><span className="timeline-dot" />Decision: {prettyDate(item.decidedAt)}</div>
              </div>
              <div className="remarks-box"><strong>Admin/Principal remarks:</strong><br />{item.adminRemarks || (item.status === 'PENDING' ? 'Waiting for Admin/Principal review.' : 'No remarks provided.')}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
