'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';

type PilotResponse = {
  referenceId: string;
  schoolName: string;
  status: string;
  message: string;
  nextStep: string;
};

export default function RequestPilotDemoPage() {
  const [schoolName, setSchoolName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [preferredRole, setPreferredRole] = useState('Principal');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [expectedStudents, setExpectedStudents] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<PilotResponse | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResult(null);

    try {
      const response = await webApi.requestPilotDemo<PilotResponse>({
        schoolName,
        contactPerson,
        contactPhone,
        contactEmail,
        preferredRole,
        city,
        state,
        expectedStudents: expectedStudents ? Number(expectedStudents) : null,
        notes,
      });
      setResult(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Pilot demo request could not be saved.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-dark" style={{ minHeight: '100vh', padding: 24 }}>
      <ShellStyles />
      <section className="premium-panel" style={{ position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto', borderRadius: 30, padding: 28 }}>
        <p className="eyebrow">PILOT DEMO</p>
        <h1 className="erp-page-title erp-school-name-title" style={{ margin: '8px 0' }}>Request Pilot Demo</h1>
        <p className="erp-workspace-subtitle erp-workspace-context-title" style={{ marginTop: 0 }}>
          Capture school interest before final onboarding. This keeps real school outreach separate from final Excel import and production activation.
        </p>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>School Name<input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School name" required /></label>
          <label>Contact Person<input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Principal/Admin name" required /></label>
          <label>Contact Phone<input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" required /></label>
          <label>Contact Email<input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="school@example.com" /></label>
          <label>Preferred Contact Role<select value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}><option>Principal</option><option>Admin</option><option>School Owner</option><option>Coordinator</option></select></label>
          <label>Expected Students<input type="number" value={expectedStudents} onChange={(e) => setExpectedStudents(e.target.value)} placeholder="1000" min="0" /></label>
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" /></label>
          <label>State<input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" /></label>
          <label className="form-grid--full">Demo Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Best time to contact, modules to show, pilot requirements" rows={4} /></label>

          <div className="form-grid--full button-row">
            <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Submit Pilot Demo Request'}</button>
            <Link className="secondary-button" href="/login">Back to Login</Link>
          </div>
        </form>

        {message ? <div className="notice-card">{message}</div> : null}
        {result ? <div className="notice-card">Reference {result.referenceId} • {result.message}<br />Next: {result.nextStep}</div> : null}
      </section>
    </main>
  );
}
