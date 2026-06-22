'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import { type StudentRow, type TeacherAssignmentOption, fetchStudentsForAssignment, fetchTeacherPeriods, groupTeacherAssignments, studentDisplayId } from '@/lib/teacherData';

type ClassWithStudents = TeacherAssignmentOption & { students: StudentRow[] };

export default function Page() {
  const user = useMemo(() => getStoredUser(), []);
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [expandedKey, setExpandedKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const assignments = groupTeacherAssignments(await fetchTeacherPeriods(user));
        const withStudents = await Promise.all(assignments.map(async (assignment) => ({ ...assignment, students: await fetchStudentsForAssignment(user, assignment) })));
        if (!active) return;
        setClasses(withStudents);
        setExpandedKey(withStudents[0]?.key || '');
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Unable to load assigned classes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user]);

  const totalStudents = classes.reduce((sum, item) => sum + item.students.length, 0);
  const subjects = new Set(classes.map((item) => item.subjectName)).size;
  const sections = new Set(classes.map((item) => `${item.className}-${item.section}`)).size;

  return (
    <PortalShell role="TEACHER" title="My Classes" subtitle="Assigned classes, sections, subjects, and real TST2 students for this teacher only.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Assigned classes</p>
            <h2>Teaching Assignments</h2>
            <p>Loaded from active published timetable for {user?.teacherName || user?.displayName || 'logged-in teacher'}.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="status-row"><strong>Classes</strong><span>{classes.length}</span></div>
          <div className="status-row"><strong>Sections</strong><span>{sections}</span></div>
          <div className="status-row"><strong>Subjects</strong><span>{subjects}</span></div>
          <div className="status-row"><strong>Students</strong><span>{totalStudents}</span></div>
        </div>
      </section>

      <section className="page-card gold-panel mt-5">
        <div className="status-list">
          {loading ? <div className="notice-card">Loading teacher assignments...</div> : null}
          {!loading && classes.length === 0 ? <div className="notice-card">No active published class assignment found for this teacher.</div> : null}
          {classes.map((item) => (
            <article className="status-row flex-wrap" key={item.key}>
              <div>
                <strong>{item.className}-{item.section} • {item.subjectName}</strong>
                <span>{item.students.length} students • {item.periods.length} weekly periods</span>
              </div>
              <span className="flex flex-wrap gap-2">
                <button className="secondary-button" type="button" onClick={() => setExpandedKey(expandedKey === item.key ? '' : item.key)}>{expandedKey === item.key ? 'Hide Students' : 'View Students'}</button>
                <Link className="secondary-button" href="/teacher/attendance">Take Attendance</Link>
                <Link className="secondary-button" href="/teacher/results">Results Excel</Link>
              </span>
              {expandedKey === item.key ? (
                <div className="mt-4 w-full overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm text-amber-50">
                    <thead><tr><th className="p-2">Student ID</th><th className="p-2">Roll</th><th className="p-2">Student Name</th><th className="p-2">Class</th><th className="p-2">Section</th></tr></thead>
                    <tbody>
                      {item.students.map((student, index) => (
                        <tr key={student.id} className="border-t border-amber-100/10"><td className="p-2">{studentDisplayId(student)}</td><td className="p-2">{index + 1}</td><td className="p-2">{student.name}</td><td className="p-2">{student.className || item.className}</td><td className="p-2">{student.section || item.section}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      {message ? <div className="notice-card mt-4">{message}</div> : null}
    </PortalShell>
  );
}
