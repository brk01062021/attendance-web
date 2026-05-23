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
  const response = await fetch(`${API_BASE_URL}${withQuery(path, query)}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(schoolId ? { 'X-School-Id': schoolId } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(async () => ({ message: await response.text().catch(() => '') }));
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vidyasetu:session-expired'));
    }
    throw new Error(body?.message || body?.errorCode || `VidyaSetu API ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const webApi = {
  login: <T>(body: unknown) => apiClient<T>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  health: <T>() => apiClient<T>('/pilot-onboarding/health'),
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
};

export { API_BASE_URL };
