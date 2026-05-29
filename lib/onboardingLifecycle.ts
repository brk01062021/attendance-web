export type OnboardingStatus = 'RESERVED' | 'PENDING' | 'APPROVED' | 'PILOT' | 'ACTIVE' | 'REJECTED';

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
};

export type OnboardingReviewItem = {
  referenceId: string;
  schoolId?: string | null;
  schoolName: string;
  requestType: string;
  status: OnboardingStatus;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  expectedStudents?: number | null;
  expectedTeachers?: number | null;
  city?: string | null;
  state?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
  approvedAt?: string | null;
  pilotActivatedAt?: string | null;
  activatedAt?: string | null;
  rejectedAt?: string | null;
  reviewNotes?: string | null;
  statusHistory?: string | null;
};

export const ONBOARDING_ACTIONS = [
  { status: 'APPROVED' as OnboardingStatus, label: 'Approve', endpoint: 'approve' },
  { status: 'REJECTED' as OnboardingStatus, label: 'Reject', endpoint: 'reject' },
  { status: 'PILOT' as OnboardingStatus, label: 'Mark Pilot', endpoint: 'mark-pilot' },
  { status: 'ACTIVE' as OnboardingStatus, label: 'Activate Tenant', endpoint: 'activate' },
];

export const ONBOARDING_STATUS_OPTIONS: OnboardingStatus[] = ['PENDING', 'APPROVED', 'PILOT', 'ACTIVE', 'REJECTED'];

export function onboardingStatusLabel(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (value) => value.toUpperCase());
}

export function onboardingStatusTone(status: string) {
  if (status === 'ACTIVE') return 'Active tenant';
  if (status === 'PILOT') return 'Pilot enabled';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'PENDING') return 'Pending review';
  if (status === 'RESERVED') return 'Reserved';
  return 'Review needed';
}
