export type WebUserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type WebPortalUser = {
  userId: number;
  username?: string;
  schoolId: string;
  internalSchoolId?: number;
  role: WebUserRole;
  displayName: string;
  schoolName: string;
  token?: string;
  forcePasswordChange?: boolean;
  teacherId?: number | null;
  teacherName?: string | null;
  studentId?: number | null;
  studentName?: string | null;
  className?: string | null;
  section?: string | null;
};

export type LoginRequest = {
  username: string;
  password: string;
  role: WebUserRole;
  schoolId?: string;
};

export type LoginApiResponse = {
  token: string;
  userId?: number;
  schoolId?: number | string;
  externalSchoolId?: string;
  schoolCode?: string;
  teacherId?: number | null;
  teacherName?: string | null;
  studentId?: number | null;
  studentName?: string | null;
  displayName?: string | null;
  schoolName?: string | null;
  role: WebUserRole | string;
  forcePasswordChange?: boolean;
};
