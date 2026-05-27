
interface ERPPageHeadingProps {
  schoolName: string;
  workspace: string;
}

export default function ERPPageHeading({
  schoolName,
  workspace,
}: ERPPageHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="erp-school-title text-3xl">
        {schoolName}
      </h1>

      <p className="erp-workspace-subtitle text-sm tracking-wide">
        {workspace}
      </p>
    </div>
  );
}
