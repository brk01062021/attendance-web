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
