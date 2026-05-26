'use client';

import { useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

type StudentStatus = 'Present' | 'Absent' | 'Pending';

const classOptions = ['8', '9', '10'];
const sectionOptions = ['A', 'B'];
const subjectOptions = ['English', 'Mathematics', 'Science', 'Social'];

const studentSeed = [
  { rollNo: '01', name: 'Aarav Reddy' },
  { rollNo: '02', name: 'Diya Sharma' },
  { rollNo: '03', name: 'Rohan Kumar' },
  { rollNo: '04', name: 'Meera Patel' },
];

export default function Page() {
  const [className, setClassName] = useState('10');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Mathematics');
  const [loaded, setLoaded] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, StudentStatus>>({});

  const students = useMemo(
    () =>
      studentSeed.map((student) => ({
        ...student,
        status: statuses[student.rollNo] || 'Pending',
      })),
    [statuses],
  );

  const presentCount = students.filter((student) => student.status === 'Present').length;
  const absentCount = students.filter((student) => student.status === 'Absent').length;
  const pendingCount = students.filter((student) => student.status === 'Pending').length;

  function loadStudents() {
    setLoaded(true);
    setStatuses({});
  }

  function markStudent(rollNo: string, status: StudentStatus) {
    setStatuses((current) => ({ ...current, [rollNo]: status }));
  }

  return (
    <PortalShell role="TEACHER" title="Take Attendance" subtitle="Select class, section, and subject, then load students for attendance.">
      <ShellStyles />

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Daily attendance</p>
            <h2>Load Students</h2>
            <p>Choose the assigned class details before marking attendance.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-sm font-black text-amber-100">
            Class
            <select
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900"
            >
              {classOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-amber-100">
            Section
            <select
              value={section}
              onChange={(event) => setSection(event.target.value)}
              className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900"
            >
              {sectionOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-amber-100">
            Subject
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900"
            >
              {subjectOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={loadStudents}
            className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-300/20 px-5 py-3 text-sm font-black text-amber-50 transition hover:bg-amber-300/30"
          >
            Load Students
          </button>
        </div>
      </section>

      {loaded ? (
        <section className="page-card gold-panel mt-5">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Class attendance register</p>
              <h2>Class {className} - {section}</h2>
              <p>{subject} • Today</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="status-row">
              <strong>Present</strong>
              <span>{presentCount}</span>
            </div>
            <div className="status-row">
              <strong>Absent</strong>
              <span>{absentCount}</span>
            </div>
            <div className="status-row">
              <strong>Pending</strong>
              <span>{pendingCount}</span>
            </div>
          </div>

          <div className="status-list mt-5">
            {students.map((student) => (
              <div className="status-row flex-wrap" key={student.rollNo}>
                <strong>{student.rollNo}. {student.name}</strong>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => markStudent(student.rollNo, 'Present')}
                    className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100"
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markStudent(student.rollNo, 'Absent')}
                    className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-xs font-black text-rose-100"
                  >
                    Absent
                  </button>
                  <span>{student.status}</span>
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/20 px-5 py-3 text-sm font-black text-amber-50 transition hover:bg-amber-300/30"
          >
            Submit Attendance
          </button>
        </section>
      ) : null}
    </PortalShell>
  );
}
