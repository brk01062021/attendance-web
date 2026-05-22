export type WebUserRole = 'ADMIN' | 'PRINCIPAL';

export type WebPortalUser = {
  userId: number;
  schoolId: number;
  role: WebUserRole;
  displayName: string;
  schoolName: string;
  token?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
  role: WebUserRole;
};

export type LoginApiResponse = {
  token: string;
  userId?: number;
  schoolId?: number;
  teacherId?: number | null;
  teacherName?: string | null;
  displayName?: string | null;
  schoolName?: string | null;
  role: WebUserRole | string;
};
