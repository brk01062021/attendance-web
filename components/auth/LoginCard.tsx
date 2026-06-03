'use client';

import Image from 'next/image';
import Link from 'next/link';
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

        const normalizedSchoolId = schoolId.trim().toUpperCase();

        if (!normalizedSchoolId) {
            setMessage('School ID is required.');
            setIsLoading(false);
            return;
        }

        const request: LoginRequest = {
            username,
            password,
            role,
            schoolId: normalizedSchoolId,
        };

        try {
            const status = await webApi.onboardingStatusBySchoolId<{
                status: string;
                loginEnabled: boolean;
                message?: string;
                nextStep?: string;
            }>(normalizedSchoolId);

            if (!status.loginEnabled) {
                setMessage(
                    `${status.message || 'School registration is not active yet.'} ${
                        status.nextStep || 'Please check registration status using your reference ID.'
                    }`
                );
                setIsLoading(false);
                return;
            }

            const response = await webApi.login<LoginApiResponse>(request);
            const user = { ...mapLoginResponseToUser(response, role), username: username.trim() };

            storeUser(user);
            if (user.forcePasswordChange) {
                router.push('/change-password');
            } else {
                router.push(homeRouteForRole(user.role));
            }
        } catch (error) {
            const allowDevFallback =
                process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_FALLBACK !== 'false' &&
                ['BRK1', 'DEMO'].includes(normalizedSchoolId);

            if (!allowDevFallback) {
                setMessage(
                    error instanceof Error
                        ? error.message
                        : 'Login failed. Please verify backend API is running.'
                );
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
                {(['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] as WebUserRole[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={role === item ? 'role-pill role-pill--active' : 'role-pill'}
                        onClick={() => setRole(item)}
                    >
                        {item === 'ADMIN'
                            ? 'Admin'
                            : item === 'PRINCIPAL'
                                ? 'Principal'
                                : item === 'TEACHER'
                                    ? 'Teacher'
                                    : item === 'PARENT'
                                        ? 'Parent'
                                        : 'Student'}
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
                    onChange={(event) =>
                        setSchoolId(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))
                    }
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
                {isLoading
                    ? 'Checking API...'
                    : `Open ${
                        role === 'ADMIN'
                            ? 'Admin'
                            : role === 'PRINCIPAL'
                                ? 'Principal'
                                : role === 'TEACHER'
                                    ? 'Teacher'
                                    : role === 'PARENT'
                                        ? 'Parent'
                                        : 'Student'
                    } Portal`}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <Link className="secondary-button" href="/register-school" style={{ textAlign: 'center' }}>
                    Register School
                </Link>

                <Link className="secondary-button" href="/request-pilot-demo" style={{ textAlign: 'center' }}>
                    Request Pilot Demo
                </Link>

                <Link
                    className="secondary-button"
                    href="/check-registration-status"
                    style={{ textAlign: 'center', gridColumn: '1 / -1' }}
                >
                    Check Registration Status
                </Link>
            </div>

            {message ? <small className="dev-note">{message}</small> : null}

            <small className="dev-note">
                Use the real 4-character School Access ID issued during onboarding, for example BRK1 or AB12.
                Teacher identity and teacherId are bound from the login session.
            </small>
        </form>
    );
}