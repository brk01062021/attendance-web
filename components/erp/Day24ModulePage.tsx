'use client';

import { useMemo, useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import type { Day23ModuleConfig } from '@/types/erp';

type Props = {
    config: Day23ModuleConfig;
};

export default function Day24ModulePage({ config }: Props) {
    const [activeAction, setActiveAction] = useState(config.actions[0]?.title ?? '');
    const [search, setSearch] = useState('');

    const filteredRows = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return config.rows;
        return config.rows.filter((row) => Object.values(row).some((cell) => cell.toLowerCase().includes(value)));
    }, [config.rows, search]);

    return (
        <>
            <div className="dashboard-grid">
                {config.metrics.map((metric) => (
                    <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} tone={metric.tone} />
                ))}
            </div>

            <section className="day23-hero gold-panel">
                <div>
                    <p className="eyebrow">{config.eyebrow}</p>
                    <h2>{config.title}</h2>
                    <p>{config.description}</p>
                </div>
                <div className="day23-filter-grid" aria-label="Current filters">
                    {config.filters.map((filter) => (
                        <div className="day23-filter" key={filter.label}>
                            <span>{filter.label}</span>
                            <strong>{filter.value}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className="day23-layout">
                <div className="day23-panel gold-panel">
                    <div className="day23-section-heading">
                        <div>
                            <p className="eyebrow">Operational actions</p>
                            <h3>Operational actions</h3>
                        </div>
                    </div>
                    <div className="day23-action-list">
                        {config.actions.map((action) => {
                            const active = activeAction === action.title;
                            return (
                                <button
                                    key={action.title}
                                    type="button"
                                    className={active ? 'day23-action day23-action--active' : 'day23-action'}
                                    onClick={() => setActiveAction(action.title)}
                                >
                                    <span className="day23-action-icon">{action.icon}</span>
                                    <span>
                    <strong>{action.title}</strong>
                    <small>{action.body}</small>
                  </span>
                                    <em>{action.status}</em>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="day23-panel gold-panel">
                    <div className="day23-section-heading">
                        <div>
                            <p className="eyebrow">{config.validationTitle}</p>
                            <h3>Operational readiness</h3>
                        </div>
                    </div>
                    <div className="status-list">
                        {config.validations.map((item) => (
                            <div className={`status-row status-row--${item.tone ?? 'gold'}`} key={item.label}>
                                <strong>{item.label}</strong>
                                <span>{item.status}</span>
                            </div>
                        ))}
                    </div>
                    <div className="day23-next-box">
                        <strong>Next build order</strong>
                        <ol>
                            {config.nextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            <section className="day23-table-card gold-panel">
                <div className="day23-table-header">
                    <div>
                        <p className="eyebrow">Records preview</p>
                        <h3>{config.tableTitle}</h3>
                        <p>{config.tableDescription}</p>
                    </div>
                    <label className="day23-search">
                        Search preview
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search table" />
                    </label>
                </div>
                <div className="day23-table-wrap">
                    <table className="day23-table">
                        <thead>
                        <tr>
                            {config.columns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRows.map((row, index) => (
                            <tr key={`${config.tableTitle}-${index}`}>
                                {config.columns.map((column) => (
                                    <td key={column.key}>{row[column.key] ?? '-'}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {filteredRows.length === 0 ? <div className="day23-empty">No matching preview records.</div> : null}
            </section>
        </>
    );
}
