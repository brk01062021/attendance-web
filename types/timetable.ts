export type TimetableOperationsStatus = {
  batchId: string;
  latestPublished: boolean;
  locked: boolean;
  versions: number;
  notifications: number;
  archived: boolean;
  entries: number;
  conflicts: number;
};

export type TimetablePublishResponse = {
  success: boolean;
  batchId: string;
  status: string;
  message: string;
  publishedEntries: number;
  remainingConflicts: number;
  publishedAt?: string | null;
  approvedBy?: string | null;
  notificationMessage?: string | null;
};

export type TimetableVersion = {
  versionNumber: number;
  batchId: string;
  createdAt: string;
  createdBy: string;
  changeType: string;
  entriesCount: number;
  notes: string;
};

export type TimetableNotification = {
  notificationId: string;
  batchId: string;
  audience: string;
  title: string;
  message: string;
  createdAt: string;
};

export type TimetableArchiveSummary = {
  batchId: string;
  archivedAt: string;
  archivedBy: string;
  entriesCount: number;
  status: string;
  message: string;
};

export type TimetableBinaryExportResponse = {
  batchId: string;
  format: 'PDF' | 'EXCEL' | string;
  fileName: string;
  contentType: string;
  base64Content: string;
  byteSize: number;
  message: string;
};

export type TimetableRolloutReadiness = {
  batchId: string;
  readyForRollout: boolean;
  locked: boolean;
  latestPublished: boolean;
  totalEntries: number;
  teacherVisibleEntries: number;
  studentParentVisibleEntries: number;
  conflicts: number;
  notifications: number;
  versions: number;
  readinessScore: number;
  blockers: string[];
  checks: string[];
};

export type PrincipalTimetableIntelligence = {
  batchId: string;
  totalEntries: number;
  classSections: number;
  conflicts: number;
  highRiskConflicts: number;
  overloadRiskTeachers: number;
  publishReadinessScore: number;
  readinessStatus: string;
  insights: string[];
  topWorkloadRisks: Array<{ teacherId: number; teacherName: string; weeklyPeriods: number; status: string; overloadRiskScore: number }>;
};

export type TimetableRepairResult = {
  batchId: string;
  conflictsBefore: number;
  conflictsAfter: number;
  repairedItems: number;
  publishReady: boolean;
  actions: string[];
};
