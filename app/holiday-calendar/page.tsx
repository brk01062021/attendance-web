'use client';

import { useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const fieldClass =
    'w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm font-semibold text-[#f8f3df] outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15';

const dateFieldClass = `${fieldClass} [color-scheme:dark]`;

function formatHolidayDate(value: string) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

export default function HolidayCalendarPage() {
    const [holidayDate, setHolidayDate] = useState('2026-08-15');
    const [holidayType, setHolidayType] = useState('Full Day Holiday');
    const [applicableClasses, setApplicableClasses] = useState('Whole School');

    return (
        <PortalShell
            role="ADMIN"
            title="Holiday Calendar"
            subtitle="Academic calendar overrides, holiday publishing, attendance locks, and timetable visibility."
            variant="gold"
        >
            <ShellStyles />

            <div className="space-y-6">
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="grid gap-4 lg:grid-cols-4">
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-[#d4af37]/70">
                                Holiday Date
                            </span>
                            <input
                                type="date"
                                value={holidayDate}
                                onChange={(event) => setHolidayDate(event.target.value)}
                                className={dateFieldClass}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-[#d4af37]/70">
                                Holiday Type
                            </span>
                            <select
                                value={holidayType}
                                onChange={(event) => setHolidayType(event.target.value)}
                                className={fieldClass}
                            >
                                <option>Full Day Holiday</option>
                                <option>Half Day Holiday</option>
                                <option>Exam Holiday</option>
                                <option>Festival Holiday</option>
                                <option>Emergency Closure</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-[#d4af37]/70">
                                Applicable Classes
                            </span>
                            <select
                                value={applicableClasses}
                                onChange={(event) => setApplicableClasses(event.target.value)}
                                className={fieldClass}
                            >
                                <option>Whole School</option>
                                <option>Primary Classes 1-5</option>
                                <option>Middle Classes 6-8</option>
                                <option>High School 9-10</option>
                                <option>Selected Class/Section</option>
                            </select>
                        </label>

                        <div className="flex items-end">
                            <button className="w-full rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#08131f]">
                                Publish Holiday
                            </button>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#d4af37]/10">
                                    <th className="px-4 py-3 text-left text-xs tracking-[0.18em] text-[#d4af37]/70">DATE</th>
                                    <th className="px-4 py-3 text-left text-xs tracking-[0.18em] text-[#d4af37]/70">TYPE</th>
                                    <th className="px-4 py-3 text-left text-xs tracking-[0.18em] text-[#d4af37]/70">SCOPE</th>
                                    <th className="px-4 py-3 text-left text-xs tracking-[0.18em] text-[#d4af37]/70">STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">{formatHolidayDate(holidayDate)}</td>
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">{holidayType}</td>
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">{applicableClasses}</td>
                                    <td className="px-4 py-4 text-sm text-[#79d991]">Published</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </PortalShell>
    );
}
