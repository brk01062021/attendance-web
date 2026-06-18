import { apiClient } from './apiClient';

export type FeeReminderSummary = { uploadId: number; schoolId: string; originalFilename?: string; status: string; totalRows: number; readyRows: number; invalidRows: number; missingStudentRows: number; missingParentMappingRows: number; sentRows: number; failedRows: number; createdAt?: string; sentAt?: string };
export type FeeReminderRow = { id: number; rowNumber: number; studentId?: string; studentName?: string; className?: string; section?: string; pendingAmount?: number; dueDate?: string; remarks?: string; status: string; validationMessage?: string; mappedParentNames?: string };
export type FeeReminderPreview = { summary: FeeReminderSummary; rows: FeeReminderRow[] };
export type FeeReminderHistory = { id: number; uploadId: number; studentId?: string; studentName?: string; className?: string; section?: string; parentName?: string; pendingAmount?: number; dueDate?: string; remarks?: string; status: string; channel: string; sentAt?: string };

export const financeApi = {
  uploadFeeReminders: <T = FeeReminderPreview>(formData: FormData, schoolId: string, token?: string, uploadedBy?: string) =>
    apiClient<T>('/api/finance/fee-reminders/upload', { method: 'POST', token, schoolId, query: { schoolId, uploadedBy }, body: formData }),
  sendFeeReminders: <T = { summary: FeeReminderSummary; notificationsCreated: number; rowsSent: number; rowsSkipped: number }>(uploadId: number, schoolId: string, token?: string, sentBy?: string) =>
    apiClient<T>(`/api/finance/fee-reminders/${uploadId}/send`, { method: 'POST', token, schoolId, query: { schoolId, sentBy } }),
  history: <T = FeeReminderHistory[]>(schoolId: string, token?: string) =>
    apiClient<T>('/api/finance/fee-reminders/history', { token, schoolId, query: { schoolId } }),
  uploads: <T = FeeReminderSummary[]>(schoolId: string, token?: string) =>
    apiClient<T>('/api/finance/fee-reminders/uploads', { token, schoolId, query: { schoolId } }),
};
