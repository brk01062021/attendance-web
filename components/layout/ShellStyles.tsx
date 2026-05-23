export default function ShellStyles() {
  return (
      <style>{`
      :root {
        --navy-990: #030a14;
        --navy-950: #061321;
        --navy-900: #0a1d32;
        --navy-800: #102943;
        --navy-700: #173754;
        --gold-700: #9f6f22;
        --gold-600: #b9822e;
        --gold-500: #d6a84f;
        --gold-400: #edc873;
        --gold-300: #f8df9b;
        --cream-50: #fff8e7;
        --ink-900: #142033;
        --ink-700: #475569;
        --ink-600: #64748b;
        --success: #37d382;
        --warning: #f6b851;
        --danger: #ff6b6b;
        --shadow-soft: 0 24px 70px rgba(0, 0, 0, 0.28);
        --glass: rgba(8, 28, 49, 0.64);
        --glass-strong: rgba(6, 19, 33, 0.78);
        --glass-border: rgba(248, 223, 155, 0.24);
      }

      * { box-sizing: border-box; }
      a { color: inherit; text-decoration: none; }
      button, input, select, textarea { font: inherit; }
      body { margin: 0; background: var(--navy-950); }

      .page-dark, .page-gold { position: relative; overflow: hidden; background-size: cover; background-position: center; }
      .page-dark { background-image: linear-gradient(135deg, rgba(3, 10, 20, 0.97), rgba(6, 23, 41, 0.94)), url('/branding/splash-dark.png'); }
      .page-gold { background-image: linear-gradient(135deg, rgba(3, 10, 20, 0.95), rgba(10, 29, 50, 0.9), rgba(36, 30, 14, 0.82)), url('/branding/splash-gold.png'); }
      .page-dark::before, .page-gold::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle at top right, rgba(248, 223, 155, 0.2), transparent 34%), radial-gradient(circle at bottom left, rgba(214, 168, 79, 0.14), transparent 38%); }

      .portal-shell { display: grid; grid-template-columns: 322px minmax(0, 1fr); min-height: 100vh; }
      .sidebar { position: relative; z-index: 1; padding: 24px; border-right: 1px solid var(--glass-border); background: rgba(3, 10, 20, 0.74); backdrop-filter: blur(22px); overflow-y: auto; }
      .brand-block { display: flex; gap: 14px; align-items: center; color: white; margin-bottom: 24px; padding: 12px; border-radius: 22px; background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); }
      .brand-block strong { color: var(--gold-300); }
      .brand-block span { display: block; color: rgba(255,255,255,0.68); font-size: 13px; margin-top: 3px; }
      .brand-mark { width: 52px; height: 52px; border-radius: 18px; object-fit: cover; box-shadow: 0 15px 32px rgba(214,168,79,0.24); }
      .nav-list { display: flex; flex-direction: column; gap: 9px; }
      .nav-item { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: center; padding: 12px; border-radius: 18px; color: rgba(255,255,255,0.86); border: 1px solid transparent; transition: 160ms ease; }
      .nav-item:hover, .nav-item--active { background: rgba(255,255,255,0.11); border-color: rgba(248, 223, 155, 0.38); transform: translateX(2px); box-shadow: 0 12px 28px rgba(0,0,0,0.18); }
      .nav-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 15px; background: rgba(248, 223, 155, 0.12); }
      .nav-item strong { display: block; font-size: 14px; color: var(--gold-300); }
      .nav-item small { display: block; color: rgba(255,255,255,0.64); margin-top: 2px; line-height: 1.35; }
      .sidebar-footer { margin-top: 18px; padding: 14px; border-radius: 18px; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(244, 213, 141, 0.14); font-size: 12px; line-height: 1.5; }

      .portal-content { position: relative; z-index: 1; padding: 34px; min-width: 0; }
      .portal-header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; color: white; margin-bottom: 24px; }
      .portal-header h1 { margin: 4px 0 8px; font-size: clamp(30px, 4vw, 48px); letter-spacing: -0.045em; line-height: 1.02; color: #fff7df; text-shadow: 0 8px 26px rgba(0,0,0,0.35); }
      .portal-header span { color: rgba(255,255,255,0.76); line-height: 1.55; display: block; max-width: 820px; }
      .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
      .user-chip { padding: 10px 14px; border-radius: 999px; color: white; background: rgba(255,255,255,0.1); border: 1px solid rgba(244, 213, 141, 0.24); font-size: 13px; font-weight: 800; }
      .user-chip--role { color: var(--gold-300); background: rgba(214,168,79,0.13); border-color: rgba(248,223,155,0.42); }
      .eyebrow { color: var(--gold-300); font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
      .logout-button, .primary-button, .secondary-button { border: 0; border-radius: 999px; font-weight: 900; padding: 12px 18px; cursor: pointer; transition: 160ms ease; }
      .logout-button, .primary-button { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); box-shadow: 0 16px 34px rgba(214,168,79,0.22); }
      .secondary-button { background: rgba(255,255,255,0.12); color: var(--gold-300); border: 1px solid rgba(244, 213, 141, 0.28); }
      .logout-button:hover, .primary-button:hover, .secondary-button:hover { transform: translateY(-1px); }

      .dashboard-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
      .metric-card { border-radius: 24px; padding: 20px; background: rgba(8, 28, 49, 0.62); border: 1px solid var(--glass-border); box-shadow: var(--shadow-soft); backdrop-filter: blur(18px); }
      .metric-card p { margin: 0; color: rgba(255,255,255,0.7); font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; }
      .metric-card strong { display: block; font-size: 34px; margin: 8px 0; color: var(--gold-300); }
      .metric-card span { color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.45; }
      .metric-card--success { border-color: rgba(55,211,130,0.32); }
      .metric-card--success strong { color: var(--success); }
      .metric-card--warning { border-color: rgba(246,184,81,0.34); }
      .metric-card--warning strong { color: var(--warning); }
      .metric-card--danger { border-color: rgba(255,107,107,0.34); }
      .metric-card--danger strong { color: var(--danger); }

      .gold-panel, .glass-panel, .premium-panel { background: linear-gradient(145deg, rgba(8, 28, 49, 0.72), rgba(3, 10, 20, 0.68)); border: 1px solid var(--glass-border); box-shadow: var(--shadow-soft); backdrop-filter: blur(18px); }
      .work-panel, .page-card { border-radius: 28px; padding: 24px; color: white; }
      .work-panel h2, .page-card h2 { margin: 0 0 10px; font-size: 28px; letter-spacing: -0.03em; color: #fff7df; }
      .work-panel p, .page-card p { color: rgba(255,255,255,0.76); line-height: 1.58; }
      .action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
      .action-card { border-radius: 22px; padding: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(248, 223, 155, 0.22); color: white; transition: 160ms ease; }
      .action-card:hover { transform: translateY(-2px); border-color: rgba(248, 223, 155, 0.48); background: rgba(255,255,255,0.12); }
      .action-card strong { display: block; margin: 8px 0 4px; color: var(--gold-300); }
      .action-card span { color: rgba(255,255,255,0.68); font-size: 13px; line-height: 1.45; }
      .action-card-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 16px; background: rgba(248,223,155,0.12); color: white !important; font-size: 22px !important; }
      .two-column { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; align-items: stretch; }
      .status-list { display: grid; gap: 10px; margin-top: 14px; }
      .status-row { display: flex; justify-content: space-between; gap: 14px; padding: 13px 14px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(214,168,79,0.18); color: rgba(255,255,255,0.72); }
      .status-row strong { color: var(--gold-300); }

      .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .login-card { width: min(490px, 100%); border-radius: 34px; padding: 30px; position: relative; z-index: 1; background: rgba(8,28,49,0.76); border: 1px solid var(--glass-border); color: white; backdrop-filter: blur(18px); }
      .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .login-logo img { width: 56px; height: 56px; border-radius: 18px; object-fit: cover; }
      .login-card h1 { margin: 8px 0 8px; font-size: 38px; letter-spacing: -0.04em; color: #fff7df; }
      .login-copy { color: rgba(255,255,255,0.74); line-height: 1.55; }
      .login-card label { display: grid; gap: 8px; margin-top: 16px; font-weight: 800; color: var(--gold-300); }
      .login-card input { border: 1px solid rgba(248,223,155,0.24); border-radius: 16px; padding: 13px 14px; background: rgba(255,255,255,0.95); outline: none; color: var(--ink-900); }
      .role-switch { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
      .role-pill { border: 1px solid rgba(248,223,155,0.22); border-radius: 999px; padding: 11px; background: rgba(255,255,255,0.08); cursor: pointer; font-weight: 900; color: rgba(255,255,255,0.74); }
      .role-pill--active { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); border-color: var(--gold-500); }
      .login-card .primary-button { width: 100%; margin-top: 22px; }
      .dev-note { display: block; margin-top: 14px; color: rgba(255,255,255,0.66); line-height: 1.45; }

      .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
      .form-grid label { display: grid; gap: 8px; color: var(--gold-300); font-weight: 900; }
      .form-grid input, .form-grid select, .form-grid textarea { border: 1px solid rgba(248,223,155,0.24); border-radius: 16px; padding: 13px 14px; background: rgba(255,255,255,0.96); outline: none; color: var(--ink-900); width: 100%; }
      .form-grid textarea { resize: vertical; line-height: 1.5; }
      .form-grid--full { grid-column: 1 / -1; }
      .button-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .notice-card { margin-top: 14px; border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,0.09); border: 1px solid rgba(248,223,155,0.24); color: #fff7df; font-weight: 800; line-height: 1.5; }
      .history-grid { display: grid; gap: 14px; margin-top: 18px; }
      .history-card { border-radius: 22px; padding: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(248,223,155,0.22); color: white; }
      .history-card-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
      .history-card h3 { margin: 0; color: var(--gold-300); }
      .history-meta, .timeline { color: rgba(255,255,255,0.72); line-height: 1.6; font-size: 13px; }
      .status-pill { border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 900; border: 1px solid rgba(255,255,255,0.14); }
      .status-pill--approved { color: var(--success); background: rgba(55,211,130,0.12); border-color: rgba(55,211,130,0.3); }
      .status-pill--rejected { color: var(--danger); background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.3); }
      .status-pill--pending { color: var(--warning); background: rgba(246,184,81,0.12); border-color: rgba(246,184,81,0.3); }
      .remarks-box { margin-top: 12px; border-radius: 16px; padding: 12px; background: rgba(248,223,155,0.1); border: 1px solid rgba(248,223,155,0.2); color: #fff7df; }
      .timeline { display: grid; gap: 8px; margin-top: 12px; }
      .timeline div { display: flex; gap: 10px; align-items: center; }
      .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gold-400); box-shadow: 0 0 0 5px rgba(248,223,155,0.08); flex: 0 0 auto; }

      .day23-hero, .day25-hero, .day23-panel, .day23-table-card, .day25-panel, .day25-gate, .day25-route-card, .day23-filter, .day23-action, .day23-next-box, .day23-table-wrap { background: rgba(8,28,49,0.68) !important; border-color: var(--glass-border) !important; color: white !important; backdrop-filter: blur(18px); }
      .day23-hero h2, .day25-hero h2, .day23-section-heading h3, .day23-table-header h3, .day25-panel h3, .day25-route-card strong { color: #fff7df !important; }
      .day23-hero p:not(.eyebrow), .day25-hero p:not(.eyebrow), .day23-table-header p:not(.eyebrow), .day25-check-list, .day25-danger-list, .day25-gate ul, .day25-timeline span, .day23-next-box ol { color: rgba(255,255,255,0.74) !important; }
      .day23-filter span, .day23-action small, .day23-action em, .day25-gate span, .day25-gate-top em { color: rgba(255,255,255,0.68) !important; }
      .day23-filter strong, .day23-action strong, .day25-timeline strong, .day25-gate-top strong { color: var(--gold-300) !important; }
      .day23-table { width: 100%; border-collapse: collapse; min-width: 720px; }
      .day23-table th, .day23-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(214,168,79,0.16); }
      .day23-table th { color: var(--gold-300); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(255,255,255,0.07); }
      .day23-table td { color: rgba(255,255,255,0.84); font-weight: 700; }
      .day23-table tr:last-child td { border-bottom: 0; }
      .day23-empty { margin-top: 12px; border-radius: 16px; padding: 14px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.74); font-weight: 800; }
      .day23-search input { border: 1px solid rgba(248,223,155,0.24); border-radius: 16px; padding: 12px 13px; background: rgba(255,255,255,0.95); color: var(--ink-900); outline: none; }
      .day23-hero, .day25-hero { border-radius: 30px; padding: 28px; margin-bottom: 18px; display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 18px; align-items: stretch; }
      .day23-layout, .day25-split { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 18px; margin-bottom: 18px; }
      .day25-gate-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .day25-timeline { display: grid; gap: 10px; }
      .day25-timeline div { display: grid; grid-template-columns: 94px 1fr; gap: 12px; align-items: center; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(214,168,79,0.18); padding: 12px; }
      .mini-button { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 11px 15px; background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); font-weight: 900; border: 1px solid rgba(214,168,79,0.35); }

      .portal-shell--loading { display: grid; grid-template-columns: 1fr; place-items: center; padding: 24px; }
      .guard-card { border-radius: 26px; padding: 24px; color: #fff7df; font-weight: 900; }

      @media (max-width: 1180px) { .portal-shell { grid-template-columns: 280px minmax(0, 1fr); } .dashboard-grid { grid-template-columns: 1fr 1fr; } .action-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 920px) { .portal-shell { grid-template-columns: 1fr; } .sidebar { position: static; max-height: 42vh; } .two-column, .day23-hero, .day23-layout, .day25-hero, .day25-split { grid-template-columns: 1fr; } .day25-gate-grid { grid-template-columns: 1fr 1fr; } .portal-header { flex-direction: column; } .header-actions { justify-content: flex-start; } }
      @media (max-width: 680px) { .portal-content { padding: 20px; } .dashboard-grid, .action-grid, .day25-gate-grid, .form-grid, .role-switch { grid-template-columns: 1fr; } .day23-table-header, .day25-section-header { flex-direction: column; } .day23-action { grid-template-columns: 42px 1fr; } .day23-action em { grid-column: 2; justify-self: flex-start; } }
    `}</style>
  );
}
