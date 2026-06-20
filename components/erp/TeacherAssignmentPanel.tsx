'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { getStoredUser } from '@/lib/auth';
import { timetableSetupApi, type TeacherAssignmentRow } from '@/lib/timetableSetupApi';

const navy = '#0b1f3a';
const muted = '#475569';
const gold = '#b45309';
const card: CSSProperties = { border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.94)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)', color: navy };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: navy, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 900 };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', color: navy };
const control: CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 14, padding: '10px 12px', color: navy, background: '#fff', fontWeight: 800 };
const smallButton: CSSProperties = { border: '1px solid #cbd5e1', borderRadius: 999, padding: '8px 12px', background: '#fff', color: navy, fontWeight: 900, cursor: 'pointer' };

function uniq(values: Array<string | undefined>) { return Array.from(new Set(values.map((v) => String(v || '').trim()).filter(Boolean))).sort(); }
function label(value?: string) { return value && value.trim() ? value : '-'; }

export default function TeacherAssignmentPanel() {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'TST2';
  const token = user?.token;
  const [rows, setRows] = useState<TeacherAssignmentRow[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [query, setQuery] = useState('');
  const [detailTeacherId, setDetailTeacherId] = useState('');
  const [detailClass, setDetailClass] = useState('');
  const [detailSection, setDetailSection] = useState('');
  const [detailSubject, setDetailSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      timetableSetupApi.teacherAssignments(token, schoolId),
      timetableSetupApi.classes(schoolId, token),
    ]).then(([assignmentRows, classList]) => {
      setRows(assignmentRows || []);
      setClasses(classList || []);
    }).catch((error: Error) => setMessage(error.message || 'Unable to load teacher assignments.'));
  }, [schoolId, token]);

  const sections = useMemo(() => uniq(rows.filter((row) => !selectedClass || row.className === selectedClass).map((row) => row.section)), [rows, selectedClass]);
  const teachers = useMemo(() => uniq(rows.map((row) => row.teacherName)), [rows]);
  const subjects = useMemo(() => uniq(rows.filter((row) => (!selectedClass || row.className === selectedClass) && (!selectedSection || row.section === selectedSection)).map((row) => row.subjectName)), [rows, selectedClass, selectedSection]);
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesClass = !selectedClass || row.className === selectedClass;
      const matchesSection = !selectedSection || row.section === selectedSection;
      const matchesTeacher = !selectedTeacher || row.teacherName === selectedTeacher;
      const matchesQuery = !q || `${row.teacherName || ''} ${row.subjectName || ''} ${row.className || ''} ${row.section || ''}`.toLowerCase().includes(q);
      return matchesClass && matchesSection && matchesTeacher && matchesQuery;
    });
  }, [rows, selectedClass, selectedSection, selectedTeacher, query]);

  const detailTeacherIds = useMemo(() => uniq(filteredRows.map((row) => row.teacherId ? String(row.teacherId) : undefined)), [filteredRows]);
  const detailClasses = useMemo(() => uniq(filteredRows.map((row) => row.className)), [filteredRows]);
  const detailSections = useMemo(() => uniq(filteredRows.filter((row) => !detailClass || row.className === detailClass).map((row) => row.section)), [filteredRows, detailClass]);
  const detailSubjects = useMemo(() => uniq(filteredRows.filter((row) => (!detailClass || row.className === detailClass) && (!detailSection || row.section === detailSection)).map((row) => row.subjectName)), [filteredRows, detailClass, detailSection]);
  const detailedRows = useMemo(() => filteredRows.filter((row) => {
    const matchesTeacherId = !detailTeacherId || String(row.teacherId || '') === detailTeacherId;
    const matchesDetailClass = !detailClass || row.className === detailClass;
    const matchesDetailSection = !detailSection || row.section === detailSection;
    const matchesDetailSubject = !detailSubject || row.subjectName === detailSubject;
    return matchesTeacherId && matchesDetailClass && matchesDetailSection && matchesDetailSubject;
  }), [filteredRows, detailTeacherId, detailClass, detailSection, detailSubject]);

  const grouped = useMemo(() => {
    const map = new Map<string, { className: string; section: string; subjects: Set<string>; teachers: Set<string>; count: number }>();
    filteredRows.forEach((row) => {
      const key = `${row.className || '-'}|${row.section || '-'}`;
      const current = map.get(key) || { className: label(row.className), section: label(row.section), subjects: new Set<string>(), teachers: new Set<string>(), count: 0 };
      if (row.subjectName) current.subjects.add(row.subjectName);
      if (row.teacherName) current.teachers.add(row.teacherName);
      current.count += 1;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => a.className.localeCompare(b.className) || a.section.localeCompare(b.section));
  }, [filteredRows]);

  const readiness = [
    ['Assignment Rows', rows.length, rows.length > 0 ? 'Ready' : 'Needs import data'],
    ['Classes', classes.length, classes.length > 0 ? 'Ready' : 'Needs class data'],
    ['Sections', sections.length, sections.length > 0 ? 'Ready' : 'Needs section data'],
    ['Teachers', teachers.length, teachers.length > 0 ? 'Ready' : 'Needs teacher data'],
    ['Subjects', subjects.length, subjects.length > 0 ? 'Ready' : 'Select class/section'],
  ];

  return <div style={{ display: 'grid', gap: 18 }}>
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0, color: navy }}>Teacher Assignment Center</h2><p style={{ margin: '6px 0 0', color: muted, fontWeight: 700 }}>Production view uses real tenant teacher_assignment data. Select class, section, or teacher to validate workload and timetable readiness.</p></div>
        <div style={{ color: gold, fontWeight: 900 }}>Tenant: {schoolId}</div>
      </div>
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Assignment filters</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <label><strong>Class</strong><select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }} style={control}><option value="">All real classes</option>{classes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Section</strong><select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={control}><option value="">All sections</option>{sections.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Teacher</strong><select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} style={control}><option value="">All teachers</option>{teachers.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Search</strong><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find subject, teacher, class" style={control} /></label>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}><button type="button" style={smallButton} onClick={() => { setSelectedClass(''); setSelectedSection(''); setSelectedTeacher(''); setQuery(''); }}>Clear Filters</button><span style={{ color: muted, fontWeight: 800, alignSelf: 'center' }}>{filteredRows.length} assignment row(s)</span></div>
      {message && <p style={{ color: '#991b1b', fontWeight: 900 }}>{message}</p>}
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>{readiness.map(([title, value, status]) => <div key={String(title)} style={card}><div style={{ color: muted, fontSize: 12, fontWeight: 900 }}>{title}</div><div style={{ color: navy, fontSize: 28, fontWeight: 900 }}>{value}</div><div style={{ color: status === 'Ready' ? '#166534' : '#92400e', fontSize: 12, fontWeight: 900 }}>{status}</div></div>)}</section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Class-section assignment summary</h3>
      <p style={{ marginTop: -4, color: muted, fontWeight: 700 }}>This replaces placeholder Class 1/Class 2/Class 10 rows with current tenant mappings.</p>
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Class</th><th style={th}>Section</th><th style={th}>Subjects</th><th style={th}>Teacher Pool</th><th style={th}>Rows</th><th style={th}>Status</th></tr></thead><tbody>{grouped.map((row) => <tr key={`${row.className}-${row.section}`}><td style={td}>{row.className}</td><td style={td}>{row.section}</td><td style={td}>{Array.from(row.subjects).join(', ') || '-'}</td><td style={td}>{Array.from(row.teachers).join(', ') || '-'}</td><td style={td}>{row.count}</td><td style={{ ...td, color: row.subjects.size > 0 && row.teachers.size > 0 ? '#166534' : '#991b1b', fontWeight: 900 }}>{row.subjects.size > 0 && row.teachers.size > 0 ? 'Ready' : 'Review'}</td></tr>)}</tbody></table></div>
      {grouped.length === 0 && <p style={{ color: muted, fontWeight: 800 }}>No matching teacher assignments found.</p>}
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Detailed assignment rows</h3>
      <p style={{ marginTop: -4, color: muted, fontWeight: 700 }}>Use listed options to narrow the operational assignment rows by teacher ID, class, section, and subject.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
        <label><strong>Teacher ID</strong><select value={detailTeacherId} onChange={(e) => setDetailTeacherId(e.target.value)} style={control}><option value="">All teacher IDs</option>{detailTeacherIds.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Class</strong><select value={detailClass} onChange={(e) => { setDetailClass(e.target.value); setDetailSection(''); setDetailSubject(''); }} style={control}><option value="">All classes</option>{detailClasses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Section</strong><select value={detailSection} onChange={(e) => { setDetailSection(e.target.value); setDetailSubject(''); }} style={control}><option value="">All sections</option>{detailSections.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><strong>Subject</strong><select value={detailSubject} onChange={(e) => setDetailSubject(e.target.value)} style={control}><option value="">All subjects</option>{detailSubjects.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><button type="button" style={smallButton} onClick={() => { setDetailTeacherId(''); setDetailClass(''); setDetailSection(''); setDetailSubject(''); }}>Clear Detail Filters</button><span style={{ color: muted, fontWeight: 800, alignSelf: 'center' }}>{detailedRows.length} detailed row(s)</span></div>
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Teacher</th><th style={th}>Teacher ID</th><th style={th}>Class</th><th style={th}>Section</th><th style={th}>Subject</th></tr></thead><tbody>{detailedRows.map((row, index) => <tr key={`${row.id || index}-${row.teacherId}-${row.className}-${row.section}-${row.subjectName}`}><td style={td}>{label(row.teacherName)}</td><td style={td}>{row.teacherId || '-'}</td><td style={td}>{label(row.className)}</td><td style={td}>{label(row.section)}</td><td style={td}>{label(row.subjectName)}</td></tr>)}</tbody></table></div>
      {detailedRows.length === 0 && <p style={{ color: muted, fontWeight: 800 }}>No detailed assignment rows match the selected filters.</p>}
    </section>
  </div>;
}
