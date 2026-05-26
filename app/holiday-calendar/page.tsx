import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function HolidayCalendarPage() {
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
                        <input className="rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df]" placeholder="Holiday Date" />
                        <input className="rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df]" placeholder="Holiday Type" />
                        <input className="rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df]" placeholder="Applicable Classes" />
                        <button className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#08131f]">
                            Publish Holiday
                        </button>
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
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">15 August</td>
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">Full Day Holiday</td>
                                    <td className="px-4 py-4 text-sm text-[#f8f3df]">Whole School</td>
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