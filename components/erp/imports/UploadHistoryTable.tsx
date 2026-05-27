
const uploads = [
  {
    file: "BRK1_MASTER_IMPORT.xlsx",
    date: "27 May 2026",
    rows: "1,028",
    status: "Completed",
  },
  {
    file: "BRK1_TEACHERS.xlsx",
    date: "26 May 2026",
    rows: "52",
    status: "Validation Warning",
  },
];

export default function UploadHistoryTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-500/15 bg-[#091522]/95">
      <div className="border-b border-yellow-500/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-yellow-50">
          Upload History
        </h2>
      </div>

      <table className="w-full">
        <thead className="bg-yellow-500/5 text-left text-xs uppercase tracking-[0.18em] text-yellow-200/70">
          <tr>
            <th className="px-6 py-4">Workbook</th>
            <th className="px-6 py-4">Imported On</th>
            <th className="px-6 py-4">Rows</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {uploads.map((upload) => (
            <tr
              key={upload.file}
              className="border-t border-yellow-500/5 text-sm text-yellow-50/90"
            >
              <td className="px-6 py-4">{upload.file}</td>
              <td className="px-6 py-4">{upload.date}</td>
              <td className="px-6 py-4">{upload.rows}</td>
              <td className="px-6 py-4">{upload.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
