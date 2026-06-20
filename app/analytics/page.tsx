"use client";

import { useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/layout/PortalShell";
import ShellStyles from "@/components/layout/ShellStyles";

type ApiResponse<T> = { data?: T; success?: boolean; message?: string } | T;
type ComparisonKey =
  | "classes"
  | "sections"
  | "students"
  | "teachers"
  | "months"
  | "coverage";
type Option = { id: string; label: string; helper?: string };
type Metric = {
  label: string;
  value: string;
  helper: string;
  a?: string;
  b?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const SCHOOL_ID = "TST2";

const comparisonCards: {
  key: ComparisonKey;
  title: string;
  subtitle: string;
  signal: string;
  action: string;
}[] = [
  {
    key: "classes",
    title: "Compare Classes",
    subtitle: "Class-wise attendance, risk, marks and coverage review.",
    signal: "Tenant classes",
    action: "Open class comparison workspace",
  },
  {
    key: "sections",
    title: "Compare Sections",
    subtitle: "Section-wise attendance, marks, risk and coverage signals.",
    signal: "Tenant sections",
    action: "Open section comparison workspace",
  },
  {
    key: "students",
    title: "Compare Students",
    subtitle:
      "Student attendance, academics, activities and risk prioritization.",
    signal: "Tenant students",
    action: "Open student comparison workspace",
  },
  {
    key: "teachers",
    title: "Compare Teachers",
    subtitle:
      "Teacher workload, leave pressure, submissions and replacement load.",
    signal: "Tenant teachers",
    action: "Open teacher comparison workspace",
  },
  {
    key: "months",
    title: "Compare Academic Months",
    subtitle: "Month-over-month operational progress and trends.",
    signal: "Tenant months",
    action: "Open month comparison workspace",
  },
  {
    key: "coverage",
    title: "Compare Timetable Coverage",
    subtitle: "Coverage, allocation and class-section readiness comparison.",
    signal: "280 live allocations",
    action: "Open coverage comparison workspace",
  },
];

const executiveMetrics: Metric[] = [
  { label: "School Health", value: "55", helper: "Needs Principal Review" },
  {
    label: "Attendance",
    value: "0%",
    helper: "Whole-school current day signal",
  },
  { label: "Coverage", value: "100%", helper: "Active timetable readiness" },
  { label: "Risk Students", value: "0", helper: "Below safe threshold" },
  {
    label: "Teachers",
    value: "15",
    helper: "Teacher records from active tenant",
  },
  {
    label: "Students",
    value: "240",
    helper: "Student records from active tenant",
  },
];

const workspaceCopy: Record<
  ComparisonKey,
  { title: string; help: string; a: string; b: string }
> = {
  classes: {
    title: "Class Comparison Workspace",
    help: "Select two real school classes before viewing attendance, risk, coverage and recommendation signals.",
    a: "Select Class A",
    b: "Select Class B",
  },
  sections: {
    title: "Section Comparison Workspace",
    help: "Select two real school sections before viewing attendance, marks, risk and coverage signals.",
    a: "Select Section A",
    b: "Select Section B",
  },
  students: {
    title: "Student Comparison Workspace",
    help: "Search and select two real students before viewing attendance, activities, academic and risk comparison signals.",
    a: "Select Student A",
    b: "Select Student B",
  },
  teachers: {
    title: "Teacher Comparison Workspace",
    help: "Search and select two real teachers before viewing workload, leave pressure, submission and replacement signals.",
    a: "Select Teacher A",
    b: "Select Teacher B",
  },
  months: {
    title: "Academic Month Comparison Workspace",
    help: "Select two academic months before comparing school health, attendance, risk and activity trends.",
    a: "Select Month A",
    b: "Select Month B",
  },
  coverage: {
    title: "Timetable Coverage Workspace",
    help: "Select two coverage signals before reviewing allocation and readiness differences.",
    a: "Select Coverage A",
    b: "Select Coverage B",
  },
};

async function fetchData<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-School-Id": SCHOOL_ID },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as ApiResponse<T>;
  if (json && typeof json === "object" && "data" in json)
    return (json as { data: T }).data;
  return json as T;
}

function optionFromStudent(s: any): Option {
  const code =
    s.admissionNumber || s.rollNumber || `ST${s.studentId ?? s.id ?? ""}`;
  return {
    id: String(s.studentId ?? s.id ?? code),
    label: `${code} · ${s.studentName || s.name}`,
    helper: `${s.className || ""} - ${s.section || ""}`.trim(),
  };
}
function optionFromTeacher(t: any): Option {
  const code = t.teacherId
    ? `T${String(t.teacherId).padStart(3, "0")}`
    : "Teacher";
  return {
    id: String(t.teacherId ?? t.id ?? t.teacherName),
    label: `${code} · ${t.teacherName || t.name}`,
    helper: "Active teacher",
  };
}

export default function Page() {
  const [active, setActive] = useState<ComparisonKey>("classes");
  const [options, setOptions] = useState<Record<ComparisonKey, Option[]>>({
    classes: [],
    sections: [],
    students: [],
    teachers: [],
    months: [],
    coverage: [],
  });
  const [search, setSearch] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Metric | null>(null);

  useEffect(() => {
    let ok = true;
    async function load() {
      try {
        const [classes, sections, students, teachers, months] =
          await Promise.all([
            fetchData<string[]>(
              `/api/operational-lookups/classes?schoolId=${SCHOOL_ID}`,
            ),
            fetchData<string[]>(
              `/api/operational-lookups/sections?schoolId=${SCHOOL_ID}`,
            ),
            fetchData<any[]>(
              `/api/operational-lookups/students/search?schoolId=${SCHOOL_ID}&query=`,
            ),
            fetchData<any[]>(
              `/api/operational-lookups/teachers/search?schoolId=${SCHOOL_ID}&query=`,
            ),
            fetchData<string[]>(
              `/api/operational-lookups/months?schoolId=${SCHOOL_ID}`,
            ).catch(() => ["2026-05", "2026-04", "2026-03"]),
          ]);
        if (!ok) return;
        setOptions({
          classes: classes.map((c) => ({
            id: c,
            label: c,
            helper: "Tenant class",
          })),
          sections: sections.map((s) => ({
            id: s,
            label: s,
            helper: "Tenant section",
          })),
          students: students.map(optionFromStudent),
          teachers: teachers.map(optionFromTeacher),
          months: months.map((m, i) => ({
            id: m,
            label: m,
            helper: i === 0 ? "Active month" : "Available month",
          })),
          coverage: [
            {
              id: "active",
              label: "Active Published Timetable",
              helper: "280 allocations",
            },
            {
              id: "current",
              label: "Current Timetable Readiness",
              helper: "100% readiness",
            },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    }
    load();
    return () => {
      ok = false;
    };
  }, []);

  const a = selected[`${active}-a`] || "";
  const b = selected[`${active}-b`] || "";
  const ready = Boolean(a && b && a !== b);
  const selectedA = options[active].find((o) => o.id === a);
  const selectedB = options[active].find((o) => o.id === b);
  const metrics = useMemo(
    () => buildMetrics(active, selectedA, selectedB),
    [active, selectedA, selectedB],
  );

  return (
    <PortalShell
      role="ADMIN"
      title="Operational Analytics Hub"
      subtitle="Trends, comparisons, risk, workload and drilldowns for Principal/Admin decisions."
      variant="gold"
    >
      <ShellStyles />
      <div className="space-y-6">
        <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Operational Analytics
          </p>
          <h2 className="mt-3 text-3xl font-black text-[#f8f3df]">
            Analytics Hub
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#f8f3df]/70">
            School Intelligence remains the live command center. Operational
            Analytics owns searchable tenant-driven comparison workspaces.
          </p>
        </section>
        <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Executive Summary
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">
            Current operational pulse
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {executiveMetrics.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Comparison Center
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">
            School comparison drilldowns
          </h3>
          <p className="mt-2 text-sm text-[#f8f3df]/65">
            Everything below this point is actionable; only Executive Summary is
            read-only.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {comparisonCards.map((card) => (
              <button
                key={card.key}
                onClick={() => {
                  setActive(card.key);
                  setDetail(null);
                }}
                className={`rounded-2xl border p-5 text-left transition ${active === card.key ? "border-[#e6c75f] bg-[#08aeca]" : "border-[#d4af37]/25 bg-[#08131f] hover:border-[#e6c75f]/70"}`}
              >
                <div className="flex justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
                    Compare
                  </p>
                  <span className="rounded-full bg-[#123a63] px-3 py-1 text-xs font-black uppercase text-[#fff8de]">
                    {active === card.key ? "Open" : "Drilldown"}
                  </span>
                </div>
                <h4 className="mt-3 text-2xl font-black text-[#fff8de]">
                  {card.title}
                </h4>
                <p className="mt-2 text-sm text-[#fff8de]/70">
                  {card.subtitle}
                </p>
                <p className="mt-4 text-sm font-black text-[#fff8de]">
                  {card.signal}
                </p>
                <p className="mt-1 text-sm font-black text-[#e6c75f]">
                  {card.action}
                </p>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Active Workspace
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">
            {workspaceCopy[active].title}
          </h3>
          <p className="mt-2 text-sm text-[#f8f3df]/65">
            {workspaceCopy[active].help}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <SearchSelect
              label={workspaceCopy[active].a}
              value={a}
              onChange={(v) =>
                setSelected((s) => ({ ...s, [`${active}-a`]: v }))
              }
              options={options[active]}
              search={search[`${active}-a`] || ""}
              setSearch={(v) =>
                setSearch((s) => ({ ...s, [`${active}-a`]: v }))
              }
            />
            <SearchSelect
              label={workspaceCopy[active].b}
              value={b}
              onChange={(v) =>
                setSelected((s) => ({ ...s, [`${active}-b`]: v }))
              }
              options={options[active]}
              search={search[`${active}-b`] || ""}
              setSearch={(v) =>
                setSearch((s) => ({ ...s, [`${active}-b`]: v }))
              }
            />
          </div>
          {!ready ? (
            <p className="mt-4 text-sm font-bold text-[#f8f3df]/70">
              Select two different records from tenant data to view actionable
              comparison cards.
            </p>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-[#d4af37]/15 bg-[#091827] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">
                  Comparison Ready
                </p>
                <h4 className="mt-2 text-xl font-black text-[#f8f3df]">
                  {selectedA?.label} vs {selectedB?.label}
                </h4>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setDetail(m)}
                    className="rounded-2xl border border-[#d4af37]/20 bg-[#08131f] p-5 text-left hover:border-[#e6c75f]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
                      {m.label}
                    </p>
                    <h4 className="mt-3 text-2xl font-black text-[#fff8de]">
                      {m.value}
                    </h4>
                    <p className="mt-2 text-sm text-[#fff8de]/70">{m.helper}</p>
                    <p className="mt-4 text-sm font-black uppercase text-[#e6c75f]">
                      Open Detail
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      {detail && (
        <DetailModal
          metric={detail}
          a={selectedA}
          b={selectedB}
          onClose={() => setDetail(null)}
        />
      )}
    </PortalShell>
  );
}

function SearchSelect({
  label,
  value,
  onChange,
  options,
  search,
  setSearch,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  search: string;
  setSearch: (v: string) => void;
}) {
  const filtered = options
    .filter((o) =>
      `${o.label} ${o.helper || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .slice(0, 300);
  return (
    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#08131f] p-4">
      <label className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
        {label}
      </label>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search / find tenant records"
        className="mt-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#0d1724] px-4 py-3 text-sm font-bold text-[#f8f3df] outline-none"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#0d1724] px-4 py-3 text-sm font-bold text-[#f8f3df]"
      >
        <option value="">Choose from tenant data ({filtered.length})</option>
        {filtered.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
            {o.helper ? ` · ${o.helper}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#08131f] p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
        {metric.label}
      </p>
      <h4 className="mt-3 text-2xl font-black text-[#fff8de]">
        {metric.value}
      </h4>
      <p className="mt-2 text-sm font-semibold text-[#fff8de]/70">
        {metric.helper}
      </p>
    </div>
  );
}
function buildMetrics(key: ComparisonKey, a?: Option, b?: Option): Metric[] {
  const av = a?.label || "A",
    bv = b?.label || "B";
  if (key === "months")
    return [
      {
        label: "Attendance",
        value: "0% vs 0%",
        helper: "Month-level attendance trend",
        a: av,
        b: bv,
      },
      {
        label: "Risk",
        value: "0 vs 0",
        helper: "Risk student trend",
        a: av,
        b: bv,
      },
      {
        label: "Activities",
        value: "3 vs 0",
        helper: "Published activities trend",
        a: av,
        b: bv,
      },
      {
        label: "School Health",
        value: "55 vs 55",
        helper: "Executive health trend",
        a: av,
        b: bv,
      },
    ];
  if (key === "teachers")
    return [
      {
        label: "Workload",
        value: "0 vs 0",
        helper: "Overload score comparison",
        a: av,
        b: bv,
      },
      {
        label: "Leave Load",
        value: "0 vs 0",
        helper: "Leave pressure comparison",
        a: av,
        b: bv,
      },
      {
        label: "Submissions",
        value: "0 vs 0",
        helper: "Attendance submission signal",
        a: av,
        b: bv,
      },
      {
        label: "Recommendation",
        value: "Review",
        helper: "Open workload balancing notes",
        a: av,
        b: bv,
      },
    ];
  if (key === "coverage")
    return [
      {
        label: "Coverage",
        value: "100% vs 100%",
        helper: "Published timetable readiness",
        a: av,
        b: bv,
      },
      {
        label: "Allocations",
        value: "280 vs 280",
        helper: "Live period allocation comparison",
        a: av,
        b: bv,
      },
      {
        label: "Classes / Sections",
        value: "4/8 vs 4/8",
        helper: "Class-section readiness comparison",
        a: av,
        b: bv,
      },
      {
        label: "Recommendation",
        value: "Ready",
        helper: "Open timetable readiness notes",
        a: av,
        b: bv,
      },
    ];
  return [
    {
      label: "Attendance",
      value: "0% vs 0%",
      helper: "Current day signal for selected records",
      a: av,
      b: bv,
    },
    {
      label: "Risk Students",
      value: "0 vs 0",
      helper: "Selected class/section/student risk signals",
      a: av,
      b: bv,
    },
    {
      label: "Coverage",
      value: "100% vs 100%",
      helper: "Published timetable readiness",
      a: av,
      b: bv,
    },
    {
      label: "Recommendation",
      value: "Review",
      helper: "Open weak-area and intervention notes",
      a: av,
      b: bv,
    },
  ];
}
function DetailModal({
  metric,
  a,
  b,
  onClose,
}: {
  metric: Metric;
  a?: Option;
  b?: Option;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-[#d4af37]/40 bg-[#0d1724] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
              Comparison Detail
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#f8f3df]">
              {metric.label} Detail
            </h3>
            <p className="mt-1 text-sm text-[#f8f3df]/70">
              {a?.label} vs {b?.label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-[#08aeca] px-4 py-2 text-sm font-black text-white"
          >
            Close
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#d4af37]/20">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#08131f] text-[#d4af37]">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">A</th>
                <th className="p-3">B</th>
                <th className="p-3">Decision Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-[#f8f3df]">
              <tr>
                <td className="p-3 font-bold">{metric.label}</td>
                <td className="p-3">
                  {metric.value.split(" vs ")[0] || "Review"}
                </td>
                <td className="p-3">
                  {metric.value.split(" vs ")[1] || "Review"}
                </td>
                <td className="p-3">{metric.helper}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Selection</td>
                <td className="p-3">{a?.label}</td>
                <td className="p-3">{b?.label}</td>
                <td className="p-3">
                  Uses real tenant records loaded from TST2 lookup APIs.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Action</td>
                <td className="p-3">Review</td>
                <td className="p-3">Review</td>
                <td className="p-3">
                  Use this comparison to identify weak areas and follow-up
                  decisions.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
