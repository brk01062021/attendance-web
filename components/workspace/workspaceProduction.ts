import type { ApiEnvelope, WorkspaceChecklist, WorkspaceStep } from './workspaceTypes';

export const WORKSPACE_SETUP_STEP_KEYS = [
  'SCHOOL_PROFILE',
  'ACADEMIC_YEAR',
  'WORKING_DAYS',
  'SCHOOL_TIMINGS',
] as const;

const SETUP_STEP_KEY_SET = new Set<string>(WORKSPACE_SETUP_STEP_KEYS);

export function isProductionSetupStep(step: WorkspaceStep): boolean {
  return SETUP_STEP_KEY_SET.has(step.key);
}

export function extractWorkspaceChecklist(response: unknown): WorkspaceChecklist | null {
  const raw = response as {
    data?: WorkspaceChecklist | ApiEnvelope<WorkspaceChecklist>;
    steps?: WorkspaceStep[];
  } | null;

  if (!raw) return null;

  const direct = raw as WorkspaceChecklist;
  if (Array.isArray(direct.steps)) {
    return direct;
  }

  const responseData = raw.data as WorkspaceChecklist | ApiEnvelope<WorkspaceChecklist> | undefined;
  if (responseData && Array.isArray((responseData as WorkspaceChecklist).steps)) {
    return responseData as WorkspaceChecklist;
  }

  const nestedData = (responseData as ApiEnvelope<WorkspaceChecklist> | undefined)?.data;
  if (nestedData && Array.isArray(nestedData.steps)) {
    return nestedData;
  }

  return null;
}

export function normalizeWorkspaceChecklist(checklist: WorkspaceChecklist): WorkspaceChecklist {
  const setupSteps = checklist.steps.filter(isProductionSetupStep);
  const completedSteps = setupSteps.filter((step) => step.completed).length;
  const totalSteps = setupSteps.length || WORKSPACE_SETUP_STEP_KEYS.length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  const importLocked = completedSteps < totalSteps;

  return {
    ...checklist,
    steps: setupSteps,
    completedSteps,
    totalSteps,
    progressPercent,
    importLocked,
    importLockMessage: importLocked
      ? 'Complete School Profile, Academic Year, Working Days, and School Timings before importing school data.'
      : 'School Workspace Setup complete. Import School Data is unlocked.',
  };
}
