'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { getStoredUser } from '@/lib/auth';
import { timetableSetupApi, type LookupTeacher, type TimetableGenerationRequest, type TimetableGenerationResult } from '@/lib/timetableSetupApi';

const navy = '#0b1f3a';
const muted = '#475569';
const gold = '#b45309';
const card: CSSProperties = { border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.94)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)', color: navy };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: navy, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 900 };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', color: navy };
const control: CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 14, padding: '10px 12px', color: navy, background: '#fff', fontWeight: 800 };
const smallButton: CSSProperties = { border: '1px solid #cbd5e1', borderRadius: 999, padding: '9px 14px', background: '#fff', color: navy, fontWeight: 900, cursor: 'pointer' };

function teacherId(item: LookupTeacher) { return Number(item.teacherId || item.id || 0); }
function teacherName(item: LookupTeacher) { return item.teacherName || item.name || `Teacher ${teacherId(item)}`; }
function selectedLabel(count: number, empty: string) { return count > 0 ? `${count} selected` : empty; }

export default function TimetableGeneratePanel() {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'TST2';
  const token = user?.token;
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<LookupTeacher[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [teacherQuery, setTeacherQuery] = useState('');
  const [generationMode, setGenerationMode] = useState('Annual Timetable');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2027-04-30');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<TimetableGenerationResult | null>(null);

  useEffect(() => {
    Promise.all([
      timetableSetupApi.classes(schoolId, token),
      timetableSetupApi.teachers(schoolId, '', token),
    ]).then(([classList, teacherList]) => {
      setClasses(classList || []);
      setTeachers(teacherList || []);
    }).catch((error: Error) => setMessage(error.message || 'Unable to load timetable setup data.'));
  }, [schoolId, token]);

  useEffect(() => {
    async function loadSections() {
      if (selectedClasses.length === 0) { setSections([]); setSelectedSections([]); return; }
      const all = await Promise.all(selectedClasses.map((className) => timetableSetupApi.sections(schoolId, className, token)));
      const merged = Array.from(new Set(all.flat().filter(Boolean))).sort();
      setSections(merged);
      setSelectedSections((current) => current.filter((section) => merged.includes(section)));
    }
    loadSections().catch((error: Error) => setMessage(error.message || 'Unable to load sections.'));
  }, [schoolId, token, selectedClasses]);

  const filteredTeachers = useMemo(() => {
    const query = teacherQuery.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) => `${teacherName(teacher)} ${teacherId(teacher)} ${teacher.subjectName || ''}`.toLowerCase().includes(query));
  }, [teachers, teacherQuery]);

  const readiness = useMemo(() => [
    { item: 'Classes', source: 'Tenant class data', rule: 'Select at least one class', status: selectedClasses.length > 0 ? 'Ready' : 'Required' },
    { item: 'Sections', source: 'Auto-loaded from selected classes', rule: 'Select one or more sections', status: selectedSections.length > 0 ? 'Ready' : 'Required' },
    { item: 'Teacher Pool', source: 'Real tenant teacher list', rule: 'Use selected teachers or full tenant pool', status: teachers.length > 0 ? 'Ready' : 'Needs teacher data' },
    { item: 'Generation Dates', source: generationMode, rule: generationMode.includes('Custom') ? `${startDate} to ${endDate}` : 'Academic year calendar', status: 'Ready' },
  ], [selectedClasses.length, selectedSections.length, teachers.length, generationMode, startDate, endDate]);

  function toggle(value: string, selected: string[], setter: (values: string[]) => void) {
    setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }
  function toggleTeacher(id: number) {
    if (!id) return;
    setSelectedTeacherIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  function request(): TimetableGenerationRequest {
    return {
      academicYear,
      generationMode: generationMode.includes('Custom') ? `CUSTOM:${startDate}:${endDate}` : generationMode,
      classNames: selectedClasses,
      sections: selectedSections,
      teacherIds: selectedTeacherIds,
      teacherPoolSource: selectedTeacherIds.length > 0 ? 'SELECTED_TENANT_TEACHERS' : 'DEFAULT_TENANT_POOL',
      autoLoadSectionsEnabled: true,
      autoDefaultTeacherPoolEnabled: selectedTeacherIds.length === 0,
      equalDistributionEnabled: true,
      workloadBalancingEnabled: true,
      fixedLabPeriodsEnabled: true,
      avoidTeacherGapsEnabled: true,
      sameTeacherContinuityEnabled: true,
      preventConsecutiveLabsEnabled: true,
      academicRulesEngineEnabled: true,
    };
  }
  async function run(mode: 'validate' | 'generate') {
    if (selectedClasses.length === 0 || selectedSections.length === 0) { setMessage('Select at least one real class and section before validation/generation.'); return; }
    setLoading(true); setMessage('');
    try {
      const payload = request();
      const response = mode === 'validate' ? await timetableSetupApi.validateTimetable(payload, token, schoolId) : await timetableSetupApi.generateTimetable(payload, token, schoolId);
      setResult(response);
      setMessage(mode === 'validate' ? 'Validation completed with selected tenant data.' : `Timetable generated${response.generatedBatchId ? `: ${response.generatedBatchId}` : ''}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Timetable operation failed.'); }
    finally { setLoading(false); }
  }

  return <div style={{ display: 'grid', gap: 18 }}>
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0, color: navy }}>Generate Timetable</h2><p style={{ margin: '6px 0 0', color: muted, fontWeight: 700 }}>Production flow: select real tenant classes, auto-load sections, optionally narrow teacher pool, validate, then generate.</p></div>
        <div style={{ color: gold, fontWeight: 900 }}>Tenant: {schoolId}</div>
      </div>
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Generation setup</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <label><strong>Academic Year</strong><select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={control}><option>2026-2027</option><option>2027-2028</option></select></label>
        <label><strong>Generation Mode</strong><select value={generationMode} onChange={(e) => setGenerationMode(e.target.value)} style={control}><option>Annual Timetable</option><option>Monthly Timetable</option><option>Custom Date Range</option><option>Regenerate Draft</option></select></label>
        {generationMode.includes('Custom') && <><label><strong>Start Date</strong><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={control} /></label><label><strong>End Date</strong><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={control} /></label></>}
      </div>
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Classes and sections</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <div><strong>Classes · {selectedLabel(selectedClasses.length, 'none selected')}</strong><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{classes.map((className) => <button key={className} type="button" onClick={() => toggle(className, selectedClasses, setSelectedClasses)} style={{ ...smallButton, background: selectedClasses.includes(className) ? navy : '#fff', color: selectedClasses.includes(className) ? '#fff' : navy }}>{className}</button>)}</div>{classes.length === 0 && <p style={{ color: muted }}>No tenant classes found.</p>}</div>
        <div><strong>Sections · {selectedLabel(selectedSections.length, 'auto-load after class selection')}</strong><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{sections.map((section) => <button key={section} type="button" onClick={() => toggle(section, selectedSections, setSelectedSections)} style={{ ...smallButton, background: selectedSections.includes(section) ? navy : '#fff', color: selectedSections.includes(section) ? '#fff' : navy }}>{section}</button>)}</div>{selectedClasses.length > 0 && sections.length === 0 && <p style={{ color: muted }}>No sections found for selected class.</p>}</div>
      </div>
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Teacher pool</h3>
      <p style={{ marginTop: -4, color: muted, fontWeight: 700 }}>Leave blank to use the full tenant teacher pool. Select teachers only when generating a focused draft.</p>
      <input value={teacherQuery} onChange={(e) => setTeacherQuery(e.target.value)} placeholder="Search real tenant teachers" style={{ ...control, marginBottom: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>{filteredTeachers.map((teacher) => {
        const id = teacherId(teacher); const active = selectedTeacherIds.includes(id);
        return <button key={`${id}-${teacherName(teacher)}`} type="button" onClick={() => toggleTeacher(id)} style={{ ...smallButton, borderRadius: 14, textAlign: 'left', background: active ? navy : '#fff', color: active ? '#fff' : navy }}><strong>{teacherName(teacher)}</strong><br /><span style={{ fontSize: 12 }}>ID {id || '-'} {teacher.subjectName ? `· ${teacher.subjectName}` : ''}</span></button>;
      })}</div>
    </section>

    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><div><h3 style={{ margin: 0, color: navy }}>Generation readiness</h3><p style={{ margin: '6px 0 0', color: muted, fontWeight: 700 }}>No mock rows. Status reflects current selections and tenant data.</p></div><div style={{ display: 'flex', gap: 8 }}><button disabled={loading} type="button" onClick={() => run('validate')} style={smallButton}>{loading ? 'Working...' : 'Validate'}</button><button disabled={loading || selectedClasses.length === 0 || selectedSections.length === 0} type="button" onClick={() => run('generate')} style={{ ...smallButton, background: gold, color: '#fff', border: 0 }}>{loading ? 'Working...' : 'Generate'}</button></div></div>
      {message && <p style={{ color: message.toLowerCase().includes('failed') || message.toLowerCase().includes('select') ? '#991b1b' : '#166534', fontWeight: 900 }}>{message}</p>}
      <div style={{ overflowX: 'auto', marginTop: 12 }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Item</th><th style={th}>Source</th><th style={th}>Rule</th><th style={th}>Status</th></tr></thead><tbody>{readiness.map((row) => <tr key={row.item}><td style={td}>{row.item}</td><td style={td}>{row.source}</td><td style={td}>{row.rule}</td><td style={{ ...td, color: row.status === 'Ready' ? '#166534' : '#991b1b', fontWeight: 900 }}>{row.status}</td></tr>)}</tbody></table></div>
    </section>

    {result && <section style={card}><h3 style={{ marginTop: 0, color: navy }}>Generated / validated result</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>{[['Batch', result.generatedBatchId || '-'], ['Completion', `${result.completionPercentage ?? 0}%`], ['Entries', result.totalEntries ?? 0], ['Classes', result.totalClassesScheduled ?? 0], ['Conflicts', result.conflictsDetected ?? 0], ['Overload Risk', result.overloadRiskTeachers ?? 0]].map(([label, value]) => <div key={String(label)} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12 }}><div style={{ color: muted, fontSize: 12, fontWeight: 900 }}>{label}</div><div style={{ color: navy, fontSize: 22, fontWeight: 900 }}>{value}</div></div>)}</div></section>}
  </div>;
}
