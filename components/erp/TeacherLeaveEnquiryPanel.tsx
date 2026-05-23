'use client';

import { FormEvent, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherLeaveEnquiryPanel() {
  const user = useMemo(() => getStoredUser(), []);
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [leaveType, setLeaveType] = useState('PLANNED_LEAVE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const teacherId = user?.teacherId || user?.userId || 101;
      const teacherName = user?.displayName || 'Teacher';
      const response = await webApi.submitTeacherLeaveEnquiry<Record<string, unknown>>({
        teacherId,
        teacherName,
        fromDate,
        toDate,
        leaveType,
        reason,
      }, user?.token, user?.schoolId);
      setMessage(`Leave enquiry submitted successfully. Status: ${String(response?.status || 'PENDING_ADMIN_APPROVAL')}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit leave enquiry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="work-panel gold-panel">
      <p className="eyebrow">TEACHER WEB FLOW</p>
      <h2>Request Leave Enquiry</h2>
      <p>Teacher can only request a leave enquiry here. Admin/Principal will review it from Leave Approvals and start replacement planning after approval.</p>

      <form className="form-grid" onSubmit={submit}>
        <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required /></label>
        <label>To Date<input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} required /></label>
        <label>Leave Type<select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}><option value="PLANNED_LEAVE">Planned Leave</option><option value="UNPLANNED_LEAVE">Unplanned Leave</option><option value="HALF_DAY">Half Day</option></select></label>
        <label className="form-grid--full">Reason<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter leave reason for Admin/Principal review" rows={5} required /></label>
        <div className="form-grid--full button-row"><button className="primary-button" disabled={loading} type="submit">{loading ? 'Submitting...' : 'Request Leave Enquiry'}</button></div>
      </form>

      {message ? <div className="notice-card">{message}</div> : null}
    </section>
  );
}
