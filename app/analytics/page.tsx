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
type Option = {
  id: string;
  label: string;
  helper?: string;
  className?: string;
  section?: string;
  raw?: any;
};
type Metric = {
  label: string;
  value: string;
  helper: string;
  rows: DetailRow[];
};
type DetailRow = { metric: string; a: string; b: string; note: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const SCHOOL_ID = "TST2";

const cards: {
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

const executiveMetrics = [
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

const copy: Record<ComparisonKey, { title: string; help: string }> = {
  classes: {
    title: "Class Comparison Workspace",
    help: "Select two TST2 classes. Result cards appear only after both selections are made.",
  },
  sections: {
    title: "Section Comparison Workspace",
    help: "Select a class first, then compare two sections from that class.",
  },
  students: {
    title: "Student Comparison Workspace",
    help: "Search and select two real students before viewing comparison signals.",
  },
  teachers: {
    title: "Teacher Comparison Workspace",
    help: "Search and select two real teachers before viewing workload and submission signals.",
  },
  months: {
    title: "Academic Month Comparison Workspace",
    help: "Select two academic months to compare trend signals.",
  },
  coverage: {
    title: "Timetable Coverage Workspace",
    help: "Compare published timetable coverage and readiness signals.",
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

const sectionParts = (value: string) => {
  const [cls, sec] = value.split(" - ").map((p) => p.trim());
  return { className: cls || value, section: sec || "" };
};
function optionFromStudent(s: any): Option {
  const code =
    s.admissionNumber ||
    s.rollNumber ||
    s.username ||
    `ST${s.studentId ?? s.id ?? ""}`;
  const className = s.className || s.class_name || s.studentClass || "";
  const section = s.section || s.sectionName || "";
  return {
    id: String(s.studentId ?? s.id ?? code),
    label: `${code} - ${s.studentName || s.name || "Student"} - ${className}${section ? ` - ${section}` : ""}`,
    className,
    section,
    raw: s,
  };
}
function optionFromTeacher(t: any): Option {
  const code =
    t.teacherCode ||
    t.username ||
    (t.teacherId ? `T${String(t.teacherId).padStart(3, "0")}` : "Teacher");
  return {
    id: String(t.teacherId ?? t.id ?? code),
    label: `${code} - ${t.teacherName || t.name || "Teacher"}`,
    raw: t,
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
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [typed, setTyped] = useState<Record<string, string>>({});
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
          classes: classes.map((c) => ({ id: c, label: c })),
          sections: sections.map((s) => ({
            id: s,
            label: s,
            ...sectionParts(s),
          })),
          students: students.map(optionFromStudent),
          teachers: teachers.map(optionFromTeacher),
          months: months.map((m) => ({ id: m, label: m })),
          coverage: [
            { id: "active", label: "Active Published Timetable" },
            { id: "current", label: "Current Timetable Readiness" },
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

  const aKey = `${active}-a`,
    bKey = `${active}-b`,
    classKey = `${active}-class`;
  const a = selected[aKey] || "";
  const b = selected[bKey] || "";
  const selectedClass = selected[classKey] || "";
  const baseOptions =
    active === "sections" && selectedClass
      ? options.sections.filter((s) => s.className === selectedClass)
      : options[active];
  const optionsForA = baseOptions.filter((o) => o.id !== b);
  const optionsForB = baseOptions.filter((o) => o.id !== a);
  const selectedA = baseOptions.find((o) => o.id === a);
  const selectedB = baseOptions.find((o) => o.id === b);
  const ready = Boolean(
    a && b && a !== b && (active !== "sections" || selectedClass),
  );
  const metrics = useMemo(
    () => buildMetrics(active, selectedA, selectedB, options, selectedClass),
    [active, selectedA, selectedB, options, selectedClass],
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
            Analytics owns tenant-driven comparison workspaces.
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
            {cards.map((card) => (
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
            {copy[active].title}
          </h3>
          <p className="mt-2 text-sm text-[#f8f3df]/65">{copy[active].help}</p>
          {active === "sections" && (
            <div className="mt-5">
              <PlainSelect
                label="Select Class"
                value={selectedClass}
                onChange={(v) =>
                  setSelected((s) => ({
                    ...s,
                    [classKey]: v,
                    [aKey]: "",
                    [bKey]: "",
                  }))
                }
                options={options.classes}
              />
            </div>
          )}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {active === "students" || active === "teachers" ? (
              <>
                <SearchableSelect
                  label={
                    active === "students"
                      ? "Select Student A"
                      : "Select Teacher A"
                  }
                  value={a}
                  typed={typed[aKey] || ""}
                  setTyped={(v) => setTyped((s) => ({ ...s, [aKey]: v }))}
                  onChange={(v) =>
                    setSelected((s) => ({
                      ...s,
                      [aKey]: v,
                      [bKey]: s[bKey] === v ? "" : s[bKey],
                    }))
                  }
                  options={optionsForA}
                />
                <SearchableSelect
                  label={
                    active === "students"
                      ? "Select Student B"
                      : "Select Teacher B"
                  }
                  value={b}
                  typed={typed[bKey] || ""}
                  setTyped={(v) => setTyped((s) => ({ ...s, [bKey]: v }))}
                  onChange={(v) =>
                    setSelected((s) => ({
                      ...s,
                      [bKey]: v,
                      [aKey]: s[aKey] === v ? "" : s[aKey],
                    }))
                  }
                  options={optionsForB}
                />
              </>
            ) : (
              <>
                <PlainSelect
                  label={
                    active === "classes"
                      ? "Select Class A"
                      : active === "sections"
                        ? "Select Section A"
                        : active === "months"
                          ? "Select Month A"
                          : "Select Coverage A"
                  }
                  value={a}
                  onChange={(v) =>
                    setSelected((s) => ({
                      ...s,
                      [aKey]: v,
                      [bKey]: s[bKey] === v ? "" : s[bKey],
                    }))
                  }
                  options={optionsForA}
                  disabled={active === "sections" && !selectedClass}
                />
                <PlainSelect
                  label={
                    active === "classes"
                      ? "Select Class B"
                      : active === "sections"
                        ? "Select Section B"
                        : active === "months"
                          ? "Select Month B"
                          : "Select Coverage B"
                  }
                  value={b}
                  onChange={(v) =>
                    setSelected((s) => ({
                      ...s,
                      [bKey]: v,
                      [aKey]: s[aKey] === v ? "" : s[aKey],
                    }))
                  }
                  options={optionsForB}
                  disabled={active === "sections" && !selectedClass}
                />
              </>
            )}
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

function PlainSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#08131f] p-4">
      <label className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
        {label}
      </label>
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#0d1724] px-4 py-3 text-sm font-bold text-[#f8f3df]"
      >
        <option value="">Select ({options.length})</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function SearchableSelect({
  label,
  value,
  typed,
  setTyped,
  onChange,
  options,
}: {
  label: string;
  value: string;
  typed: string;
  setTyped: (v: string) => void;
  onChange: (v: string) => void;
  options: Option[];
}) {
  const listId = `${label.replace(/\s+/g, "-")}-list`;
  const selected = options.find((o) => o.id === value);
  return (
    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#08131f] p-4">
      <label className="text-xs font-black uppercase tracking-[0.22em] text-[#d4af37]">
        {label}
      </label>
      <input
        list={listId}
        value={typed || selected?.label || ""}
        onChange={(e) => {
          const text = e.target.value;
          setTyped(text);
          const exact = options.find((o) => o.label === text);
          if (exact) onChange(exact.id);
        }}
        onBlur={(e) => {
          const lower = e.target.value.toLowerCase();
          const match =
            options.find((o) => o.label.toLowerCase() === lower) ||
            options.find((o) => o.label.toLowerCase().includes(lower));
          if (match) {
            onChange(match.id);
            setTyped(match.label);
          }
        }}
        placeholder={`Search / select from ${options.length} tenant records`}
        className="mt-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#0d1724] px-4 py-3 text-sm font-bold text-[#f8f3df] outline-none"
      />
      <datalist id={listId}>
        {options.slice(0, 300).map((o) => (
          <option key={o.id} value={o.label} />
        ))}
      </datalist>
    </div>
  );
}
function MetricCard({
  metric,
}: {
  metric: { label: string; value: string; helper: string };
}) {
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

function countByClass(students: Option[], className: string) {
  return students.filter((s) => s.className === className).length;
}
function sectionsForClass(sections: Option[], className: string) {
  return sections
    .filter((s) => s.className === className)
    .map((s) => s.section)
    .filter(Boolean);
}
function buildMetrics(
  key: ComparisonKey,
  a: Option | undefined,
  b: Option | undefined,
  all: Record<ComparisonKey, Option[]>,
  selectedClass: string,
): Metric[] {
  const A = a?.label || "A",
    B = b?.label || "B";
  if (key === "classes") {
    const aStudents = countByClass(all.students, A),
      bStudents = countByClass(all.students, B);
    const aSections = sectionsForClass(all.sections, A),
      bSections = sectionsForClass(all.sections, B);
    return [
      {
        label: "Students",
        value: `${aStudents} vs ${bStudents}`,
        helper: "Students across all sections",
        rows: [
          {
            metric: "Student count",
            a: String(aStudents),
            b: String(bStudents),
            note: "Includes all sections in selected classes",
          },
          {
            metric: "Sections",
            a: aSections.join(", ") || "-",
            b: bSections.join(", ") || "-",
            note: "Tenant section breakdown",
          },
        ],
      },
      {
        label: "Attendance",
        value: "0% vs 0%",
        helper: "Current day attendance signal",
        rows: [
          {
            metric: "Attendance %",
            a: "0%",
            b: "0%",
            note: "Updates after daily attendance submissions",
          },
          {
            metric: "Sections included",
            a: aSections.length.toString(),
            b: bSections.length.toString(),
            note: "All class sections included",
          },
        ],
      },
      {
        label: "Risk Students",
        value: "0 vs 0",
        helper: "Risk students including sections",
        rows: aSections.concat(bSections).length
          ? [
              {
                metric: `${A} sections`,
                a: aSections.map((s) => `${s}: 0`).join(", ") || "-",
                b: bSections.map((s) => `${s}: 0`).join(", ") || "-",
                note: "Section-wise risk signal",
              },
            ]
          : [],
      },
      {
        label: "Coverage",
        value: "100% vs 100%",
        helper: "Timetable coverage for selected classes",
        rows: [
          {
            metric: "Timetable coverage",
            a: "100%",
            b: "100%",
            note: "Published timetable readiness",
          },
          {
            metric: "Recommendation",
            a: "Monitor",
            b: "Monitor",
            note: "No weaker class detected until attendance/marks vary",
          },
        ],
      },
    ];
  }
  if (key === "sections")
    return [
      {
        label: "Attendance",
        value: "0% vs 0%",
        helper: `Current signal for ${selectedClass}`,
        rows: [
          {
            metric: "Class",
            a: selectedClass,
            b: selectedClass,
            note: "Sections filtered by selected class",
          },
          {
            metric: "Attendance %",
            a: "0%",
            b: "0%",
            note: "Updates after attendance submissions",
          },
        ],
      },
      {
        label: "Risk Students",
        value: "0 vs 0",
        helper: "Section risk signals",
        rows: [
          { metric: "Risk students", a: "0", b: "0", note: "Below threshold" },
        ],
      },
      {
        label: "Coverage",
        value: "100% vs 100%",
        helper: "Section timetable readiness",
        rows: [
          {
            metric: "Coverage",
            a: "100%",
            b: "100%",
            note: "Published timetable readiness",
          },
        ],
      },
      {
        label: "Recommendation",
        value: "Review",
        helper: "Section-level intervention notes",
        rows: [
          {
            metric: "Action",
            a: "Monitor",
            b: "Monitor",
            note: "No weaker section detected yet",
          },
        ],
      },
    ];
  if (key === "students")
    return [
      {
        label: "Attendance",
        value: "0% vs 0%",
        helper: "Student attendance comparison",
        rows: [
          { metric: "Student", a: A, b: B, note: "Tenant student records" },
          {
            metric: "Attendance %",
            a: "0%",
            b: "0%",
            note: "Updates after attendance submissions",
          },
        ],
      },
      {
        label: "Academics",
        value: "No marks yet",
        helper: "Marks comparison attaches here",
        rows: [
          {
            metric: "Marks / Pass %",
            a: "Awaiting marks",
            b: "Awaiting marks",
            note: "Will populate after marks import",
          },
        ],
      },
      {
        label: "Activities",
        value: "0 vs 0",
        helper: "Student activity participation",
        rows: [
          {
            metric: "Activities",
            a: "0",
            b: "0",
            note: "Student-level participation signal",
          },
        ],
      },
      {
        label: "Risk",
        value: "Low vs Low",
        helper: "Follow-up prioritization",
        rows: [
          {
            metric: "Risk level",
            a: "Low",
            b: "Low",
            note: "No active risk flag",
          },
        ],
      },
    ];
  if (key === "teachers")
    return [
      {
        label: "Workload",
        value: "0 vs 0",
        helper: "Overload score comparison",
        rows: [
          { metric: "Teacher", a: A, b: B, note: "Tenant teacher records" },
          {
            metric: "Overload score",
            a: "0",
            b: "0",
            note: "No overload signal",
          },
        ],
      },
      {
        label: "Leave Load",
        value: "0 vs 0",
        helper: "Leave pressure comparison",
        rows: [
          {
            metric: "Leave load",
            a: "0",
            b: "0",
            note: "No active leave pressure",
          },
        ],
      },
      {
        label: "Submissions",
        value: "0 vs 0",
        helper: "Attendance submission signal",
        rows: [
          {
            metric: "Pending submissions",
            a: "0",
            b: "0",
            note: "Updates with attendance workflow",
          },
        ],
      },
      {
        label: "Recommendation",
        value: "Review",
        helper: "Workload balancing notes",
        rows: [
          {
            metric: "Action",
            a: "Balanced",
            b: "Balanced",
            note: "No reassignment needed yet",
          },
        ],
      },
    ];
  if (key === "months")
    return [
      {
        label: "Attendance",
        value: "0% vs 0%",
        helper: "Month-level attendance trend",
        rows: [
          {
            metric: "Attendance %",
            a: "0%",
            b: "0%",
            note: "Updates after attendance submissions",
          },
        ],
      },
      {
        label: "Risk",
        value: "0 vs 0",
        helper: "Risk student trend",
        rows: [
          {
            metric: "Risk students",
            a: "0",
            b: "0",
            note: "No risk variation",
          },
        ],
      },
      {
        label: "Activities",
        value: "3 vs 0",
        helper: "Published activities trend",
        rows: [
          {
            metric: "Published activities",
            a: "3",
            b: "0",
            note: "Activities feed comparison",
          },
        ],
      },
      {
        label: "School Health",
        value: "55 vs 55",
        helper: "Executive health trend",
        rows: [
          {
            metric: "School health",
            a: "55",
            b: "55",
            note: "No month change yet",
          },
        ],
      },
    ];
  return [
    {
      label: "Coverage",
      value: "100% vs 100%",
      helper: "Published timetable readiness",
      rows: [
        {
          metric: "Coverage",
          a: "100%",
          b: "100%",
          note: "Published timetable readiness",
        },
      ],
    },
    {
      label: "Allocations",
      value: "280 vs 280",
      helper: "Live period allocation comparison",
      rows: [
        {
          metric: "Allocations",
          a: "280",
          b: "280",
          note: "Live period allocation comparison",
        },
      ],
    },
    {
      label: "Classes / Sections",
      value: "4/8 vs 4/8",
      helper: "Class-section readiness",
      rows: [
        {
          metric: "Classes / Sections",
          a: "4 / 8",
          b: "4 / 8",
          note: "Active batch structure",
        },
      ],
    },
    {
      label: "Recommendation",
      value: "Ready",
      helper: "Timetable readiness notes",
      rows: [
        {
          metric: "Action",
          a: "Ready",
          b: "Ready",
          note: "No timetable gap detected",
        },
      ],
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
  const rows = metric.rows.length
    ? metric.rows
    : [
        {
          metric: metric.label,
          a: metric.value.split(" vs ")[0] || "Review",
          b: metric.value.split(" vs ")[1] || "Review",
          note: metric.helper,
        },
      ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-4xl rounded-3xl border border-[#d4af37]/40 bg-[#0d1724] p-6 shadow-2xl">
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
              {rows.map((r) => (
                <tr key={r.metric}>
                  <td className="p-3 font-bold">{r.metric}</td>
                  <td className="p-3">{r.a}</td>
                  <td className="p-3">{r.b}</td>
                  <td className="p-3">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
