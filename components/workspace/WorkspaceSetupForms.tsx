'use client';

import { useMemo, useState } from 'react';
import { webApi } from '@/lib/apiClient';
import type { WebPortalUser } from '@/types/auth';
import type { ApiEnvelope, WorkspaceChecklist } from './workspaceTypes';
import { extractWorkspaceChecklist, normalizeWorkspaceChecklist } from './workspaceProduction';

const WEEK_DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

const MONDAY_FRIDAY = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const MONDAY_SATURDAY = [...MONDAY_FRIDAY, 'SATURDAY'];

type WorkingDayPreset = 'MONDAY_FRIDAY' | 'MONDAY_SATURDAY' | 'CUSTOM';

function parseWorkingDays(value?: string | null): string[] {
  if (!value) return MONDAY_SATURDAY;
  const normalized = value
    .split(',')
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);
  return normalized.length ? normalized : MONDAY_SATURDAY;
}

function detectPreset(days: string[]): WorkingDayPreset {
  const value = days.join(',');
  if (value === MONDAY_FRIDAY.join(',')) return 'MONDAY_FRIDAY';
  if (value === MONDAY_SATURDAY.join(',')) return 'MONDAY_SATURDAY';
  return 'CUSTOM';
}

function formatSelectedDays(days: string[]): string {
  const value = days.join(',');
  if (value === MONDAY_FRIDAY.join(',')) return 'Monday – Friday';
  if (value === MONDAY_SATURDAY.join(',')) return 'Monday – Saturday';
  return days
    .map((day) => WEEK_DAYS.find((item) => item.key === day)?.label || day)
    .join(', ');
}

export default function WorkspaceSetupForms({ user, checklist, onSaved }: { user: WebPortalUser; checklist: WorkspaceChecklist; onSaved: (next: WorkspaceChecklist) => void }) {
  const initialDays = parseWorkingDays(checklist.workingDays);
  const [schoolName, setSchoolName] = useState(checklist.schoolName || user.schoolName || '');
  const [academicYear, setAcademicYear] = useState(checklist.academicYear || '2026-2027');
  const [startDate, setStartDate] = useState(checklist.academicYearStartDate || '2026-06-01');
  const [endDate, setEndDate] = useState(checklist.academicYearEndDate || '2027-04-30');
  const [workingDayPreset, setWorkingDayPreset] = useState<WorkingDayPreset>(detectPreset(initialDays));
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>(initialDays);
  const [schoolStartTime, setSchoolStartTime] = useState(checklist.schoolStartTime || '09:00');
  const [schoolEndTime, setSchoolEndTime] = useState(checklist.schoolEndTime || '16:00');
  const [periodsPerDay, setPeriodsPerDay] = useState(String(checklist.periodsPerDay || 7));
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  const workingDays = useMemo(() => selectedWorkingDays.join(','), [selectedWorkingDays]);
  const selectedWorkingDaysLabel = useMemo(() => formatSelectedDays(selectedWorkingDays), [selectedWorkingDays]);

  function applyWorkingDayPreset(nextPreset: WorkingDayPreset) {
    setWorkingDayPreset(nextPreset);
    if (nextPreset === 'MONDAY_FRIDAY') setSelectedWorkingDays(MONDAY_FRIDAY);
    if (nextPreset === 'MONDAY_SATURDAY') setSelectedWorkingDays(MONDAY_SATURDAY);
  }

  function toggleCustomDay(dayKey: string) {
    setWorkingDayPreset('CUSTOM');
    setSelectedWorkingDays((current) => {
      if (current.includes(dayKey)) {
        const next = current.filter((day) => day !== dayKey);
        return next.length ? next : current;
      }
      return WEEK_DAYS.filter((day) => [...current, dayKey].includes(day.key)).map((day) => day.key);
    });
  }

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
  const labelStyle = { fontSize: 12, opacity: 0.78, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '.04em' };
  const buttonStyle = { border: 0, borderRadius: 14, padding: '12px 16px', fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg,#d2a64c,#ffe0a0)', color: '#2b1b06' };
  const presetButtonStyle = (active: boolean) => ({
    ...buttonStyle,
    padding: '10px 14px',
    opacity: active ? 1 : 0.78,
    outline: active ? '2px solid rgba(255,255,255,.42)' : '1px solid rgba(255,255,255,.16)',
  });

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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={presetButtonStyle(workingDayPreset === 'MONDAY_FRIDAY')} onClick={() => applyWorkingDayPreset('MONDAY_FRIDAY')}>Monday–Friday</button>
            <button type="button" style={presetButtonStyle(workingDayPreset === 'MONDAY_SATURDAY')} onClick={() => applyWorkingDayPreset('MONDAY_SATURDAY')}>Monday–Saturday</button>
            <button type="button" style={presetButtonStyle(workingDayPreset === 'CUSTOM')} onClick={() => setWorkingDayPreset('CUSTOM')}>Custom</button>
          </div>

          {workingDayPreset === 'CUSTOM' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8, padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)' }}>
              {WEEK_DAYS.map((day) => (
                <label key={day.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <input type="checkbox" checked={selectedWorkingDays.includes(day.key)} onChange={() => toggleCustomDay(day.key)} />
                  {day.label}
                </label>
              ))}
            </div>
          )}

          <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}>
            <span style={{ opacity: 0.72, fontWeight: 800 }}>Selected: </span>
            <strong>{selectedWorkingDaysLabel}</strong>
          </div>

          <button style={buttonStyle} disabled={saving === 'WORKING_DAYS'} onClick={() => save('WORKING_DAYS', { workingDays })}>Save Working Days</button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>4. School Timings</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={labelStyle}>School Start Time</span>
              <input style={inputStyle} type="time" value={schoolStartTime} onChange={(e) => setSchoolStartTime(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={labelStyle}>School End Time</span>
              <input style={inputStyle} type="time" value={schoolEndTime} onChange={(e) => setSchoolEndTime(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={labelStyle}>Periods Per Day</span>
              <select style={inputStyle} value={periodsPerDay} onChange={(e) => setPeriodsPerDay(e.target.value)}>
                {[5, 6, 7, 8, 9, 10].map((period) => (
                  <option key={period} value={period}>{period} Periods</option>
                ))}
              </select>
            </label>
          </div>
          <p style={{ margin: 0, opacity: 0.78, fontWeight: 700 }}>These settings are used for timetable generation and attendance scheduling.</p>
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
