'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';

type SchoolIdCheck = {
  schoolId: string;
  available: boolean;
  status: string;
  message: string;
};

type RegistrationResponse = {
  referenceId: string;
  schoolId: string;
  schoolName: string;
  status: string;
  message: string;
  nextStep: string;
};

export default function RegisterSchoolPage() {
  const [schoolName, setSchoolName] = useState('');
  const [requestedSchoolId, setRequestedSchoolId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [expectedStudents, setExpectedStudents] = useState('');
  const [expectedTeachers, setExpectedTeachers] = useState('');
  const [notes, setNotes] = useState('');
  const [schoolIdCheck, setSchoolIdCheck] = useState<SchoolIdCheck | null>(null);
  const [result, setResult] = useState<RegistrationResponse | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cleanSchoolId = useMemo(
    () => requestedSchoolId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4),
    [requestedSchoolId],
  );

  async function checkSchoolId() {
    setMessage('');
    setResult(null);
    if (cleanSchoolId.length !== 4) {
      setMessage('Enter exactly 4 uppercase letters/numbers for school_id.');
      return;
    }
    try {
      const response = await webApi.checkSchoolId<SchoolIdCheck>(cleanSchoolId);
      setSchoolIdCheck(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to check school_id right now.');
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResult(null);

    try {
      const response = await webApi.registerSchool<RegistrationResponse>({
        schoolName,
        requestedSchoolId: cleanSchoolId,
        contactPerson,
        contactPhone,
        contactEmail,
        city,
        state,
        expectedStudents: expectedStudents ? Number(expectedStudents) : null,
        expectedTeachers: expectedTeachers ? Number(expectedTeachers) : null,
        notes,
      });
      setResult(response);
      setSchoolIdCheck(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'School registration could not be saved.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: 24 }}>
      <ShellStyles />
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">SCHOOL ONBOARDING</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Register School</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>
          Create the foundation for a new tenant-safe VidyaSetu school workspace. Final Excel data import remains disabled until the app structure is ready.
        </p>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>School Name<input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="BRK International School" required /></label>
          <label>Requested school_id<input value={requestedSchoolId} onChange={(e) => setRequestedSchoolId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))} placeholder="BRK1" maxLength={4} required /></label>
          <label>Contact Person<input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Principal/Admin name" required /></label>
          <label>Contact Phone<input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" required /></label>
          <label>Contact Email<input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="school@example.com" /></label>
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" /></label>
          <label>State<input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" /></label>
          <label>Expected Students<input type="number" value={expectedStudents} onChange={(e) => setExpectedStudents(e.target.value)} placeholder="600" min="0" /></label>
          <label>Expected Teachers<input type="number" value={expectedTeachers} onChange={(e) => setExpectedTeachers(e.target.value)} placeholder="50" min="0" /></label>
          <label className="form-grid--full">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pilot notes, contact timing, onboarding comments" rows={4} /></label>

          <div className="form-grid--full button-row">
            <button className="secondary-button" type="button" onClick={checkSchoolId}>Check school_id</button>
            <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Submit Registration'}</button>
            <Link className="secondary-button" href="/login">Back to Login</Link>
          </div>
        </form>

        {schoolIdCheck ? <div className="notice-card">{schoolIdCheck.schoolId}: {schoolIdCheck.message}</div> : null}
        {message ? <div className="notice-card">{message}</div> : null}
        {result ? <div className="notice-card">Reference {result.referenceId} • {result.message}<br />Next: {result.nextStep}</div> : null}
      </section>
    </main>
  );
}
