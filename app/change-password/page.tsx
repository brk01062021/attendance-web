'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi } from '@/lib/apiClient';
import { getStoredUser, homeRouteForRole, storeUser } from '@/lib/auth';
import type { LoginApiResponse } from '@/types/auth';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '36px 18px',
  background:
    'radial-gradient(circle at top left, rgba(212, 175, 55, 0.18), transparent 28%), linear-gradient(135deg, #07131f 0%, #102638 48%, #07131f 100%)',
  color: '#fff7dc',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '30px',
  borderRadius: 28,
  border: '1px solid rgba(245, 213, 124, 0.34)',
  background: 'linear-gradient(180deg, rgba(16, 38, 56, 0.96), rgba(7, 19, 31, 0.96))',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.42)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  fontSize: 13,
  fontWeight: 800,
  color: '#f5d57c',
  letterSpacing: '0.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 48,
  borderRadius: 16,
  border: '1px solid rgba(245, 213, 124, 0.35)',
  background: '#fffdf2',
  color: '#142235',
  padding: '0 16px',
  fontSize: 15,
  fontWeight: 700,
  outline: 'none',
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.76,
  background: '#ece5d5',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 50,
  border: 0,
  borderRadius: 999,
  marginTop: 6,
  background: 'linear-gradient(135deg, #f5c84b 0%, #ffe08a 100%)',
  color: '#1b2534',
  fontSize: 15,
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 14px 30px rgba(245, 200, 75, 0.22)',
};

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 46,
  borderRadius: 999,
  border: '1px solid rgba(245, 213, 124, 0.3)',
  background: 'rgba(255, 255, 255, 0.06)',
  color: '#fff7dc',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    setSchoolId(user.schoolId);
    setUsername(user.username || '');
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    if (!username.trim()) {
      setMessage('Username is required.');
      return;
    }

    if (!currentPassword.trim()) {
      setMessage('Temporary password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await webApi.changePassword<LoginApiResponse>({
        username: username.trim(),
        schoolId: storedUser.schoolId,
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const updatedUser = {
        ...storedUser,
        token: response.token || storedUser.token,
        forcePasswordChange: false,
      };

      storeUser(updatedUser);
      router.replace(homeRouteForRole(storedUser.role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password change failed.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={pageStyle}>
      <form style={cardStyle} onSubmit={onSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p
            style={{
              margin: 0,
              color: '#f5d57c',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            First Login Security
          </p>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.12, color: '#fff7dc' }}>
            Change Temporary Password
          </h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255, 247, 220, 0.76)', fontSize: 14, lineHeight: 1.55 }}>
            Generated activation credentials are temporary. Create a new password before opening the ERP workspace.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: 14,
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', color: 'rgba(255, 247, 220, 0.58)', fontSize: 12, fontWeight: 800 }}>Username</p>
            <p style={{ margin: 0, color: '#fff7dc', fontWeight: 900, overflowWrap: 'anywhere' }}>{username || '—'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', color: 'rgba(255, 247, 220, 0.58)', fontSize: 12, fontWeight: 800 }}>School ID</p>
            <p style={{ margin: 0, color: '#fff7dc', fontWeight: 900 }}>{schoolId || '—'}</p>
          </div>
        </div>

        <label style={labelStyle}>
          Username
          <input
            style={inputStyle}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="tst2.admin"
            autoComplete="username"
          />
        </label>

        <label style={labelStyle}>
          School ID
          <input style={disabledInputStyle} value={schoolId} disabled />
        </label>

        <label style={labelStyle}>
          Temporary Password
          <input
            style={inputStyle}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter generated temporary password"
            autoComplete="current-password"
          />
        </label>

        <label style={labelStyle}>
          New Password
          <input
            style={inputStyle}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Create a new password"
            autoComplete="new-password"
          />
        </label>

        <label style={labelStyle}>
          Confirm New Password
          <input
            style={inputStyle}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
        </label>

        <button style={buttonStyle} type="submit" disabled={isSaving}>
          {isSaving ? 'Saving Password...' : 'Save Password & Continue'}
        </button>

        <button style={secondaryButtonStyle} type="button" onClick={() => router.replace('/login')}>
          Back to Login
        </button>

        {message ? (
          <p
            style={{
              margin: 0,
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff7dc',
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {message}
          </p>
        ) : null}
      </form>
    </main>
  );
}
