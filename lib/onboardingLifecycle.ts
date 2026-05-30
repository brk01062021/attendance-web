export type OnboardingStatus =
  | 'RESERVED'
  | 'PENDING'
  | 'APPROVED'
  | 'PILOT'
  | 'ACTIVE'
  | 'REJECTED'
  | 'NOT_STARTED';

export type OnboardingStatusResponse = {
  referenceId: string;
  schoolId?: string | null;
  schoolName: string;
  requestType: string;
  status: OnboardingStatus;
  message: string;
  nextStep: string;
  loginEnabled: boolean;
  importEnabled: boolean;
  registrationDate?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  pilotActivatedAt?: string | null;
  activatedAt?: string | null;
  submittedBy?: string | null;
  approvedBy?: string | null;
  pilotEnabledBy?: string | null;
  activatedBy?: string | null;
  credentialsIssuedBy?: string | null;
  credentialsIssuedAt?: string | null;
  statusHistory?: string | null;
};

export type OnboardingReviewItem = OnboardingStatusResponse & {
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  expectedStudents?: number | null;
  expectedTeachers?: number | null;
  city?: string | null;
  state?: string | null;
  updatedAt?: string | null;
  rejectedAt?: string | null;
  reviewNotes?: string | null;
};

export type ActivationCredential = {
  role: string;
  username: string;
  initialPassword: string;
  displayName: string;
  created: boolean;
};

export type WorkspaceProvisioningStep = {
  key: string;
  label: string;
  status: string;
  detail: string;
};

export type ActivationPackage = {
  referenceId: string;
  schoolId: string;
  schoolName: string;
  status: OnboardingStatus;
  registrationDate?: string | null;
  activatedAt?: string | null;
  credentialsIssuedAt?: string | null;
  message: string;
  nextStep: string;
  loginEnabled: boolean;
  credentials: ActivationCredential[];
  workspaceSteps?: WorkspaceProvisioningStep[];
  activationChecklist?: string[];
  importPreparationChecklist?: string[];
  statusSummary: OnboardingStatusResponse;
};

export type OnboardingAction = {
  label: string;
  endpoint: 'approve' | 'reject' | 'mark-pilot' | 'activate';
  tone?: 'primary' | 'danger' | 'success';
};

export const ONBOARDING_STATUS_OPTIONS: OnboardingStatus[] = ['PENDING', 'APPROVED', 'PILOT', 'ACTIVE', 'REJECTED'];

export const ONBOARDING_ACTIONS = [
  { status: 'APPROVED' as OnboardingStatus, label: 'Approve', endpoint: 'approve' },
  { status: 'REJECTED' as OnboardingStatus, label: 'Reject', endpoint: 'reject' },
  { status: 'PILOT' as OnboardingStatus, label: 'Mark Pilot', endpoint: 'mark-pilot' },
  { status: 'ACTIVE' as OnboardingStatus, label: 'Mark Active', endpoint: 'activate' },
];

export function getAvailableOnboardingActions(status: OnboardingStatus): OnboardingAction[] {
  if (status === 'PENDING') return [{ label: 'Approve', endpoint: 'approve', tone: 'primary' }, { label: 'Reject', endpoint: 'reject', tone: 'danger' }];
  if (status === 'APPROVED') return [{ label: 'Mark Pilot', endpoint: 'mark-pilot', tone: 'primary' }];
  if (status === 'PILOT') return [{ label: 'Mark Active', endpoint: 'activate', tone: 'success' }];
  return [];
}

export function onboardingStatusLabel(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (value) => value.toUpperCase());
}

export function onboardingStatusTone(status: string) {
  if (status === 'ACTIVE') return 'Active School Workspace';
  if (status === 'PILOT') return 'Pilot validation';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'PENDING') return 'Registration Submitted';
  if (status === 'RESERVED') return 'Reserved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Review needed';
}

export function normalizeOnboardingText(value?: string | null) {
  return String(value || '')
    .replace(/Admin\/Principal must review/g, 'VidyaSetu onboarding team will review')
    .replace(/registration submitted for Admin\/Principal review/gi, 'Registration submitted for VidyaSetu onboarding team review')
    .replace(/ADMIN_PRINCIPAL/g, 'VidyaSetu Onboarding Team')
    .replace(/Admin Review/gi, 'VidyaSetu Onboarding Team Review')
    .replace(/Principal Review/gi, 'VidyaSetu Onboarding Team Review')
    .replace(/Tenant Activation Queue/gi, 'VidyaSetu Onboarding Status')
    .replace(/Activation Queue/gi, 'VidyaSetu Onboarding Status')
    .replace(/Activate Tenant/gi, 'Mark Active')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');
}

export function isLoginEnabledForStatus(status?: string | null) { return status === 'ACTIVE'; }
export function isImportEnabledForStatus(_status?: string | null) { return false; }

export function statusTimeline(status?: string | null) {
  const order = ['PENDING', 'APPROVED', 'PILOT', 'ACTIVE'];
  const currentIndex = Math.max(0, order.indexOf(status || 'PENDING'));
  return [
    { key: 'PENDING', label: 'Registration Submitted', done: currentIndex >= 0 },
    { key: 'APPROVED', label: 'Approved', done: currentIndex >= 1 },
    { key: 'PILOT', label: 'Pilot', done: currentIndex >= 2 },
    { key: 'ACTIVE', label: 'Active', done: currentIndex >= 3 },
  ];
}
