'use client';

import { useMemo, useState } from 'react';
import type { Day23ModuleConfig } from '@/types/erp';

type Props = {
    config: Day23ModuleConfig;
};

export default function Day24ModulePage({ config }: Props) {
    const [search, setSearch] = useState('');

    const filteredRows = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) return config.rows;

        return config.rows.filter((row) =>
            Object.values(row).some((cell) =>
                String(cell).toLowerCase().includes(value),
            ),
        );
    }, [config.rows, search]);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">
                            OPERATIONAL FILTERS
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-[#f8f3df]">
                            {config.title}
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f8f3df]/70">
                            {config.description}
                        </p>
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search records..."
                        className="w-full rounded-2xl border border-[#d4af37]/20 bg-[#08131f] px-4 py-3 text-sm text-[#f8f3df] outline-none lg:max-w-sm"
                    />
                </div>
            </section>

            {config.filters.length > 0 ? (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {config.filters.map((filter) => (
                            <div
                                key={filter.label}
                                className="rounded-2xl border border-[#d4af37]/10 bg-[#08131f] p-4"
                            >
                                <p className="text-xs font-semibold tracking-[0.18em] text-[#d4af37]/60">
                                    {filter.label}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-[#f8f3df]">
                                    {filter.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

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

            {config.actions.length > 0 ? (
                <section className="rounded-3xl border border-[#d4af37]/20 bg-[#0d1724] p-6">
                    <p className="text-xs font-semibold tracking-[0.24em] text-[#d4af37]/70">
                        ACTION QUEUE
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {config.actions.map((action) => (
                            <button
                                key={action.title}
                                type="button"
                                className="rounded-2xl border border-[#d4af37]/15 bg-[#08131f] p-4 text-left transition hover:border-[#d4af37]/45"
                            >
                                <p className="text-sm font-semibold text-[#f8f3df]">
                                    {action.title}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[#f8f3df]/65">
                                    {action.body}
                                </p>
                                <span className="mt-3 inline-flex rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                                    {action.status}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}