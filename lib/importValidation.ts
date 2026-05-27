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
  totalRows: number;
  totalSheets: number;
  errorCount: number;
  warningCount: number;
  committed: boolean;
  rolledBack: boolean;
  uploadedAt: string;
};

export type ImportCommitResponse = {
  uploadId: number;
  schoolId: string;
  status: string;
  message: string;
  committed: boolean;
  rolledBack: boolean;
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

export async function uploadImportWorkbook(file: File, academicYear: string, importType: string) {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'BRK1';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('schoolId', schoolId);
  formData.append('academicYear', academicYear);
  formData.append('importType', importType.toUpperCase().replaceAll(' ', '_'));
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
