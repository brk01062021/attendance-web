'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDevUser, homeRouteForRole, mapLoginResponseToUser, storeUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';
import type { LoginApiResponse, LoginRequest, WebUserRole } from '@/types/auth';

export default function LoginCard() {
    const router = useRouter();

    const [role, setRole] = useState<WebUserRole>('ADMIN');
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [schoolId, setSchoolId] = useState('BRK1');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        const request: LoginRequest = {
            username,
            password,
            role,
            schoolId: schoolId.trim().toUpperCase(),
        };

        try {
            const response = await webApi.login<LoginApiResponse>(request);
            const user = mapLoginResponseToUser(response, role);
            storeUser(user);
            router.push(homeRouteForRole(user.role));
        } catch (error) {
            const allowDevFallback = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_FALLBACK !== 'false';
            if (!allowDevFallback) {
                setMessage(error instanceof Error ? error.message : 'Login failed. Please verify backend API is running.');
                setIsLoading(false);
                return;
            }
            const user = createDevUser(request);
            storeUser(user);
            setMessage('Backend login unavailable, opened safe local dev session.');
            router.push(homeRouteForRole(role));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="login-card gold-panel" onSubmit={onSubmit}>
            <div className="login-logo">
                <Image
                    src="/branding/app-icon.png"
                    alt="VidyaSetu"
                    width={56}
                    height={56}
                    priority
                />

                <div>
                    <p className="eyebrow">WEB ERP LOGIN</p>
                    <strong>portal.vidyasetu.co</strong>
                </div>
            </div>

            <h1>VidyaSetu Portal</h1>

            <p className="login-copy">
                Premium Admin, Principal, Teacher and Student web ERP for school onboarding,
                timetable operations, reports, imports, and rollout readiness.
            </p>

            <div className="role-switch" aria-label="Choose role">
                {(['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'] as WebUserRole[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={
                            role === item
                                ? 'role-pill role-pill--active'
                                : 'role-pill'
                        }
                        onClick={() => setRole(item)}
                    >
                        {item === 'ADMIN' ? 'Admin' : item === 'PRINCIPAL' ? 'Principal' : item === 'TEACHER' ? 'Teacher' : 'Student'}
                    </button>
                ))}
            </div>

            <label>
                Username
                <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin"
                />
            </label>

            <label>
                School ID
                <input
                    value={schoolId}
                    onChange={(event) => setSchoolId(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                    placeholder="BRK1"
                    maxLength={4}
                />
            </label>

            <label>
                Password
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="admin123"
                />
            </label>

            <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Checking API...' : `Open ${role === 'ADMIN' ? 'Admin' : role === 'PRINCIPAL' ? 'Principal' : role === 'TEACHER' ? 'Teacher' : 'Student'} Portal`}
            </button>

            {message ? <small className="dev-note">{message}</small> : null}

            <small className="dev-note">
                Use the real 4-character school_id issued during onboarding, for example BRK1 or AB12. Teacher identity and teacherId are bound from the login session.
            </small>
        </form>
    );
}