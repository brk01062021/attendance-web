'use client';

import { useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const resultsByExam = {
  'Unit Test 1': {
    total: '263 / 300',
    percentage: '87.7%',
    grade: 'A',
    subjects: [
      ['Mathematics', '88 / 100'],
      ['Science', '91 / 100'],
      ['English', '84 / 100'],
    ],
  },
  'Quarterly Exam': {
    total: '438 / 500',
    percentage: '87.6%',
    grade: 'A',
    subjects: [
      ['English', '86 / 100'],
      ['Telugu', '90 / 100'],
      ['Mathematics', '92 / 100'],
      ['Science', '87 / 100'],
      ['Social', '83 / 100'],
    ],
  },
  'Half Yearly Exam': {
    total: '452 / 500',
    percentage: '90.4%',
    grade: 'A+',
    subjects: [
      ['English', '89 / 100'],
      ['Telugu', '92 / 100'],
      ['Mathematics', '95 / 100'],
      ['Science', '91 / 100'],
      ['Social', '85 / 100'],
    ],
  },
};

type ExamName = keyof typeof resultsByExam;

export default function Page() {
  const exams = Object.keys(resultsByExam) as ExamName[];
  const [selectedExam, setSelectedExam] = useState<ExamName>(exams[0]);

  const result = useMemo(() => resultsByExam[selectedExam], [selectedExam]);

  return (
    <PortalShell role="STUDENT" title="Exam Results" subtitle="Select an exam or term to view published academic results.">
      <ShellStyles />

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Academic results</p>
            <h2>Exam Result History</h2>
            <p>Tap an exam to review subject marks, total, percentage, and grade.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {exams.map((exam) => (
            <button
              type="button"
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                selectedExam === exam
                  ? 'border-amber-300/40 bg-amber-300/25 text-amber-50'
                  : 'border-white/15 bg-white/10 text-white/75 hover:bg-white/15'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-5">
          <div className="status-row">
            <strong>Total</strong>
            <span>{result.total}</span>
          </div>
          <div className="status-row">
            <strong>Percentage</strong>
            <span>{result.percentage}</span>
          </div>
          <div className="status-row">
            <strong>Grade</strong>
            <span>{result.grade}</span>
          </div>
        </div>

        <div className="status-list mt-5">
          {result.subjects.map(([subject, score]) => (
            <div className="status-row" key={subject}>
              <strong>{subject}</strong>
              <span>{score}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
