import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

type Metric = {
    label: string;
    value: string;
    helper: string;
    tone?: 'dark' | 'light';
};

type AnalyticsSection = {
    eyebrow: string;
    title: string;
    description: string;
    metrics: Metric[];
};

const executiveMetrics: Metric[] = [
    { label: 'School Health', value: '55', helper: 'Needs Principal Review', tone: 'dark' },
    { label: 'Attendance', value: '0%', helper: 'Whole-school current day signal', tone: 'dark' },
    { label: 'Coverage', value: '100%', helper: 'Active timetable readiness', tone: 'dark' },
    { label: 'Risk Students', value: '0', helper: 'Below safe threshold', tone: 'dark' },
    { label: 'Teachers', value: '15', helper: 'Teacher records from active tenant', tone: 'dark' },
    { label: 'Students', value: '240', helper: 'Student records from active tenant', tone: 'dark' },
];

const sections: AnalyticsSection[] = [
    {
        eyebrow: 'ATTENDANCE ANALYTICS',
        title: 'Attendance trends and class comparison',
        description: 'Daily, monthly, class-wise, and section-wise attendance analytics. These are trend-oriented views moved out of School Intelligence.',
        metrics: [
            { label: 'Monthly Trend', value: 'No data', helper: 'Appears after daily attendance submissions' },
            { label: 'Top Class', value: 'No data', helper: 'Attendance rank' },
            { label: 'Weak Section', value: 'No data', helper: 'Needs support' },
            { label: 'Class Risk', value: '0', helper: 'Classes below 75%' },
        ],
    },
    {
        eyebrow: 'RISK ANALYTICS',
        title: 'Student risk and critical alerts',
        description: 'Risk students, class risk, high-priority alerts, and follow-up signals for Principal/Admin decisions.',
        metrics: [
            { label: 'Risk Students', value: '0', helper: 'Below safe threshold' },
            { label: 'Critical Alerts', value: '0', helper: 'High priority' },
            { label: 'Academic Insights', value: '0', helper: 'Priority decisions' },
            { label: 'Follow-ups', value: '1', helper: 'Pending attendance submission' },
        ],
    },
    {
        eyebrow: 'TEACHER ANALYTICS',
        title: 'Workload, fatigue and replacement stress',
        description: 'Teacher leave load, daily overload, fatigue alerts, replacement stress, and workload ranking.',
        metrics: [
            { label: 'Teacher Leave Load', value: '0', helper: 'Needs attention' },
            { label: 'Daily Overload', value: '0', helper: 'Teachers ≥ 80 score' },
            { label: 'Fatigue Alerts', value: '0', helper: 'Today workload watch' },
            { label: 'Replacement Stress', value: '0', helper: 'Index 0' },
        ],
    },
    {
        eyebrow: 'TIMETABLE ANALYTICS',
        title: 'Timetable coverage and readiness',
        description: 'Published timetable health, coverage quality, replacement pressure, and utilization signals.',
        metrics: [
            { label: 'Timetable', value: 'LIVE', helper: '280 period allocations' },
            { label: 'Coverage', value: '100%', helper: 'Active published timetable' },
            { label: 'Classes', value: '4', helper: 'Detected in active batch' },
            { label: 'Sections', value: '8', helper: 'Detected in active batch' },
        ],
    },
    {
        eyebrow: 'COMMUNICATION ANALYTICS',
        title: 'Activities, approvals and notices',
        description: 'Published activities, approval backlog, notices, and future parent engagement metrics.',
        metrics: [
            { label: 'Activities', value: '3', helper: 'Published in feed' },
            { label: 'Approvals', value: '0', helper: 'Pending approval queue' },
            { label: 'Notices', value: 'No data', helper: 'Appears after notices are published' },
            { label: 'Engagement', value: 'Future', helper: 'Parent engagement metrics' },
        ],
    },
];

const decisionRows = [
    { area: 'Attendance', signal: 'Awaiting daily submissions', action: 'Open Attendance Reports' },
    { area: 'Risk', signal: 'No students below safe threshold', action: 'Review risk drilldown after real attendance data' },
    { area: 'Teacher workload', signal: 'No fatigue alerts', action: 'Monitor leave and replacement load' },
    { area: 'Timetable', signal: '280 active period allocations', action: 'Use Active Published Timetable' },
    { area: 'Communication', signal: '3 published activities, 0 pending approvals', action: 'Continue approval queue review' },
];

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Operational Analytics Hub" subtitle="Trends, comparisons, risk, workload and drilldowns for Principal/Admin decisions." variant="gold">
            <ShellStyles />
            <div className="space-y-6">
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6 shadow-2xl shadow-black/20">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Operational Analytics</p>
                            <h2 className="mt-3 text-3xl font-black text-[#f8f3df]">Analytics Hub</h2>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-[#f8f3df]/70">
                                School Intelligence stays focused on the live command center. This page holds trend-based analytics, class comparison, risk, teacher workload, timetable coverage, and communication drilldowns.
                            </p>
                        </div>
                        <span className="inline-flex rounded-full bg-[#123a63] px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#fff8de]">Live</span>
                    </div>
                </section>

                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Executive Summary</p>
                            <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">Current operational pulse</h3>
                        </div>
                        <p className="text-sm font-semibold text-[#f8f3df]/60">TST2 validation tenant · 2026-05 academic month</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {executiveMetrics.map((metric) => (
                            <MetricCard key={metric.label} metric={metric} />
                        ))}
                    </div>
                </section>

                {sections.map((section) => (
                    <section key={section.title} className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">{section.eyebrow}</p>
                        <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">{section.title}</h3>
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#f8f3df]/65">{section.description}</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {section.metrics.map((metric) => (
                                <MetricCard key={`${section.title}-${metric.label}`} metric={metric} />
                            ))}
                        </div>
                    </section>
                ))}

                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Decision Table</p>
                    <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">Principal/Admin analytics actions</h3>
                    <div className="mt-5 overflow-hidden rounded-2xl border border-[#d4af37]/15">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#08131f] text-[#d4af37]">
                                <tr>
                                    <th className="px-4 py-3 font-black uppercase tracking-[0.18em]">Area</th>
                                    <th className="px-4 py-3 font-black uppercase tracking-[0.18em]">Signal</th>
                                    <th className="px-4 py-3 font-black uppercase tracking-[0.18em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#d4af37]/10 text-[#f8f3df]/78">
                                {decisionRows.map((row) => (
                                    <tr key={row.area}>
                                        <td className="px-4 py-4 font-black text-[#f8f3df]">{row.area}</td>
                                        <td className="px-4 py-4 font-semibold">{row.signal}</td>
                                        <td className="px-4 py-4 font-semibold">{row.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </PortalShell>
    );
}

function MetricCard({ metric }: { metric: Metric }) {
    return (
        <div className="rounded-3xl border border-[#d4af37]/15 bg-[#08131f] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">{metric.label}</p>
            <p className="mt-4 text-4xl font-black text-[#fff8de]">{metric.value}</p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#f8f3df]/65">{metric.helper}</p>
        </div>
    );
}
