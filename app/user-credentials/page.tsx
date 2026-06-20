'use client';

import { useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

type CredentialRole = 'TEACHER' | 'STUDENT';

type Credential = {
  role: CredentialRole;
  username: string;
  temporaryPassword: string;
  displayName: string;
  linkedReference: string;
};

function csvCell(value: string | undefined | null) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function UserCredentialsPage() {
  const [role, setRole] = useState<CredentialRole>('TEACHER');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useMemo(() => (typeof window !== 'undefined' ? getStoredUser() : null), []);
  const shellRole = user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN';

  async function load(nextRole: CredentialRole = role) {
    if (!user?.schoolId) {
      setError('Login again to download teacher and student credentials.');
      setCredentials([]);
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const rows = await webApi.userCredentials<Credential[]>(nextRole, user.schoolId, user.token);
      setCredentials(rows);
      setMessage(`${rows.length} ${nextRole.toLowerCase()} credential${rows.length === 1 ? '' : 's'} ready for ${user.schoolId}. Parent accounts are excluded and use OTP activation.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load credentials.');
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('TEACHER');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectRole(nextRole: CredentialRole) {
    setRole(nextRole);
    load(nextRole);
  }

  function downloadCsv() {
    if (!credentials.length) return;
    const header = ['Role', 'Name', 'Username', 'Temporary Password', 'Linked Reference', 'First Login Instruction'];
    const lines = [
      header.map(csvCell).join(','),
      ...credentials.map((credential) => [
        credential.role,
        credential.displayName,
        credential.username,
        credential.temporaryPassword,
        credential.linkedReference,
        'Login with this temporary password and create a new password on first login',
      ].map(csvCell).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.schoolId || 'school'}-${role.toLowerCase()}-credentials.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <PortalShell
      role={shellRole}
      title="User Credentials"
      subtitle="Download teacher and student first-login credentials after school import commit."
      variant="gold"
    >
      <ShellStyles />

      <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
        <p className="eyebrow">Credential Center</p>
        <h2>Teacher & Student Credential Downloads</h2>
        <p>
          Use this page after committing school import data. Teachers and students receive temporary passwords and must create a new password on first login. Parents are not downloaded here because parent access is activated through Student ID + parent mobile OTP mapping.
        </p>
      </section>

      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Teacher Login</p>
          <h3>Temporary credential based</h3>
          <p>Admin/Principal downloads teacher usernames and temporary passwords. First login requires password change.</p>
        </section>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Student Login</p>
          <h3>Temporary credential based</h3>
          <p>Admin/Principal downloads student usernames and temporary passwords. First login requires password change.</p>
        </section>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Parent Login</p>
          <h3>OTP activation only</h3>
          <p>Parents activate with school code, Student ID, and imported parent mobile number. Parent credentials are never exported.</p>
        </section>
      </div>

      <section className="glass-panel premium-panel erp-section" style={{ padding: 24, marginTop: 16 }}>
        <div className="section-heading-row" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div>
            <p className="eyebrow">Downloads</p>
            <h2>{role === 'TEACHER' ? 'Teacher Credentials' : 'Student Credentials'}</h2>
            <p>{user?.schoolId ? `School: ${user.schoolId}` : 'School session unavailable'}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button className={role === 'TEACHER' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => selectRole('TEACHER')} disabled={loading}>Teacher</button>
            <button className={role === 'STUDENT' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => selectRole('STUDENT')} disabled={loading}>Student</button>
            <button className="secondary-button" type="button" onClick={() => load(role)} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
            <button className="primary-button" type="button" onClick={downloadCsv} disabled={!credentials.length || loading}>Download CSV</button>
          </div>
        </div>

        {message ? <p className="dev-note" style={{ marginTop: 12 }}>{message}</p> : null}
        {error ? <p className="error-text" style={{ marginTop: 12 }}>{error}</p> : null}

        <div style={{ overflowX: 'auto', marginTop: 18 }}>
          <table className="data-table" style={{ width: '100%', minWidth: 760 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Temporary Password</th>
                <th>Linked Reference</th>
                <th>Instruction</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => (
                <tr key={`${credential.role}-${credential.username}`}>
                  <td>{credential.displayName || '-'}</td>
                  <td><strong>{credential.username}</strong></td>
                  <td><code>{credential.temporaryPassword}</code></td>
                  <td>{credential.linkedReference || '-'}</td>
                  <td>First login requires creating a new password.</td>
                </tr>
              ))}
              {!credentials.length && !loading ? (
                <tr>
                  <td colSpan={5}>No credentials found. Commit school import data first, then refresh this page.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </PortalShell>
  );
}
