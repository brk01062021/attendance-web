
interface ERPDatePickerProps {
  label: string;
  type?: "date" | "month";
}

export default function ERPDatePicker({
  label,
  type = "date",
}: ERPDatePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.2em] text-yellow-300/80">
        {label}
      </label>

      <input
        type={type}
        className="rounded-2xl border border-yellow-500/20 bg-[#08131f]/90 px-4 py-3 text-sm text-yellow-50 outline-none transition focus:border-yellow-400"
      />
    </div>
  );
}
