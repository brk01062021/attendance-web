import Link from 'next/link';

type Props = {
    eyebrow: string;
    title: string;
    description: string;
    primary: string[];
    validations: string[];
    nextHref?: string;
    nextLabel?: string;
};

export default function PilotWorkflowPage({ eyebrow, title, description, primary, validations, nextHref = '/production-hardening', nextLabel = 'Back to Day 25 board' }: Props) {
    return (
        <>
            <section className="day25-hero gold-panel">
                <div>
                    <p className="eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                <div className="day25-route-card">
                    <strong>Pilot rule</strong>
                    <span>Mobile-first for daily usage</span>
                    <span>Web-first for bulk/admin details</span>
                    <span>No exam generation</span>
                    <span>No advanced AI/WhatsApp/SMS now</span>
                </div>
            </section>
            <section className="day25-split">
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">WORKFLOW SCOPE</p>
                    <h3>What this page must support</h3>
                    <ul className="day25-check-list">{primary.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="day25-panel gold-panel">
                    <p className="eyebrow">VALIDATION GATES</p>
                    <h3>Required before pilot use</h3>
                    <ul className="day25-check-list">{validations.map((item) => <li key={item}>{item}</li>)}</ul>
                    <Link className="mini-button" href={nextHref}>{nextLabel}</Link>
                </div>
            </section>
        </>
    );
}
