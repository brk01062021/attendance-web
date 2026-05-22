export type PilotStepStatus = 'READY_FOR_VALIDATION' | 'IN_PROGRESS' | 'PENDING' | 'DONE' | string;

export type PilotOnboardingStep = {
  key: string;
  title: string;
  owner: string;
  status: PilotStepStatus;
  priority: 'P0' | 'P1' | 'P2' | string;
  detail: string;
};

export type PilotOnboardingSummary = {
  schoolId: string;
  schoolName: string;
  targetStudents: number;
  targetTeachers: number;
  targetAdmins: number;
  targetPrincipals: number;
  readinessStatus: string;
  plannedPilotStartDate: string;
  steps: PilotOnboardingStep[];
};

export const pilotOnboardingFallback: PilotOnboardingSummary = {
  schoolId: 'DEMO',
  schoolName: 'VidyaSetu Pilot School',
  targetStudents: 700,
  targetTeachers: 40,
  targetAdmins: 1,
  targetPrincipals: 1,
  readinessStatus: 'LOCAL_FALLBACK',
  plannedPilotStartDate: 'After 14-day validation',
  steps: [
    {
      key: 'TENANT_SETUP',
      title: 'Create pilot tenant and verify school_id isolation',
      owner: 'Admin',
      status: 'READY_FOR_VALIDATION',
      priority: 'P0',
      detail: 'Use backend API once available; keep local checklist visible for offline web testing.',
    },
    {
      key: 'MASTER_IMPORT',
      title: 'Validate one-school Excel onboarding workbook',
      owner: 'Admin',
      status: 'IN_PROGRESS',
      priority: 'P0',
      detail: 'SchoolProfile, Students, Parents, Teachers, TeacherPools, TeacherAssignments, Subjects, ClassSections.',
    },
    {
      key: 'GO_LIVE_SIGNOFF',
      title: 'Principal/Admin pilot signoff before enabling parents and students',
      owner: 'School Head',
      status: 'PENDING',
      priority: 'P0',
      detail: 'Start with one realistic school: 700 students, 30–40 teachers, one admin, one principal.',
    },
  ],
};
