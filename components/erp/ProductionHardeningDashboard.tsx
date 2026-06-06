type OperationCard = {
    title: string;
    status: string;
    helper: string;
};

const operationCards: OperationCard[] = [
    { title: 'Authentication Status', status: 'Protected', helper: 'Login, role access, and session validation are active for school users.' },
    { title: 'Tenant Isolation Status', status: 'Protected', helper: 'School data remains scoped to the active school_id across workspace workflows.' },
    { title: 'Import Validation Status', status: 'Operational', helper: 'Workbook validation checks sheets, relationships, and school_id before commit.' },
    { title: 'Workbook Commit Status', status: 'Gated', helper: 'Commit remains locked until workbook validation is clear or accepted with warnings.' },
    { title: 'Timetable Publish Status', status: 'Controlled', helper: 'Published timetable visibility is handled through the timetable operations flow.' },
    { title: 'Notification Status', status: 'Available', helper: 'Notices and activation updates are prepared for school communication workflows.' },
    { title: 'Attendance Services Status', status: 'Available', helper: 'Daily attendance, reports, and teacher submission workflows are available.' },
    { title: 'Backup Status', status: 'Monitored', helper: 'Workbook history and commit audit trail preserve operational recovery context.' },
    { title: 'Workspace Health Status', status: 'Available', helper: 'Activation readiness, lifecycle status, and latest history are visible in Workspace Health.' },
];

export default function ProductionHardeningDashboard() {
    return (
        <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">System Operations Center</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">School operations status</h2>
                    <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-700">
                        Review the core operational services required before and after workspace activation. This page shows only school-facing readiness signals and avoids duplicate workflow controls.
                    </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Operational Review</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {operationCards.map((card) => (
                    <article key={card.title} className="rounded-2xl border border-amber-100/70 bg-white/85 p-5 shadow-sm shadow-amber-900/5">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-black text-slate-950">{card.title}</h3>
                            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-800">{card.status}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{card.helper}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
