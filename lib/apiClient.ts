const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export type ApiOptions = RequestInit & {
  token?: string;
  schoolId?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function withQuery(path: string, query?: ApiOptions['query']) {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, schoolId, query, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${withQuery(path, query)}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(schoolId ? { 'X-School-Id': schoolId } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const rawText = await response.text().catch(() => '');
    let body: { message?: string; errorCode?: string; data?: { message?: string } } = {};
    try {
      body = rawText ? JSON.parse(rawText) : {};
    } catch {
      body = { message: rawText };
    }
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vidyasetu:session-expired'));
    }
    const message = body?.message || body?.data?.message || body?.errorCode || rawText || `VidyaSetu API ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const webApi = {
  login: <T>(body: unknown) => apiClient<T>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  health: <T>() => apiClient<T>('/pilot-onboarding/health'),
  checkSchoolId: <T>(schoolId: string) =>
    apiClient<T>('/school-registration/school-id/check', { query: { schoolId } }),
  reserveSchoolId: <T>(schoolId: string) =>
    apiClient<T>('/school-registration/school-id/reserve', { method: 'POST', query: { schoolId } }),
  registerSchool: <T>(body: unknown) =>
    apiClient<T>('/school-registration/register', { method: 'POST', body: JSON.stringify(body) }),
  requestPilotDemo: <T>(body: unknown) =>
    apiClient<T>('/school-registration/pilot-demo/request', { method: 'POST', body: JSON.stringify(body) }),
  pilotOnboardingSummary: <T>(schoolId: string, token?: string) => apiClient<T>('/pilot-onboarding/summary', { token, schoolId, query: { schoolId } }),
  adminSummary: <T>(date: string, token?: string, schoolId?: string) => apiClient<T>('/attendance/dashboard/admin', { token, schoolId, query: { date } }),
  principalSummary: <T>(date: string, token?: string, schoolId?: string) => apiClient<T>('/principal/dashboard/summary', { token, schoolId, query: { date } }),
  rolloutReadiness: <T>(batchId: string, token?: string, schoolId?: string) => apiClient<T>(`/timetable/operations/rollout-readiness/${batchId}`, { token, schoolId }),
  teacherLeaveEnquiries: <T>(fromDate: string, toDate: string, token?: string, schoolId?: string) =>
    apiClient<T>('/teacher-leave/admin/enquiries', { token, schoolId, query: { fromDate, toDate } }),
  approveTeacherLeaveEnquiry: <T>(enquiryId: number, adminRemarks: string, token?: string, schoolId?: string) =>
    apiClient<T>(`/teacher-leave/admin/enquiries/${enquiryId}/approve`, { method: 'POST', token, schoolId, query: { adminRemarks } }),
  rejectTeacherLeaveEnquiry: <T>(enquiryId: number, adminRemarks: string, token?: string, schoolId?: string) =>
    apiClient<T>(`/teacher-leave/admin/enquiries/${enquiryId}/reject`, { method: 'POST', token, schoolId, query: { adminRemarks } }),
  submitTeacherLeaveEnquiry: <T>(body: unknown, token?: string, schoolId?: string) =>
    apiClient<T>('/teacher-leave/enquiry', { method: 'POST', token, schoolId, body: JSON.stringify(body) }),
  teacherLeaveHistory: <T>(teacherId: number, token?: string, schoolId?: string) =>
    apiClient<T>(`/teacher-leave/enquiry/history/${teacherId}`, { token, schoolId }),
  teacherNotifications: <T>(userId: number, role: string, token?: string, schoolId?: string) =>
    apiClient<T>('/notifications', { token, schoolId, query: { userId, role } }),
  submitBulkAttendance: <T>(body: unknown, token?: string, schoolId?: string) =>
    apiClient<T>('/attendance/bulk', { method: 'POST', token, schoolId, body: JSON.stringify(body) }),
  uploadImportWorkbook: <T>(formData: FormData, token?: string, schoolId?: string) =>
    apiClient<T>('/imports/workbooks/upload', { method: 'POST', token, schoolId, body: formData }),
  importWorkbookHistory: <T>(schoolId: string, token?: string) =>
    apiClient<T>('/imports/workbooks/history', { token, schoolId, query: { schoolId } }),
  importWorkbookPreview: <T>(uploadId: number, schoolId: string, token?: string) =>
    apiClient<T>(`/imports/workbooks/${uploadId}/preview`, { token, schoolId, query: { schoolId } }),
  commitImportWorkbook: <T>(uploadId: number, schoolId: string, token?: string) =>
    apiClient<T>(`/imports/workbooks/${uploadId}/commit`, { method: 'POST', token, schoolId, query: { schoolId } }),
  rollbackImportWorkbook: <T>(uploadId: number, schoolId: string, token?: string) =>
    apiClient<T>(`/imports/workbooks/${uploadId}/rollback`, { method: 'POST', token, schoolId, query: { schoolId } }),
  academicYears: <T>(token?: string, schoolId?: string) =>
    apiClient<T>('/api/operational-lookups/academic-years', { token, schoolId, query: { schoolId } }),
  schoolClasses: <T>(schoolId: string, token?: string) =>
    apiClient<T>('/api/operational-lookups/classes', { token, schoolId, query: { schoolId } }),
  schoolSections: <T>(schoolId: string, className: string, token?: string) =>
    apiClient<T>('/api/operational-lookups/sections', { token, schoolId, query: { schoolId, className } }),
  teacherSearch: <T>(schoolId: string, query: string, token?: string) =>
    apiClient<T>('/api/operational-lookups/teachers/search', { token, schoolId, query: { schoolId, query } }),
};

export { API_BASE_URL };
