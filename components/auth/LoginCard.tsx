'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDevUser, storeUser } from '@/lib/auth';
import type { LoginRequest, WebUserRole } from '@/types/auth';

export default function LoginCard() {
  const router = useRouter();
  const [role, setRole] = useState<WebUserRole>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request: LoginRequest = { username, password, role };
    const user = createDevUser(request);
    storeUser(user);
    router.push(role === 'ADMIN' ? '/admin' : '/principal');
  }

  return (
    <form className="login-card gold-panel" onSubmit={onSubmit}>
      <p className="eyebrow">WEB ERP LOGIN</p>
      <h1>VidyaSetu Portal</h1>
      <p className="login-copy">Admin and Principal web shell for school onboarding, timetable operations, reports, and imports.</p>

      <div className="role-switch" aria-label="Choose role">
        {(['ADMIN', 'PRINCIPAL'] as WebUserRole[]).map((item) => (
          <button key={item} type="button" className={role === item ? 'role-pill role-pill--active' : 'role-pill'} onClick={() => setRole(item)}>
            {item === 'ADMIN' ? 'Admin' : 'Principal'}
          </button>
        ))}
      </div>

      <label>
        Username
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin123" />
      </label>

      <button className="primary-button" type="submit">Open {role === 'ADMIN' ? 'Admin' : 'Principal'} Portal</button>
      <small className="dev-note">Day 21 uses safe dev auth storage. Backend JWT hookup can replace this without changing the shell.</small>
    </form>
  );
}
