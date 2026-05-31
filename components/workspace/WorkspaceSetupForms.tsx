'use client';

import { useState } from 'react';
import { webApi } from '@/lib/apiClient';
import type { WebPortalUser } from '@/types/auth';
import type { ApiEnvelope, WorkspaceChecklist } from './workspaceTypes';
import { extractWorkspaceChecklist, normalizeWorkspaceChecklist } from './workspaceProduction';

export default function WorkspaceSetupForms({ user, checklist, onSaved }: { user: WebPortalUser; checklist: WorkspaceChecklist; onSaved: (next: WorkspaceChecklist) => void }) {
  const [schoolName, setSchoolName] = useState(checklist.schoolName || user.schoolName || '');
  const [academicYear, setAcademicYear] = useState(checklist.academicYear || '2026-2027');
  const [startDate, setStartDate] = useState(checklist.academicYearStartDate || '2026-06-01');
  const [endDate, setEndDate] = useState(checklist.academicYearEndDate || '2027-04-30');
  const [workingDays, setWorkingDays] = useState(checklist.workingDays || 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY');
  const [schoolStartTime, setSchoolStartTime] = useState(checklist.schoolStartTime || '09:00');
  const [schoolEndTime, setSchoolEndTime] = useState(checklist.schoolEndTime || '16:00');
  const [periodsPerDay, setPeriodsPerDay] = useState(String(checklist.periodsPerDay || 7));
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  async function save(stepKey: string, body: Record<string, unknown>) {
    setSaving(stepKey);
    setMessage('');
    try {
      const response = await webApi.updateWorkspaceStep<ApiEnvelope<WorkspaceChecklist>>(
        user.schoolId,
        stepKey,
        { ...body, completed: true },
        user.token
      );
      const payload = extractWorkspaceChecklist(response);
      if (!payload) {
        setMessage('Saved, but the response format was not recognized. Refresh the page to verify setup status.');
        return;
      }
      onSaved(normalizeWorkspaceChecklist(payload));
      setMessage('Saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save workspace setup step.');
    } finally {
      setSaving('');
    }
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.08)', color: 'inherit' };
  const buttonStyle = { border: 0, borderRadius: 14, padding: '12px 16px', fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg,#d2a64c,#ffe0a0)', color: '#2b1b06' };

  return (
    <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
      <p className="eyebrow">Required setup</p>
      <h2>School Workspace Setup</h2>
      <p style={{ marginTop: 8, opacity: 0.82 }}>
        Complete these four required school settings first. After this, Import School Data unlocks and the Excel workbook imports classes, sections, teachers, subjects, teacher assignments, students, parents, holiday calendar, and academic rules.
      </p>

      <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <strong>1. School Profile</strong>
          <input style={inputStyle} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School name" />
          <button style={buttonStyle} disabled={saving === 'SCHOOL_PROFILE'} onClick={() => save('SCHOOL_PROFILE', { schoolName })}>Save School Profile</button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>2. Academic Year</strong>
          <input style={inputStyle} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026-2027" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={inputStyle} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input style={inputStyle} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button style={buttonStyle} disabled={saving === 'ACADEMIC_YEAR'} onClick={() => save('ACADEMIC_YEAR', { academicYear, academicYearStartDate: startDate, academicYearEndDate: endDate })}>Save Academic Year</button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>3. Working Days</strong>
          <input style={inputStyle} value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} placeholder="MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY" />
          <button style={buttonStyle} disabled={saving === 'WORKING_DAYS'} onClick={() => save('WORKING_DAYS', { workingDays })}>Save Working Days</button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>4. School Timings</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <input style={inputStyle} type="time" value={schoolStartTime} onChange={(e) => setSchoolStartTime(e.target.value)} />
            <input style={inputStyle} type="time" value={schoolEndTime} onChange={(e) => setSchoolEndTime(e.target.value)} />
            <input style={inputStyle} type="number" value={periodsPerDay} onChange={(e) => setPeriodsPerDay(e.target.value)} />
          </div>
          <button style={buttonStyle} disabled={saving === 'SCHOOL_TIMINGS'} onClick={() => save('SCHOOL_TIMINGS', { schoolStartTime, schoolEndTime, periodsPerDay: Number(periodsPerDay) })}>Save School Timings</button>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)' }}>
          <strong>Imported through Excel workbook after unlock</strong>
          <p style={{ margin: '8px 0 0', opacity: 0.82 }}>
            Classes, Sections, Teachers, Subjects, Teacher Assignments, Students, Parents, Holiday Calendar, and Academic Rules are not manually completed here. They will be validated from Import School Data.
          </p>
        </div>

        {message && <strong>{message}</strong>}
      </div>
    </section>
  );
}
