'use client';

import { useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

type CredentialRole = 'TEACHER' | 'STUDENT';

type Credential = {
  role: CredentialRole | string;
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
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const user = useMemo(() => (typeof window !== 'undefined' ? getStoredUser() : null), []);
  const schoolId = user?.schoolId || 'TST2';
  const shellRole = user?.role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN';

  const filteredCredentials = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return credentials;
    return credentials.filter((item) => [item.displayName, item.username, item.linkedReference]
      .some((value) => String(value || '').toLowerCase().includes(search)));
  }, [credentials, query]);

  async function load(nextRole: CredentialRole = role) {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const rows = await webApi.userCredentials<Credential[]>(nextRole, schoolId, user?.token);
      const safeRows = Array.isArray(rows) ? rows : [];
      setCredentials(safeRows);
      setMessage(`${safeRows.length} ${nextRole.toLowerCase()} credential${safeRows.length === 1 ? '' : 's'} loaded from ${schoolId}.`);
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
    setQuery('');
    load(nextRole);
  }

  const exportRows = useMemo(() => credentials.map((credential) => ({
    Role: credential.role || role,
    Name: credential.displayName || '',
    Username: credential.username || '',
    'Temporary Password': credential.temporaryPassword || '',
    Reference: credential.linkedReference || '',
    'First Login Rule': 'Use temporary password for first login, then create a new password.',
  })), [credentials, role]);

  function downloadBlob(blob: Blob, extension: 'csv' | 'xls') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolId}-${role.toLowerCase()}-credentials.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  }

  function downloadCsv() {
    if (!exportRows.length) return;
    const header = ['Role', 'Name', 'Username', 'Temporary Password', 'Reference', 'First Login Rule'];
    const lines = [
      header.map(csvCell).join(','),
      ...exportRows.map((row) => header.map((key) => csvCell(row[key as keyof typeof row])).join(',')),
    ];
    downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), 'csv');
  }

  function downloadExcel() {
    if (!exportRows.length) return;
    const header = ['Role', 'Name', 'Username', 'Temporary Password', 'Reference', 'First Login Rule'];
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${header.map((column) => `<th>${column}</th>`).join('')}</tr></thead><tbody>${exportRows.map((row) => `<tr>${header.map((key) => `<td>${String(row[key as keyof typeof row] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), 'xls');
  }

  return (
    <PortalShell
      role={shellRole}
      title="User Credentials"
      subtitle="Production credential center for imported teachers and students."
      variant="gold"
    >
      <ShellStyles />

      <section className="glass-panel premium-panel erp-section" style={{ padding: 24 }}>
        <div className="section-heading-row" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div>
            <p className="eyebrow">Credential Center</p>
            <h2>Teacher & Student First-Login Credentials</h2>
            <p style={{ maxWidth: 820 }}>
              This page shows real provisioned users for <strong>{schoolId}</strong>. Teacher and student credentials are exported only for first login. Parent access remains OTP-based through Student ID and the imported parent mobile number.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className={role === 'TEACHER' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => selectRole('TEACHER')} disabled={loading}>Teacher</button>
            <button className={role === 'STUDENT' ? 'primary-button' : 'secondary-button'} type="button" onClick={() => selectRole('STUDENT')} disabled={loading}>Student</button>
            <button className="secondary-button" type="button" onClick={() => load(role)} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
            <div style={{ position: 'relative' }}>
              <button className="primary-button" type="button" onClick={() => setDownloadOpen((value) => !value)} disabled={!credentials.length || loading}>Download</button>
              {downloadOpen ? (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20, minWidth: 170, padding: 8, borderRadius: 14, background: 'rgba(16,24,40,0.98)', border: '1px solid rgba(209,167,77,0.55)', boxShadow: '0 18px 40px rgba(0,0,0,0.25)' }}>
                  <button className="secondary-button" style={{ width: '100%', marginBottom: 8 }} type="button" onClick={downloadCsv}>Download CSV</button>
                  <button className="secondary-button" style={{ width: '100%' }} type="button" onClick={downloadExcel}>Download Excel</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Current School</p>
          <h3>{schoolId}</h3>
          <p>Credentials are tenant-filtered by logged-in school.</p>
        </section>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Loaded Records</p>
          <h3>{credentials.length}</h3>
          <p>{role === 'TEACHER' ? 'Teacher' : 'Student'} records available for secure sharing.</p>
        </section>
        <section className="glass-panel premium-panel" style={{ padding: 20 }}>
          <p className="eyebrow">Parent Rule</p>
          <h3>OTP Only</h3>
          <p>Parent passwords are not exported from this page.</p>
        </section>
      </div>

      <section className="glass-panel premium-panel erp-section" style={{ padding: 24, marginTop: 16 }}>
        <div className="section-heading-row" style={{ alignItems: 'center', gap: 16 }}>
          <div>
            <p className="eyebrow">Credential List</p>
            <h2>{role === 'TEACHER' ? 'Teacher Credentials' : 'Student Credentials'}</h2>
          </div>
          <input
            aria-label="Search credentials"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, username, reference"
            style={{ minWidth: 280, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(209,167,77,0.55)', fontWeight: 700 }}
          />
        </div>

        {message ? <p className="dev-note" style={{ marginTop: 12 }}>{message}</p> : null}
        {error ? <p className="error-text" style={{ marginTop: 12 }}>{error}</p> : null}

        <div style={{ overflowX: 'auto', marginTop: 18 }}>
          <table
            className="data-table"
            style={{
              width: '100%',
              minWidth: 980,
              tableLayout: 'fixed',
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', verticalAlign: 'bottom' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', verticalAlign: 'bottom' }}>Username</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', verticalAlign: 'bottom' }}>Temporary Password</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', verticalAlign: 'bottom' }}>Reference</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', verticalAlign: 'bottom' }}>First Login Rule</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredentials.map((credential) => (
                <tr key={`${credential.role}-${credential.username}`}>
                  <td style={{ textAlign: 'left', padding: '9px 16px', verticalAlign: 'top', wordBreak: 'break-word' }}>{credential.displayName || '-'}</td>
                  <td style={{ textAlign: 'left', padding: '9px 16px', verticalAlign: 'top', wordBreak: 'break-word' }}><strong>{credential.username || '-'}</strong></td>
                  <td style={{ textAlign: 'left', padding: '9px 16px', verticalAlign: 'top', wordBreak: 'break-word' }}><code>{credential.temporaryPassword || '-'}</code></td>
                  <td style={{ textAlign: 'left', padding: '9px 16px', verticalAlign: 'top', wordBreak: 'break-word' }}>{credential.linkedReference || '-'}</td>
                  <td style={{ textAlign: 'left', padding: '9px 16px', verticalAlign: 'top', wordBreak: 'break-word' }}>Create a new password after first login.</td>
                </tr>
              ))}
              {!filteredCredentials.length && !loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'left', padding: '18px 16px' }}>No matching credentials found for {schoolId}. Refresh after import commit/recommit.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </PortalShell>
  );
}
