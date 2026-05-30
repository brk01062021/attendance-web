export type WorkspaceStep = {
  key: string;
  label: string;
  completed: boolean;
  requiredBeforeImport: boolean;
};

export type WorkspaceChecklist = {
  schoolId: string;
  schoolName?: string;
  academicYear?: string;
  academicYearStartDate?: string;
  academicYearEndDate?: string;
  workingDays?: string;
  schoolStartTime?: string;
  schoolEndTime?: string;
  periodsPerDay?: number;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  importLocked: boolean;
  importLockMessage: string;
  steps: WorkspaceStep[];
};

export type ApiEnvelope<T> = { success?: boolean; message?: string; data: T };
