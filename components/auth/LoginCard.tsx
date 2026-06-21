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
    const [parentStudentId, setParentStudentId] = useState('');
    const [parentMobile, setParentMobile] = useState('');
    const [parentOtp, setParentOtp] = useState('');
    const [parentNewPassword, setParentNewPassword] = useState('');
    const [parentOtpRequested, setParentOtpRequested] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const normalizeSchool = () => schoolId.trim().toUpperCase();

    async function ensureLoginEnabled(normalizedSchoolId: string) {
        const status = await webApi.onboardingStatusBySchoolId<{
            status: string;
            loginEnabled: boolean;
            message?: string;
            nextStep?: string;
        }>(normalizedSchoolId);

        if (!status.loginEnabled) {
            throw new Error(
                `${status.message || 'School registration is not active yet.'} ${
                    status.nextStep || 'Please check registration status using your reference ID.'
                }`
            );
        }
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        const normalizedSchoolId = normalizeSchool();

        if (!normalizedSchoolId) {
            setMessage('School ID is required.');
            setIsLoading(false);
            return;
        }

        const request: LoginRequest = {
            username: username.trim(),
            password,
            role,
            schoolId: normalizedSchoolId,
        };

        try {
            await ensureLoginEnabled(normalizedSchoolId);

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
                        : 'Login failed. Please verify the School ID, username, and password.'
                );
                setIsLoading(false);
                return;
            }

            const user = createDevUser(request);

            storeUser(user);
            setMessage('Login service is unavailable. Please try again after the service is restored.');
            router.push(homeRouteForRole(role));
        } finally {
            setIsLoading(false);
        }
    }

    async function requestOtp() {
        setMessage('');
        const normalizedSchoolId = normalizeSchool();
        if (!normalizedSchoolId || !parentStudentId.trim() || !parentMobile.trim()) {
            setMessage('Enter School ID, Student ID and parent mobile number.');
            return;
        }
        try {
            setIsLoading(true);
            await ensureLoginEnabled(normalizedSchoolId);
            const response = await webApi.requestParentOtp<{ message?: string; maskedMobile?: string }>({
                schoolId: normalizedSchoolId,
                studentId: parentStudentId.trim(),
                parentMobile: parentMobile.trim(),
            });
            setParentOtpRequested(true);
            setUsername(parentMobile.trim());
            setMessage(response.message || `OTP sent to registered parent mobile${response.maskedMobile ? ` ${response.maskedMobile}` : ''}.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Student and parent mobile mapping could not be verified.');
        } finally {
            setIsLoading(false);
        }
    }

    async function activateParent() {
        setMessage('');
        const normalizedSchoolId = normalizeSchool();
        if (!parentStudentId.trim() || !parentMobile.trim() || !parentOtp.trim() || parentNewPassword.trim().length < 8) {
            setMessage('Enter Student ID, parent mobile, OTP and a new password of at least 8 characters.');
            return;
        }
        try {
            setIsLoading(true);
            const response = await webApi.activateParentLogin<LoginApiResponse>({
                schoolId: normalizedSchoolId,
                studentId: parentStudentId.trim(),
                parentMobile: parentMobile.trim(),
                otp: parentOtp.trim(),
                newPassword: parentNewPassword,
            });
            const user = { ...mapLoginResponseToUser(response, 'PARENT'), username: parentMobile.trim() };
            storeUser(user);
            router.push(homeRouteForRole(user.role));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to activate parent login.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="login-card gold-panel" onSubmit={onSubmit}>
            <div className="login-logo">
                <Image src="/branding/app-icon.png" alt="VidyaSetu" width={56} height={56} priority />
                <div>
                    <p className="eyebrow">WEB ERP LOGIN</p>
                    <strong>portal.vidyasetu.co</strong>
                </div>
            </div>

            <h1>VidyaSetu Portal</h1>

            <p className="login-copy">
                Premium Admin, Principal, Teacher, Student and Parent web ERP for school onboarding,
                timetable operations, reports, imports, and operational readiness.
            </p>

            <div className="role-switch" aria-label="Choose role">
                {(['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] as WebUserRole[]).map((item) => (
                    <button key={item} type="button" className={role === item ? 'role-pill role-pill--active' : 'role-pill'} onClick={() => setRole(item)}>
                        {item.charAt(0) + item.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <label>
                {role === 'PARENT' ? 'Parent Mobile Number' : 'Username'}
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={role === 'PARENT' ? 'Parent mobile number' : 'Username'} />
            </label>

            <label>
                School ID
                <input value={schoolId} onChange={(event) => setSchoolId(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))} placeholder="BRK1" maxLength={4} />
            </label>

            <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={role === 'PARENT' ? 'Parent password after OTP setup' : 'Temporary or updated password'} />
            </label>

            <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : role === 'PARENT' ? 'Login with Parent Password' : `Open ${role.charAt(0) + role.slice(1).toLowerCase()} Portal`}
            </button>

            {role === 'PARENT' ? (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 18, border: '1px solid rgba(245, 213, 124, 0.28)', background: 'rgba(245, 213, 124, 0.08)' }}>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>FIRST-TIME PARENT OTP SETUP</p>
                    <small className="dev-note">Use School ID + Student ID + imported parent phone number. After OTP verification, create the parent password.</small>
                    <label>
                        Student ID
                        <input value={parentStudentId} onChange={(event) => setParentStudentId(event.target.value.toUpperCase())} placeholder="Imported student ID / admission no" />
                    </label>
                    <label>
                        Parent Mobile
                        <input value={parentMobile} onChange={(event) => setParentMobile(event.target.value)} placeholder="Imported parent mobile" />
                    </label>
                    <button className="secondary-button" type="button" onClick={requestOtp} disabled={isLoading} style={{ width: '100%', marginTop: 8 }}>
                        Request OTP
                    </button>
                    {parentOtpRequested ? (
                        <>
                            <label>
                                OTP
                                <input value={parentOtp} onChange={(event) => setParentOtp(event.target.value)} placeholder="Enter OTP" />
                            </label>
                            <label>
                                Create Parent Password
                                <input type="password" value={parentNewPassword} onChange={(event) => setParentNewPassword(event.target.value)} placeholder="Minimum 8 characters" />
                            </label>
                            <button className="primary-button" type="button" onClick={activateParent} disabled={isLoading}>
                                Verify OTP & Create Parent Password
                            </button>
                        </>
                    ) : null}
                </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <Link className="secondary-button" href="/register-school" style={{ textAlign: 'center' }}>Register School</Link>
                <Link className="secondary-button" href="/request-pilot-demo" style={{ textAlign: 'center' }}>Request Pilot Demo</Link>
                <Link className="secondary-button" href="/check-registration-status" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Check Registration Status</Link>
            </div>

            {message ? <small className="dev-note">{message}</small> : null}

            <small className="dev-note">
                Teachers and students must change downloaded temporary credentials on first login. Parents receive OTP on the registered mobile, then create their password.
            </small>
        </form>
    );
}
