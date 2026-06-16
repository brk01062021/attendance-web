'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activityApi, type ActivityVisibilityType } from '@/lib/activityApi';

type Props = {
  role: 'ADMIN' | 'PRINCIPAL' | 'TEACHER';
  schoolId?: string;
};

const visibilityOptions: Array<{ label: string; value: ActivityVisibilityType; helper: string }> = [
  { label: 'Whole School', value: 'WHOLE_SCHOOL', helper: 'Visible to all teachers, students and parents.' },
  { label: 'Selected Classes', value: 'SELECTED_CLASSES', helper: 'Visible to selected class students and mapped parents.' },
  { label: 'Selected Students', value: 'SELECTED_STUDENTS', helper: 'Visible only to selected students and their parents.' },
  { label: 'Student Parents Only', value: 'STUDENT_PARENTS_ONLY', helper: 'Best for individual student achievements and participation memories.' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseIds(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ActivityCreatePanel({ role, schoolId = 'TST2' }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(todayIso());
  const [visibilityType, setVisibilityType] = useState<ActivityVisibilityType>('WHOLE_SCHOOL');
  const [classIds, setClassIds] = useState('');
  const [studentIds, setStudentIds] = useState('');
  const [submitAfterCreate, setSubmitAfterCreate] = useState(role === 'TEACHER');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const selectedVisibility = visibilityOptions.find((item) => item.value === visibilityType);

  async function save() {
    setMessage('');

    if (title.trim().length < 3) {
      setMessage('Please enter a valid title.');
      return;
    }

    if (description.trim().length < 5) {
      setMessage('Please enter a valid description.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) {
      setMessage('Use activity date format YYYY-MM-DD.');
      return;
    }

    if (visibilityType === 'SELECTED_CLASSES' && !classIds.trim()) {
      setMessage('Enter selected class ids separated by comma.');
      return;
    }

    if ((visibilityType === 'SELECTED_STUDENTS' || visibilityType === 'STUDENT_PARENTS_ONLY') && !studentIds.trim()) {
      setMessage('Enter selected student ids separated by comma.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        activityDate,
        visibilityType,
        classIds: visibilityType === 'SELECTED_CLASSES' ? parseIds(classIds) : [],
        studentIds: visibilityType === 'SELECTED_STUDENTS' || visibilityType === 'STUDENT_PARENTS_ONLY' ? parseIds(studentIds) : [],
      };

      const created = role === 'TEACHER' ? await activityApi.teacherCreate(schoolId, payload) : await activityApi.create(schoolId, payload);

      if (submitAfterCreate && created?.id) {
        await activityApi.submit(schoolId, created.id, role === 'TEACHER');
      }

      router.push('/school-activities');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to save activity.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="create-activity-page">
      <section className="activity-hero">
        <p className="eyebrow">School Activities & Memories</p>
        <h1>Create Activity</h1>
        <p>Create a private school memory post with approval and tenant-safe visibility.</p>
      </section>

      <section className="form-card">
        {message ? <div className="error-banner">{message}</div> : null}

        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Science Fair Winners" />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Write activity details for parents and students..." rows={6} />
        </label>

        <label>
          Activity Date
          <input value={activityDate} onChange={(event) => setActivityDate(event.target.value)} placeholder="YYYY-MM-DD" />
        </label>

        <label>
          Visibility
          <select value={visibilityType} onChange={(event) => setVisibilityType(event.target.value as ActivityVisibilityType)}>
            {visibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small>{selectedVisibility?.helper}</small>
        </label>

        {visibilityType === 'SELECTED_CLASSES' ? (
          <label>
            Class IDs
            <input value={classIds} onChange={(event) => setClassIds(event.target.value)} placeholder="Example: 8A, 9B" />
          </label>
        ) : null}

        {visibilityType === 'SELECTED_STUDENTS' || visibilityType === 'STUDENT_PARENTS_ONLY' ? (
          <label>
            Student IDs
            <input value={studentIds} onChange={(event) => setStudentIds(event.target.value)} placeholder="Example: ST1019, ST1044" />
          </label>
        ) : null}

        {role === 'TEACHER' ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={submitAfterCreate} onChange={(event) => setSubmitAfterCreate(event.target.checked)} />
            Submit for approval after saving
          </label>
        ) : null}

        <button className="primary-action" disabled={saving} onClick={save}>
          {saving ? 'Saving...' : role === 'TEACHER' ? 'Save / Submit' : 'Save Activity'}
        </button>
      </section>

      <style jsx>{`
        .create-activity-page {
          display: grid;
          gap: 24px;
        }

        .activity-hero,
        .form-card {
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 22px 60px rgba(8, 26, 47, 0.14);
        }

        .activity-hero {
          background: linear-gradient(135deg, #081a2f, #102f50);
          color: white;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #d49b25;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          letter-spacing: -0.04em;
        }

        .activity-hero p:not(.eyebrow) {
          color: rgba(255, 255, 255, 0.76);
          line-height: 1.6;
        }

        .form-card {
          display: grid;
          gap: 18px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(16, 34, 58, 0.08);
        }

        label {
          display: grid;
          gap: 8px;
          color: #10223a;
          font-weight: 900;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #d0d5dd;
          border-radius: 16px;
          padding: 13px 14px;
          color: #10223a;
          background: #f8fafc;
          font: inherit;
        }

        textarea {
          resize: vertical;
        }

        small {
          color: #667085;
          font-weight: 700;
          line-height: 1.5;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-row input {
          width: auto;
        }

        .primary-action {
          width: fit-content;
          border: 0;
          border-radius: 999px;
          background: #f5bc42;
          color: #10223a;
          padding: 13px 20px;
          font-weight: 900;
          cursor: pointer;
        }

        .primary-action:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .error-banner {
          border-radius: 18px;
          background: #fff3f3;
          color: #b42318;
          padding: 14px 16px;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
