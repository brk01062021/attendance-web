
import ERPDatePicker from "../controls/ERPDatePicker";
import ERPSelect from "../controls/ERPSelect";
import ImportSummaryDashboard from "./ImportSummaryDashboard";
import UploadHistoryTable from "./UploadHistoryTable";

const validationRows = [
  {
    row: "Student Row 14",
    issue: "Duplicate admission number detected",
  },
  {
    row: "Parent Row 42",
    issue: "Missing student-parent relationship",
  },
  {
    row: "Teacher Assignment Row 6",
    issue: "Mathematics teacher already mapped to another section",
  },
];

export default function SchoolDataImportEngine() {
  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-yellow-500/15 bg-[#091522]/95 p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/70">
            Real School Onboarding
          </p>

          <h1 className="text-3xl font-semibold text-yellow-50">
            Import School Data Engine
          </h1>

          <p className="max-w-3xl text-sm leading-7 text-yellow-50/70">
            Upload operational Excel workbooks for onboarding classes,
            students, parents, teachers, timetable mappings, and academic
            structures into isolated school tenants.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <ERPSelect
            label="Academic Year"
            options={["2026-2027", "2027-2028"]}
            placeholder="Choose academic year"
          />

          <ERPSelect
            label="Class"
            options={["Class 1", "Class 5", "Class 10"]}
            placeholder="Select class"
          />

          <ERPSelect
            label="Section"
            options={["A", "B", "C"]}
            placeholder="Select section"
          />

          <ERPDatePicker label="Import Month" type="month" />
        </div>

        <div className="mt-8 rounded-3xl border border-dashed border-yellow-400/30 bg-[#07111b] p-10 text-center">
          <p className="text-sm text-yellow-100/80">
            Drag & drop Excel workbook or upload manually
          </p>

          <button className="mt-5 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-[#091522]">
            Upload Workbook
          </button>
        </div>
      </div>

      <ImportSummaryDashboard />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-3xl border border-yellow-500/15 bg-[#091522]/95">
          <div className="border-b border-yellow-500/10 px-6 py-5">
            <h2 className="text-lg font-semibold text-yellow-50">
              Import Validation & Failed Rows
            </h2>
          </div>

          <table className="w-full">
            <thead className="bg-yellow-500/5 text-left text-xs uppercase tracking-[0.18em] text-yellow-200/70">
              <tr>
                <th className="px-6 py-4">Validation Row</th>
                <th className="px-6 py-4">Issue</th>
              </tr>
            </thead>

            <tbody>
              {validationRows.map((row) => (
                <tr
                  key={row.row}
                  className="border-t border-yellow-500/5 text-sm text-yellow-50/90"
                >
                  <td className="px-6 py-4">{row.row}</td>
                  <td className="px-6 py-4">{row.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-yellow-500/15 bg-[#091522]/95 p-6">
          <h2 className="text-lg font-semibold text-yellow-50">
            Tenant Validation
          </h2>

          <div className="mt-6 space-y-4 text-sm text-yellow-50/80">
            <div className="rounded-2xl border border-yellow-500/10 bg-[#07111b] p-4">
              school_id isolation validation completed for BRK1.
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#07111b] p-4">
              Parent/student relationship verification active.
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#07111b] p-4">
              Teacher subject assignment conflict checks enabled.
            </div>

            <div className="rounded-2xl border border-yellow-500/10 bg-[#07111b] p-4">
              Workbook schema validation connected to onboarding flow.
            </div>
          </div>
        </div>
      </div>

      <UploadHistoryTable />
    </div>
  );
}
