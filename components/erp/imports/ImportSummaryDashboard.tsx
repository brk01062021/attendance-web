
const stats = [
  { label: "Students Imported", value: "612" },
  { label: "Parents Linked", value: "604" },
  { label: "Teachers Imported", value: "48" },
  { label: "Duplicate Rows", value: "11" },
];

export default function ImportSummaryDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-yellow-500/15 bg-[#091522]/95 p-5"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/70">
            {item.label}
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-yellow-50">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
