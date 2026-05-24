'use client';

import type { PortalRole } from '@/lib/routes';

type HeaderUser = {
  schoolName?: string;
  school_name?: string;
  schoolId?: string;
  school_id?: string;
  tenantName?: string;
  tenantId?: string;
  school?: {
    name?: string;
    schoolId?: string;
    school_id?: string;
  };
};

type RoleAwarePortalHeaderProps = {
  role: PortalRole;
  title?: string;
  subtitle?: string;
  user?: HeaderUser | null;
  onLogout?: () => void;
};

const roleWorkspaceLabel: Record<string, string> = {
  ADMIN: 'Admin Operations Workspace',
  PRINCIPAL: 'Principal School Intelligence',
  TEACHER: 'Teacher Daily Workspace',
  STUDENT: 'Student Learning Workspace',
};

function formatRole(role: PortalRole) {
  return String(role || '').toUpperCase();
}

function resolveSchoolName(user?: HeaderUser | null) {
  return (
    user?.schoolName ||
    user?.school_name ||
    user?.school?.name ||
    user?.tenantName ||
    'BRK International School'
  );
}

function resolveSchoolId(user?: HeaderUser | null) {
  return (
    user?.schoolId ||
    user?.school_id ||
    user?.school?.schoolId ||
    user?.school?.school_id ||
    user?.tenantId ||
    'BRK1'
  );
}

export default function RoleAwarePortalHeader({
  role,
  title,
  subtitle,
  user,
  onLogout,
}: RoleAwarePortalHeaderProps) {
  const effectiveRole = formatRole(role);
  const schoolName = resolveSchoolName(user);
  const workspace = `VidyaSetu ERP • ${roleWorkspaceLabel[effectiveRole] ?? 'Role Workspace'}`;
  const operationalSubtitle = subtitle || title || 'Attendance • Reports • Leave Approvals • Timetable • School Operations';
  const schoolId = resolveSchoolId(user);

  return (
    <header className="rounded-[28px] border border-amber-300/20 bg-slate-950/70 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur md:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-amber-50 md:text-3xl">
            {schoolName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-amber-200/85 md:text-base">{workspace}</p>
          <p className="mt-2 max-w-3xl text-xs font-semibold leading-5 text-white/60 md:text-sm">{operationalSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
            {effectiveRole}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85">
            {schoolId}
          </span>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-rose-300/25 bg-rose-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-100 transition hover:bg-rose-500/20"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
