import Image from "next/image";
import Link from "next/link";

const quickActions = [
  {
    title: "Principal Intelligence",
    href: "/principal/intelligence",
    description: "Executive school analytics and operational insights",
  },
  {
    title: "Attendance Reports",
    href: "/reports/attendance",
    description: "Daily, weekly and monthly attendance reporting",
  },
  {
    title: "Teacher Reports",
    href: "/reports/teachers",
    description: "Teacher workload, leaves and performance insights",
  },
  {
    title: "Teacher Leave Planning",
    href: "/teacher-leave",
    description: "Smart leave workflow and replacement handling",
  },
  {
    title: "Teacher Assignments",
    href: "/teacher-assignments",
    description: "Manage class-section-teacher mappings",
  },
  {
    title: "Timetable Operations",
    href: "/timetable/operations",
    description: "Manage timetable batches and publishing",
  },
  {
    title: "Generate Timetable",
    href: "/timetable/generate",
    description: "AI-assisted timetable generation engine",
  },
  {
    title: "Import School Data",
    href: "/import-school-data",
    description: "Excel onboarding engine for schools",
  },
  {
    title: "School Notices",
    href: "/school-notices",
    description: "Create and publish school-wide announcements",
  },
];

export default function Home() {
  return (
      <div
          className="min-h-screen bg-cover bg-top bg-fixed text-white"
          style={{
            backgroundImage:
                "linear-gradient(rgba(3,8,24,0.58), rgba(3,8,24,0.78)), url('/branding/splash-dark.png')",
            backgroundSize: "cover",
            backgroundPosition: "center -230px",
          }}
      >
        <header className="border-b border-white/10 bg-transparent">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <Image
                  src="/branding/vidyasetu-logo.png"
                  alt="VidyaSetu"
                  width={88}
                  height={88}
                  priority
                  className="h-auto w-auto"
              />

              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white">
                  VidyaSetu ERP
                </h1>

                <p className="text-xs font-medium tracking-wide text-gray-300">
                  Smart School Operations Platform
                </p>
              </div>
            </div>

            <div className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-5 py-2 text-sm font-semibold text-yellow-300">
              Day 22 Web ERP
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <section className="mb-10 rounded-3xl border border-yellow-500/20 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
            <h2 className="mb-4 text-5xl font-bold text-white">
              Welcome to VidyaSetu
            </h2>

            <p className="max-w-3xl text-lg leading-9 text-gray-100">
              Unified school ERP platform for principals, teachers,
              students and parents with smart timetable generation,
              attendance intelligence, replacement automation and
              operational analytics.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-3xl border border-white/10 bg-[#101c44]/90 p-6 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:bg-[#142453]/95"
                >
                  <h3 className="mb-3 text-2xl font-bold text-yellow-300">
                    {item.title}
                  </h3>

                  <p className="min-h-[72px] leading-7 text-gray-100">
                    {item.description}
                  </p>

                  <div className="mt-6 text-sm font-bold text-yellow-400">
                    Open Module →
                  </div>
                </Link>
            ))}
          </section>
        </main>
      </div>
  );
}