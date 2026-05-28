import { apiClient, webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

export type ImportSheetPreview = {
  sheetName: string;
  totalRows: number;
  headers: string[];
};

export type ImportValidationIssue = {
  sheetName: string;
  rowNumber: number;
  fieldName: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
};

export type ImportPreviewResponse = {
  schoolId: string;
  importType: string;
  fileName: string;
  valid: boolean;
  tenantSafe: boolean;
  status: string;
  summary: string;
  rowCounts: Record<string, number>;
  previewSheets: ImportSheetPreview[];
  issues: ImportValidationIssue[];
  previewedAt: string;
};

export type ImportUploadResponse = {
  uploadId: number;
  schoolId: string;
  academicYear: string;
  importType: string;
  fileName: string;
  checksum: string;
  status: string;
  importBatchId?: string;
  duplicateFile: boolean;
  preview: ImportPreviewResponse;
  uploadedAt: string;
};

export type ImportUploadHistoryRow = {
  uploadId: number;
  schoolId: string;
  fileName: string;
  importType: string;
  academicYear: string;
  status: string;
  importBatchId?: string;
  totalRows: number;
  totalSheets: number;
  errorCount: number;
  warningCount: number;
  committed: boolean;
  rolledBack: boolean;
  stagedRowCount?: number;
  lifecycleMessage?: string;
  uploadedAt: string;
};

export type ImportCommitResponse = {
  uploadId: number;
  schoolId: string;
  status: string;
  importBatchId?: string;
  message: string;
  committed: boolean;
  rolledBack: boolean;
  stagedRowCount?: number;
  lifecycleMessage?: string;
  actionAt: string;
};

export const day28SampleSheets: ImportSheetPreview[] = [
  { sheetName: 'SchoolProfile', totalRows: 1, headers: ['School Access ID', 'school_name', 'academic_year'] },
  { sheetName: 'Students', totalRows: 300, headers: ['admission_no', 'student_name', 'class_name', 'section'] },
  { sheetName: 'Parents', totalRows: 300, headers: ['admission_no', 'parent_name', 'mobile'] },
  { sheetName: 'Teachers', totalRows: 30, headers: ['teacher_id', 'teacher_name', 'mobile'] },
  { sheetName: 'TeacherAssignments', totalRows: 90, headers: ['teacher_id', 'class_name', 'section', 'subject'] },
  { sheetName: 'Subjects', totalRows: 20, headers: ['subject_name', 'subject_type', 'weekly_periods'] },
  { sheetName: 'ClassSections', totalRows: 20, headers: ['class_name', 'section'] },
  { sheetName: 'TeacherPools', totalRows: 10, headers: ['class_name', 'teacher_pool'] },
  { sheetName: 'Schedules', totalRows: 40, headers: ['day', 'period', 'start_time', 'end_time'] },
];

function unwrap<T>(result: { data?: T } | T): T {
  return ('data' in (result as { data?: T }) && (result as { data?: T }).data ? (result as { data: T }).data : result) as T;
}

export async function validateImportPreview(sheets: ImportSheetPreview[] = day28SampleSheets) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const result = await apiClient<{ data?: ImportPreviewResponse } | ImportPreviewResponse>('/imports/preview/validate', {
    method: 'POST',
    token: user?.token,
    schoolId,
    body: JSON.stringify({
      schoolId,
      importType: 'MASTER_WORKBOOK',
      fileName: 'pilot-school-master.xlsx',
      requestedByRole: user?.role || 'ADMIN',
      sheets,
    }),
  });
  return unwrap<ImportPreviewResponse>(result);
}

export function toSafeImportMessage(error: unknown, fallback = 'The import service could not complete this action. Please verify backend is running and try again.') {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) return 'Backend connection is unavailable. Start attendanceApp on port 8080 and retry the workbook upload.';
  if (message.toLowerCase().includes('school_id') || message.toLowerCase().includes('tenant')) return 'The workbook tenant does not match the active school. Please verify school_id and login context.';
  if (message.toLowerCase().includes('xlsx') || message.toLowerCase().includes('workbook')) return message;
  if (message.toLowerCase().includes('validation errors')) return message;
  return fallback;
}

export async function uploadImportWorkbook(file: File, academicYear: string, importType: string) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('schoolId', schoolId);
  formData.append('academicYear', academicYear);
  formData.append('importType', importType.toUpperCase().replaceAll(' ', '_').replaceAll('+', 'AND'));
  formData.append('requestedByRole', user?.role || 'ADMIN');
  const result = await webApi.uploadImportWorkbook<{ data?: ImportUploadResponse } | ImportUploadResponse>(formData, user?.token, schoolId);
  return unwrap<ImportUploadResponse>(result);
}

export async function getImportHistory() {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const result = await webApi.importWorkbookHistory<{ data?: ImportUploadHistoryRow[] } | ImportUploadHistoryRow[]>(schoolId, user?.token);
  return unwrap<ImportUploadHistoryRow[]>(result);
}

export async function getImportPreview(uploadId: number) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const result = await webApi.importWorkbookPreview<{ data?: ImportPreviewResponse } | ImportPreviewResponse>(uploadId, schoolId, user?.token);
  return unwrap<ImportPreviewResponse>(result);
}

export async function commitImportWorkbook(uploadId: number) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const result = await webApi.commitImportWorkbook<{ data?: ImportCommitResponse } | ImportCommitResponse>(uploadId, schoolId, user?.token);
  return unwrap<ImportCommitResponse>(result);
}

export async function rollbackImportWorkbook(uploadId: number) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const result = await webApi.rollbackImportWorkbook<{ data?: ImportCommitResponse } | ImportCommitResponse>(uploadId, schoolId, user?.token);
  return unwrap<ImportCommitResponse>(result);
}


export function uploadToHistoryRow(upload: ImportUploadResponse): ImportUploadHistoryRow {
  const issues = upload.preview?.issues || [];
  return {
    uploadId: upload.uploadId,
    schoolId: upload.schoolId,
    fileName: upload.fileName,
    importType: upload.importType,
    academicYear: upload.academicYear,
    status: upload.status,
    importBatchId: upload.importBatchId,
    totalRows: Object.values(upload.preview?.rowCounts || {}).reduce((sum, value) => sum + value, 0),
    totalSheets: Object.keys(upload.preview?.rowCounts || {}).length,
    errorCount: issues.filter((issue) => issue.severity === 'ERROR').length,
    warningCount: issues.filter((issue) => issue.severity === 'WARNING').length,
    committed: false,
    rolledBack: false,
    stagedRowCount: 0,
    lifecycleMessage: upload.status === 'BLOCKED' ? 'Workbook uploaded but commit is blocked until validation errors are resolved.' : 'Workbook uploaded, validated, and ready for commit staging.',
    uploadedAt: upload.uploadedAt,
  };
}
