import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

type Metric = {
    label: string;
    value: string;
    helper: string;
};

type AnalyticsSection = {
    eyebrow: string;
    title: string;
    description: string;
    metrics: Metric[];
};

type ComparisonCard = {
    title: string;
    subtitle: string;
    signal: string;
    action: string;
};

const executiveMetrics: Metric[] = [
    { label: 'School Health', value: '55', helper: 'Needs Principal Review' },
    { label: 'Attendance', value: '0%', helper: 'Whole-school current day signal' },
    { label: 'Coverage', value: '100%', helper: 'Active timetable readiness' },
    { label: 'Risk Students', value: '0', helper: 'Below safe threshold' },
    { label: 'Teachers', value: '15', helper: 'Teacher records from active tenant' },
    { label: 'Students', value: '240', helper: 'Student records from active tenant' },
];

const comparisonCards: ComparisonCard[] = [
    {
        title: 'Compare Classes',
        subtitle: 'Class-wise attendance, risk and coverage review.',
        signal: '4 active classes',
        action: 'Use for class ranking and weak-area review',
    },
    {
        title: 'Compare Sections',
        subtitle: 'Section-wise signals across attendance and timetable coverage.',
        signal: '8 active sections',
        action: 'Use for section-level intervention planning',
    },
    {
        title: 'Compare Students',
        subtitle: 'Student attendance, risk and follow-up prioritization.',
        signal: '240 active students',
        action: 'Use after daily attendance submissions',
    },
    {
        title: 'Compare Teachers',
        subtitle: 'Teacher workload, leave pressure and replacement load.',
        signal: '15 active teachers',
        action: 'Use for workload balancing decisions',
    },
    {
        title: 'Compare Academic Months',
        subtitle: 'Month-over-month operational progress and trend review.',
        signal: '2026-05 active month',
        action: 'Use for principal monthly review',
    },
    {
        title: 'Compare Timetable Coverage',
        subtitle: 'Coverage, allocation and class-section readiness comparison.',
        signal: '280 live allocations',
        action: 'Use for published timetable quality checks',
    },
];

const sections: AnalyticsSection[] = [
    {
        eyebrow: 'ATTENDANCE ANALYTICS',
        title: 'Attendance and class comparison',
        description: 'Comparison views stay here, not in School Intelligence. Attendance trend cards appear only after daily attendance is submitted.',
        metrics: [
            { label: 'Attendance', value: '0%', helper: 'Whole-school current day signal' },
            { label: 'Class Risk', value: '0', helper: 'Classes below 75%' },
            { label: 'Follow-ups', value: '1', helper: 'Pending attendance submission' },
        ],
    },
    {
        eyebrow: 'RISK ANALYTICS',
        title: 'Student risk and critical alerts',
        description: 'Student, class and section risk indicators for Principal/Admin follow-up decisions.',
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
        description: 'Teacher comparison belongs here: leave load, daily overload, replacement pressure, fatigue and workload balance.',
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
        description: 'Coverage, allocation and class-section readiness analytics from the active published timetable.',
        metrics: [
            { label: 'Timetable', value: 'LIVE', helper: '280 period allocations' },
            { label: 'Coverage', value: '100%', helper: 'Active published timetable' },
            { label: 'Classes', value: '4', helper: 'Detected in active batch' },
            { label: 'Sections', value: '8', helper: 'Detected in active batch' },
        ],
    },
    {
        eyebrow: 'COMMUNICATION ANALYTICS',
        title: 'Activities and approvals',
        description: 'Only active communication signals are shown. Notice and engagement cards appear after real data exists.',
        metrics: [
            { label: 'Activities', value: '3', helper: 'Published in feed' },
            { label: 'Approvals', value: '0', helper: 'Pending approval queue' },
        ],
    },
];

const decisionRows = [
    { area: 'Attendance', signal: 'Awaiting daily submissions', action: 'Open Attendance Reports' },
    { area: 'Class comparison', signal: '4 classes and 8 sections available', action: 'Use comparison cards for class and section review' },
    { area: 'Student comparison', signal: '240 active students available', action: 'Review student risk after attendance submissions' },
    { area: 'Teacher comparison', signal: '15 active teachers available', action: 'Monitor leave, workload and replacement load' },
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
                                School Intelligence remains the live command center. Operational Analytics owns comparison views for classes, sections, students, teachers, academic months, timetable coverage and communication signals.
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

                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Comparison Center</p>
                    <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">School comparison drilldowns</h3>
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-[#f8f3df]/65">
                        All class, student, teacher, section, month and school-level comparisons live here. Empty placeholder cards are hidden until real data is available.
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {comparisonCards.map((card) => (
                            <ComparisonCard key={card.title} card={card} />
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
            <p className="mt-4 text-3xl font-black text-[#fff8de]">{metric.value}</p>
            <p className="mt-3 text-sm font-semibold leading-5 text-[#f8f3df]/68">{metric.helper}</p>
        </div>
    );
}

function ComparisonCard({ card }: { card: ComparisonCard }) {
    return (
        <div className="flex min-h-[190px] flex-col rounded-3xl border border-[#d4af37]/25 bg-[#08131f] p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">Compare</p>
                    <h4 className="mt-3 text-2xl font-black text-[#fff8de]">{card.title}</h4>
                </div>
                <span className="rounded-full bg-[#123a63] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#fff8de]">Drilldown</span>
            </div>
            <p className="mt-4 text-sm font-semibold leading-5 text-[#f8f3df]/70">{card.subtitle}</p>
            <div className="mt-auto pt-5">
                <p className="text-sm font-black text-[#f8f3df]">{card.signal}</p>
                <p className="mt-1 text-sm font-semibold text-[#d4af37]">{card.action}</p>
            </div>
        </div>
    );
}
