'use client';

import { useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

type TeacherLeaveEnquiry = {
  id: number;
  teacherId: number;
  teacherName: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason?: string;
  status: string;
  requestedAt?: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function LeaveApprovalsPanel() {
  const [items, setItems] = useState<TeacherLeaveEnquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const user = useMemo(() => getStoredUser(), []);

  async function load() {
    try {
      setLoading(true);
      setMessage('');

      const data =
        await webApi.teacherLeaveEnquiries<TeacherLeaveEnquiry[]>(
          todayIso(),
          plusDaysIso(30),
          user?.token,
          user?.schoolId
        );

      setItems(data || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load leave enquiries.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    try {
      setSavingId(id);

      await webApi.approveTeacherLeaveEnquiry(
        id,
        'Approved from web Leave Approvals',
        user?.token,
        user?.schoolId
      );

      setMessage(
        'Leave enquiry approved. Replacement workflow can now start.'
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Approval failed.'
      );
    } finally {
      setSavingId(null);
    }
  }

  async function reject(id: number) {
    try {
      setSavingId(id);

      await webApi.rejectTeacherLeaveEnquiry(
        id,
        'Rejected from web Leave Approvals',
        user?.token,
        user?.schoolId
      );

      setMessage('Leave enquiry rejected.');

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Reject failed.'
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="work-panel gold-panel">
      <p className="eyebrow">DAY 29 LEAVE FLOW</p>

      <h2>Leave Approvals</h2>

      <p>
        Teachers submit leave enquiries only. Admin/Principal approve or
        reject here. Approval marks affected schedules as leave and then
        the replacement workflow can start.
      </p>

      {message ? (
        <div className="notice-card">{message}</div>
      ) : null}

      {loading ? (
        <div className="notice-card">
          Loading leave enquiries...
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="notice-card">
          No pending leave enquiries for the next 30 days.
        </div>
      ) : null}

      <div className="action-grid">
        {items.map((item) => (
          <article className="action-card" key={item.id}>
            <span>
              {item.leaveType === 'UNPLANNED_LEAVE'
                ? '🚨'
                : '🗓️'}
            </span>

            <strong>
              {item.teacherName || `Teacher #${item.teacherId}`}
            </strong>

            <span>
              {item.fromDate} → {item.toDate}
            </span>

            <span>Status: {item.status}</span>

            <span>
              Reason: {item.reason || 'Not provided'}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '14px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="primary-button"
                type="button"
                disabled={savingId === item.id}
                onClick={() => approve(item.id)}
              >
                {savingId === item.id
                  ? 'Updating...'
                  : 'Approve'}
              </button>

              <button
                style={{
                  padding: '12px 20px',
                  borderRadius: '999px',
                  border: '1px solid #14213d',
                  backgroundColor: '#14213d',
                  color: '#ff4d4f',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  minWidth: '110px',
                  boxShadow:
                    '0 4px 10px rgba(20,33,61,0.25)',
                }}
                type="button"
                disabled={savingId === item.id}
                onClick={() => reject(item.id)}
              >
                {savingId === item.id
                  ? 'Updating...'
                  : 'Reject'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}