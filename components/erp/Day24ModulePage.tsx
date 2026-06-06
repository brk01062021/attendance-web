'use client';

import { useMemo, useState } from 'react';
import type { Day23ModuleConfig } from '@/types/erp';

type Props = {
    config: Day23ModuleConfig;
};

const baseControlClass =
    'mt-2 w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm font-semibold text-[#f8f3df] outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15';

const dateControlClass =
    'mt-2 w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm font-semibold text-[#f8f3df] outline-none transition [color-scheme:dark] focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15';

function uniqueOptions(values: string[]) {
    return Array.from(new Set(values.filter(Boolean)));
}


function getSearchPlaceholder(pageTitle: string) {
    const page = pageTitle.toLowerCase();

    if (page.includes('school intelligence')) return 'Search school insights';
    if (page.includes('notice')) return 'Search notices';
    if (page.includes('attendance')) return 'Search attendance reports';
    if (page.includes('teacher report')) return 'Search teachers';
    if (page.includes('analytics')) return 'Search analytics';
    if (page.includes('teacher assignment')) return 'Search teacher assignments';
    if (page.includes('generate timetable')) return 'Search timetable plans';
    if (page.includes('timetable')) return 'Search timetable records';

    return 'Search records';
}

function getFilterOptions(pageTitle: string, label: string, fallback: string) {
    const page = pageTitle.toLowerCase();
    const field = label.toLowerCase();

    if (field.includes('academic year')) {
        return uniqueOptions([fallback, '2026-2027', '2027-2028']);
    }

    if (field === 'view') {
        if (page.includes('school intelligence')) {
            return uniqueOptions([fallback, 'Whole School', 'Class Wise', 'Section Wise', 'Teacher Workload', 'Timetable Readiness', 'Risk Alerts']);
        }
        return uniqueOptions([fallback, 'Whole School', 'Class Wise', 'Section Wise', 'Teacher Wise']);
    }

    if (field === 'role') {
        return uniqueOptions([fallback, 'Principal/Admin', 'Principal', 'Admin']);
    }

    if (field.includes('notice type')) {
        return uniqueOptions([fallback, 'Holiday Notice', 'Academic Notice', 'General Announcement', 'Student Achievement', 'School Achievement', 'Emergency Alert']);
    }

    if (field.includes('audience')) {
        if (page.includes('notice')) {
            return uniqueOptions([fallback, 'All', 'Parents', 'Students', 'Teachers', 'Parents + Students', 'Selected Class/Section']);
        }
        if (page.includes('analytics')) {
            return uniqueOptions([fallback, 'Admin + Principal', 'Principal', 'Admin']);
        }
        return uniqueOptions([fallback, 'All', 'Parents', 'Students', 'Teachers', 'Parents + Students']);
    }

    if (field.includes('publish date')) {
        return uniqueOptions([fallback, 'Immediate', 'Today', 'Tomorrow', 'Schedule Date']);
    }

    if (field.includes('report date')) {
        return uniqueOptions([fallback, 'Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Custom Date']);
    }

    if (field === 'range') {
        return uniqueOptions([fallback, 'Daily', 'Weekly', 'Monthly', 'Custom Range']);
    }

    if (field === 'period') {
        return uniqueOptions([fallback, 'Daily', 'Weekly', 'Monthly', 'Term Wise']);
    }

    if (field.includes('class/section')) {
        return uniqueOptions([fallback, 'All Classes', 'Class 1-A', 'Class 1-B', 'Class 5-A', 'Class 9-B', 'Class 10-A', 'Class 10-B']);
    }

    if (field === 'scope') {
        if (page.includes('analytics')) {
            return uniqueOptions([fallback, 'Whole School', 'Class Wise', 'Section Wise', 'Teacher Wise']);
        }
        return uniqueOptions([fallback, 'All Classes', 'Class 1-A', 'Class 5-A', 'Class 9-B', 'Class 10-A']);
    }

    if (field === 'teacher') {
        return uniqueOptions([fallback, 'All Teachers', 'Anita Sharma', 'Ravi Kumar', 'Meena Rao']);
    }

    if (field === 'month') {
        return uniqueOptions([fallback, 'Current Month', 'Previous Month', 'May 2026', 'June 2026']);
    }

    if (field.includes('report type')) {
        return uniqueOptions([fallback, 'Workload + Leaves', 'Workload Only', 'Leave History', 'Replacement Load', 'Attendance Submission Audit']);
    }

    if (field === 'classes') {
        if (page.includes('generate timetable')) {
            return uniqueOptions([fallback, 'All Classes', 'Primary Classes 1-5', 'Middle Classes 6-8', 'High School 9-10', 'Class 1', 'Class 2', 'Class 5', 'Class 10']);
        }
        return uniqueOptions([fallback, 'All Classes', 'Class 1', 'Class 2', 'Class 5', 'Class 10']);
    }

    if (field === 'sections') {
        return uniqueOptions([fallback, 'Auto-load from selected classes', 'All Sections', 'Section A', 'Section B']);
    }

    if (field.includes('generation mode')) {
        return uniqueOptions([fallback, 'Annual Timetable', 'Monthly Timetable', 'Custom Date Range', 'Regenerate Draft']);
    }

    if (field === 'class') {
        return uniqueOptions([fallback, 'All Classes', 'Class 1', 'Class 2', 'Class 5', 'Class 10']);
    }

    if (field === 'section') {
        return uniqueOptions([fallback, 'All Sections', 'Section A', 'Section B']);
    }

    if (field.includes('teacher pool')) {
        return uniqueOptions([fallback, 'Default Class Pool', 'All Teachers', 'Primary Pool', 'Senior Pool', 'Subject Specialists']);
    }

    return uniqueOptions([fallback, 'All', 'Current', 'Ready', 'Needs Review']);
}

export default function Day24ModulePage({ config }: Props) {
    const [search, setSearch] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(() =>
        Object.fromEntries(config.filters.map((filter) => [filter.label, filter.value])),
    );

    const [customStartDate, setCustomStartDate] = useState('2026-06-01');
    const [customEndDate, setCustomEndDate] = useState('2027-04-30');

    const selectedGenerationMode = Object.entries(selectedFilters).find(([label]) =>
        label.toLowerCase().includes('generation mode'),
    )?.[1];

    const showTimetableDateRange =
        config.title.toLowerCase().includes('generate timetable') &&
        selectedGenerationMode?.toLowerCase().includes('custom');

    const pageTitle = config.title.toLowerCase();
    const showSearch = !pageTitle.includes('generate timetable') && !pageTitle.includes('teacher assignment') && !pageTitle.includes('analytics');
    const searchPlaceholder = getSearchPlaceholder(config.title);

    const filteredRows = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!showSearch || !value) return config.rows;

        return config.rows.filter((row) =>
            Object.values(row).some((cell) =>
                String(cell).toLowerCase().includes(value),
            ),
        );
    }, [config.rows, search, showSearch]);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#f8f3df]">
                            {config.title}
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f8f3df]/70">
                            {config.description}
                        </p>
                    </div>

                    {showSearch ? (
                        <label className="w-full lg:max-w-sm">
                            <span className="sr-only">{searchPlaceholder}</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df] outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/15"
                            />
                        </label>
                    ) : null}
                </div>
            </section>

            {config.filters.length > 0 ? (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {config.filters.map((filter) => {
                            const value = selectedFilters[filter.label] ?? filter.value;
                            const options = getFilterOptions(config.title, filter.label, filter.value);

                            return (
                                <label
                                    key={filter.label}
                                    className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4"
                                >
                                    <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">
                                        {filter.label}
                                    </span>
                                    <select
                                        value={value}
                                        onChange={(event) =>
                                            setSelectedFilters((current) => ({
                                                ...current,
                                                [filter.label]: event.target.value,
                                            }))
                                        }
                                        className={baseControlClass}
                                    >
                                        {options.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            {showTimetableDateRange ? (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="mb-4">
                        <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">
                            CUSTOM TIMETABLE RANGE
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">
                            Select generation dates
                        </h3>
                        <p className="mt-1 text-sm text-[#f8f3df]/65">
                            Choose the start and end dates for the custom timetable generation window.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
                            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">
                                Start Date
                            </span>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(event) => setCustomStartDate(event.target.value)}
                                className={dateControlClass}
                            />
                        </label>

                        <label className="block rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4">
                            <span className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">
                                End Date
                            </span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(event) => setCustomEndDate(event.target.value)}
                                className={dateControlClass}
                            />
                        </label>
                    </div>
                </section>
            ) : null}

            {pageTitle.includes('analytics') ? (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="mb-4">
                        <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">
                            RECORDS
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">
                            Operational areas
                        </h3>
                        <p className="mt-1 text-sm text-[#f8f3df]/65">
                            Each area remains empty until real school activity is available.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredRows.map((row, index) => (
                            <div
                                key={`${config.tableTitle}-${index}`}
                                className="rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-5"
                            >
                                <h4 className="text-lg font-semibold text-[#f8f3df]">{row.area}</h4>
                                <p className="mt-2 text-sm font-semibold text-[#d4af37]/80">No records available yet</p>
                                <p className="mt-2 text-sm leading-6 text-[#f8f3df]/65">{row.message}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="mb-4">
                        <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">
                            RECORDS
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">
                            {config.tableTitle}
                        </h3>
                        <p className="mt-1 text-sm text-[#f8f3df]/65">
                            {config.tableDescription}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[#d4af37]/10">
                                    {config.columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-4 py-3 text-left text-xs font-semibold tracking-[0.18em] text-[#d4af37]/70"
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map((row, index) => (
                                    <tr
                                        key={`${config.tableTitle}-${index}`}
                                        className="border-b border-[#d4af37]/5"
                                    >
                                        {config.columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-4 py-4 text-sm text-[#f8f3df]"
                                            >
                                                {row[column.key] ?? '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredRows.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-5 text-sm text-[#f8f3df]/70">
                            No matching records found.
                        </div>
                    ) : null}
                </section>
            )}
        </div>
    );
}
