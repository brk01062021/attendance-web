const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export type ApiOptions = RequestInit & {
  token?: string;
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
  const { token, query, headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${withQuery(path, query)}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`VidyaSetu API ${response.status}: ${errorText || response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const webApi = {
  login: <T>(body: unknown) => apiClient<T>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  health: <T>() => apiClient<T>('/pilot-onboarding/health'),
  pilotOnboardingSummary: <T>(schoolId: number, token?: string) => apiClient<T>('/pilot-onboarding/summary', { token, query: { schoolId } }),
  adminSummary: <T>(date: string, token?: string) => apiClient<T>('/attendance/dashboard/admin', { token, query: { date } }),
  principalSummary: <T>(date: string, token?: string) => apiClient<T>('/principal/dashboard/summary', { token, query: { date } }),
  rolloutReadiness: <T>(batchId: string, token?: string) => apiClient<T>(`/timetable/operations/rollout-readiness/${batchId}`, { token }),
};

export { API_BASE_URL };
