import { apiClient } from '@/lib/apiClient';

export type LookupTeacher = {
  teacherId?: number;
  id?: number;
  teacherName?: string;
  name?: string;
  subjectName?: string;
};

export type TeacherAssignmentRow = {
  id?: number;
  teacherId?: number;
  teacherName?: string;
  subjectName?: string;
  className?: string;
  section?: string;
};

export type TimetableGenerationRequest = {
  academicYear: string;
  generationMode: string;
  classNames: string[];
  sections: string[];
  teacherIds: number[];
  teacherPoolSource: string;
  autoLoadSectionsEnabled: boolean;
  autoDefaultTeacherPoolEnabled: boolean;
  equalDistributionEnabled: boolean;
  workloadBalancingEnabled: boolean;
  fixedLabPeriodsEnabled: boolean;
  avoidTeacherGapsEnabled: boolean;
  sameTeacherContinuityEnabled: boolean;
  preventConsecutiveLabsEnabled: boolean;
  academicRulesEngineEnabled: boolean;
};

export type TimetableGenerationResult = {
  generatedBatchId?: string;
  completionPercentage?: number;
  totalClassesScheduled?: number;
  totalEntries?: number;
  conflictsDetected?: number;
  overloadRiskTeachers?: number;
  entries?: unknown[];
  conflicts?: unknown[];
  workloadSummary?: unknown[];
  classSectionReviews?: Array<{ className?: string; section?: string; label?: string; totalPeriods?: number; status?: string }>;
};

type Envelope<T> = T | { data?: T | Record<string, unknown>; items?: T; content?: T; results?: T; success?: boolean };

function unwrapData<T>(payload: Envelope<T>): T {
  const value = payload as { data?: unknown; items?: unknown; content?: unknown; results?: unknown };
  if (value && typeof value === 'object') {
    if (value.data !== undefined) return value.data as T;
    if (value.items !== undefined) return value.items as T;
    if (value.content !== undefined) return value.content as T;
    if (value.results !== undefined) return value.results as T;
  }
  return payload as T;
}

function asArray<T>(payload: Envelope<T[]>): T[] {
  const value = unwrapData<unknown>(payload);
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const arrayValue = record.items || record.content || record.results || record.rows || record.teachers || record.classes || record.sections || record.assignments;
    if (Array.isArray(arrayValue)) return arrayValue as T[];
  }
  return [];
}

function uniqueStrings(values: unknown[]): string[] {
  return Array.from(new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function normalizeClassList(payload: Envelope<unknown[]>): string[] {
  return uniqueStrings(asArray<unknown>(payload).map((item) => {
    if (typeof item === 'string') return item;
    const record = item as Record<string, unknown>;
    return record?.className || record?.name || record?.classLabel || record?.standard || record?.classId;
  }));
}

function normalizeSectionList(payload: Envelope<unknown[]>): string[] {
  return uniqueStrings(asArray<unknown>(payload).map((item) => {
    if (typeof item === 'string') return item;
    const record = item as Record<string, unknown>;
    return record?.section || record?.sectionName || record?.name || record?.sectionLabel;
  }));
}

function normalizeTeacherAssignments(payload: Envelope<unknown[]>): TeacherAssignmentRow[] {
  return asArray<unknown>(payload).map((item, index) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      id: Number(row.id ?? index) || index,
      teacherId: Number(row.teacherId ?? row.teacher_id ?? row.teacherCode ?? 0) || undefined,
      teacherName: String(row.teacherName ?? row.teacher_name ?? row.name ?? row.teacher ?? '').trim(),
      subjectName: String(row.subjectName ?? row.subject_name ?? row.subject ?? '').trim(),
      className: String(row.className ?? row.class_name ?? row.classLabel ?? row.classId ?? '').trim(),
      section: String(row.section ?? row.sectionName ?? row.section_name ?? '').trim(),
    };
  }).filter((row) => row.teacherName || row.className || row.section || row.subjectName);
}

function normalizeTeachers(payload: Envelope<unknown[]>): LookupTeacher[] {
  return asArray<unknown>(payload).map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      teacherId: Number(row.teacherId ?? row.teacher_id ?? row.id ?? 0) || undefined,
      id: Number(row.id ?? row.teacherId ?? row.teacher_id ?? 0) || undefined,
      teacherName: String(row.teacherName ?? row.teacher_name ?? row.name ?? row.fullName ?? '').trim(),
      name: String(row.name ?? row.teacherName ?? row.teacher_name ?? '').trim(),
      subjectName: String(row.subjectName ?? row.subject_name ?? row.subject ?? '').trim(),
    };
  }).filter((row) => row.teacherName || row.name || row.teacherId || row.id);
}

export const timetableSetupApi = {
  classes: (schoolId: string, token?: string) =>
    apiClient<Envelope<unknown[]>>('/api/operational-lookups/classes', { token, schoolId, query: { schoolId } }).then(normalizeClassList),
  sections: (schoolId: string, className: string, token?: string) =>
    apiClient<Envelope<unknown[]>>('/api/operational-lookups/sections', { token, schoolId, query: { schoolId, className } }).then(normalizeSectionList),
  teachers: (schoolId: string, query = '', token?: string) =>
    apiClient<Envelope<unknown[]>>('/api/operational-lookups/teachers/search', { token, schoolId, query: { schoolId, query } }).then(normalizeTeachers),
  teacherAssignments: (token?: string, schoolId?: string) =>
    apiClient<Envelope<unknown[]>>('/teacher-assignments', { token, schoolId }).then(normalizeTeacherAssignments),
  defaultPools: (token?: string, schoolId?: string) => apiClient<unknown[]>('/timetable/default-pools', { token, schoolId }),
  validateTimetable: (body: TimetableGenerationRequest, token?: string, schoolId?: string) => apiClient<TimetableGenerationResult>('/timetable/validate', { method: 'POST', token, schoolId, body: JSON.stringify(body) }),
  generateTimetable: (body: TimetableGenerationRequest, token?: string, schoolId?: string) => apiClient<TimetableGenerationResult>('/timetable/generate', { method: 'POST', token, schoolId, body: JSON.stringify(body) }),
};
