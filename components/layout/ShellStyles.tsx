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
        --erp-page-title: clamp(26px, 3.2vw, 40px);
        --erp-workspace-title: clamp(15px, 1.5vw, 18px);
        --erp-section-label: 11px;
        --erp-card-title: 16px;
        --erp-card-description: 13px;
        --erp-status-chip: 11px;
        --erp-sidebar-title: 14px;
        --erp-sidebar-subtitle: 12px;
        --erp-section-gap: 18px;
        --erp-grid-gap: 16px;
        --erp-card-padding: 18px;
        --erp-card-radius: 22px;
      }

      * { box-sizing: border-box; }
      a { color: inherit; text-decoration: none; }
      button, input, select, textarea { font: inherit; }
      body { margin: 0; background: var(--navy-950); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      h1, h2, h3, p { text-wrap: pretty; }
      .erp-page-title { font-size: var(--erp-page-title); line-height: 1.05; letter-spacing: -0.045em; font-weight: 950; }
      .erp-workspace-subtitle { font-size: var(--erp-workspace-title); line-height: 1.35; font-weight: 900; }
      .erp-section-label { font-size: var(--erp-section-label); line-height: 1.25; font-weight: 900; letter-spacing: 0.13em; text-transform: uppercase; }
      .erp-card-title { font-size: var(--erp-card-title); line-height: 1.25; font-weight: 900; }
      .erp-card-description { font-size: var(--erp-card-description); line-height: 1.45; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .erp-status-chip { font-size: var(--erp-status-chip); line-height: 1.2; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }

      .page-dark, .page-gold { position: relative; overflow: hidden; background-size: cover; background-position: center; }
      .page-dark { background-image: linear-gradient(135deg, rgba(3, 10, 20, 0.97), rgba(6, 23, 41, 0.94)), url('/branding/splash-dark.png'); }
      .page-gold { background-image: linear-gradient(135deg, rgba(3, 10, 20, 0.95), rgba(10, 29, 50, 0.9), rgba(36, 30, 14, 0.82)), url('/branding/splash-gold.png'); }
      .page-dark::before, .page-gold::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle at top right, rgba(248, 223, 155, 0.2), transparent 34%), radial-gradient(circle at bottom left, rgba(214, 168, 79, 0.14), transparent 38%); }

      .portal-shell { display: grid; grid-template-columns: 322px minmax(0, 1fr); min-height: 100vh; }
      .sidebar { position: relative; z-index: 1; padding: 22px; border-right: 1px solid var(--glass-border); background: rgba(3, 10, 20, 0.74); backdrop-filter: blur(22px); overflow-y: auto; }
      .brand-block { display: flex; gap: 12px; align-items: center; color: white; margin-bottom: var(--erp-section-gap); padding: 12px; border-radius: 22px; background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); }
      .brand-block strong { color: var(--gold-300); font-size: var(--erp-sidebar-title); line-height: 1.25; }
      .brand-block span { display: block; color: rgba(255,255,255,0.66); font-size: var(--erp-sidebar-subtitle); line-height: 1.25; margin-top: 2px; }
      .brand-mark { width: 52px; height: 52px; border-radius: 18px; object-fit: cover; box-shadow: 0 15px 32px rgba(214,168,79,0.24); }
      .nav-list { display: flex; flex-direction: column; gap: 8px; }
      .nav-item { display: grid; grid-template-columns: 40px 1fr; gap: 11px; align-items: center; padding: 11px; border-radius: 18px; color: rgba(255,255,255,0.86); border: 1px solid transparent; transition: 160ms ease; }
      .nav-item:hover, .nav-item--active { background: rgba(255,255,255,0.11); border-color: rgba(248, 223, 155, 0.38); transform: translateX(2px); box-shadow: 0 12px 28px rgba(0,0,0,0.18); }
      .nav-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 15px; background: rgba(248, 223, 155, 0.12); }
      .nav-item strong { display: block; font-size: var(--erp-sidebar-title); line-height: 1.25; color: var(--gold-300); }
      .nav-item small { display: -webkit-box; color: rgba(255,255,255,0.64); margin-top: 3px; font-size: var(--erp-sidebar-subtitle); line-height: 1.3; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .sidebar-footer { margin-top: 18px; padding: 14px; border-radius: 18px; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(244, 213, 141, 0.14); font-size: 12px; line-height: 1.5; }

      .portal-content { position: relative; z-index: 1; padding: 30px; min-width: 0; display: flex; flex-direction: column; gap: var(--erp-section-gap); }
      .portal-header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; color: white; margin-bottom: 24px; }
      .portal-header h1 { margin: 4px 0 8px; font-size: clamp(30px, 4vw, 48px); letter-spacing: -0.045em; line-height: 1.02; color: #fff7df; text-shadow: 0 8px 26px rgba(0,0,0,0.35); }
      .portal-header span { color: rgba(255,255,255,0.76); line-height: 1.55; display: block; max-width: 820px; }
      .portal-title-block .eyebrow { color: var(--gold-300); font-size: 13px; letter-spacing: 0.14em; }
      .workspace-title { color: #f8df9b !important; font-size: clamp(17px, 2vw, 22px); font-weight: 900; letter-spacing: 0.01em; }
      .workspace-subtitle { margin-top: 8px; }
      .session-identity { margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.68) !important; }

      .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
      .user-chip { padding: 10px 14px; border-radius: 999px; color: white; background: rgba(255,255,255,0.1); border: 1px solid rgba(244, 213, 141, 0.24); font-size: 13px; font-weight: 800; }
      .user-chip--role { color: var(--gold-300); background: rgba(214,168,79,0.13); border-color: rgba(248,223,155,0.42); }
      .eyebrow { color: var(--gold-300); font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
      .logout-button, .primary-button, .secondary-button { border: 0; border-radius: 999px; font-weight: 900; padding: 12px 18px; cursor: pointer; transition: 160ms ease; }
      .logout-button, .primary-button { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); box-shadow: 0 16px 34px rgba(214,168,79,0.22); }
      .secondary-button { background: rgba(255,255,255,0.12); color: var(--gold-300); border: 1px solid rgba(244, 213, 141, 0.28); }
      .logout-button:hover, .primary-button:hover, .secondary-button:hover { transform: translateY(-1px); }

      .dashboard-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--erp-grid-gap); margin-bottom: 0; }
      .metric-card { border-radius: var(--erp-card-radius); padding: var(--erp-card-padding); background: rgba(8, 28, 49, 0.62); border: 1px solid var(--glass-border); box-shadow: var(--shadow-soft); backdrop-filter: blur(18px); }
      .metric-card p { margin: 0; color: rgba(255,255,255,0.7); font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--erp-section-label); line-height: 1.25; }
      .metric-card strong { display: block; font-size: 30px; line-height: 1.05; margin: 8px 0; color: var(--gold-300); }
      .metric-card span { color: rgba(255,255,255,0.7); font-size: var(--erp-card-description); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .metric-card--success { border-color: rgba(55,211,130,0.32); }
      .metric-card--success strong { color: var(--success); }
      .metric-card--warning { border-color: rgba(246,184,81,0.34); }
      .metric-card--warning strong { color: var(--warning); }
      .metric-card--danger { border-color: rgba(255,107,107,0.34); }
      .metric-card--danger strong { color: var(--danger); }

      .gold-panel, .glass-panel, .premium-panel { background: linear-gradient(145deg, rgba(8, 28, 49, 0.72), rgba(3, 10, 20, 0.68)); border: 1px solid var(--glass-border); box-shadow: var(--shadow-soft); backdrop-filter: blur(18px); }
      .work-panel, .page-card { border-radius: 26px; padding: 24px; color: white; }
      .work-panel h2, .page-card h2 { margin: 0 0 10px; font-size: 24px; line-height: 1.12; letter-spacing: -0.03em; color: #fff7df; }
      .work-panel p, .page-card p { color: rgba(255,255,255,0.76); line-height: 1.5; margin-top: 0; }
      .action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--erp-grid-gap); margin-top: var(--erp-section-gap); }
      .action-card { border-radius: var(--erp-card-radius); padding: var(--erp-card-padding); min-height: 154px; display: flex; flex-direction: column; background: rgba(255,255,255,0.08); border: 1px solid rgba(248, 223, 155, 0.22); color: white; transition: 160ms ease; }
      .action-card:hover { transform: translateY(-2px); border-color: rgba(248, 223, 155, 0.48); background: rgba(255,255,255,0.12); }
      .action-card strong { display: block; margin: 10px 0 6px; color: var(--gold-300); font-size: var(--erp-card-title); line-height: 1.25; }
      .action-card span { color: rgba(255,255,255,0.68); font-size: var(--erp-card-description); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .action-card-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 16px; background: rgba(248,223,155,0.12); color: white !important; font-size: 22px !important; }
      .two-column { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 22px; align-items: stretch; }
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


      .executive-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
        gap: 18px;
        align-items: stretch;
        margin-bottom: 0;
      }
      .executive-hero h2 { margin: 0 0 10px; color: #fff7df; font-size: var(--erp-page-title); letter-spacing: -0.045em; line-height: 1.05; }
      .executive-hero p { color: rgba(255,255,255,0.76); line-height: 1.5; max-width: 820px; }
      .hero-chip-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
      .hero-chip { border-radius: 999px; padding: 9px 13px; background: rgba(248,223,155,0.1); border: 1px solid rgba(248,223,155,0.24); color: var(--gold-300); font-size: 12px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
      .executive-focus-card { border-radius: var(--erp-card-radius); padding: var(--erp-card-padding); background: linear-gradient(145deg, rgba(248,223,155,0.18), rgba(255,255,255,0.07)); border: 1px solid rgba(248,223,155,0.28); color: white; display: flex; flex-direction: column; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
      .executive-focus-card span { color: rgba(255,255,255,0.64); text-transform: uppercase; letter-spacing: 0.12em; font-size: var(--erp-section-label); line-height: 1.25; font-weight: 900; }
      .executive-focus-card strong { margin-top: 10px; color: var(--gold-300); font-size: 20px; line-height: 1.18; }
      .executive-focus-card p { margin: 10px 0 0; color: rgba(255,255,255,0.74); line-height: 1.45; }
      .dashboard-grid--premium { margin-bottom: 0; }
      .metric-card { position: relative; overflow: hidden; min-height: 166px; }
      .metric-card::after { content: ''; position: absolute; inset: auto -28px -44px auto; width: 118px; height: 118px; border-radius: 999px; background: rgba(255,255,255,0.08); }
      .metric-card__topline { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; position: relative; z-index: 1; }
      .metric-card .metric-card__topline p { margin: 0; }
      .metric-card__trend { border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.82) !important; font-size: 11px !important; font-weight: 900; }
      .metric-card--info { border-color: rgba(105,183,255,0.38) !important; }
      .metric-card--info strong, .insight-card--info strong { color: #9ed0ff !important; }
      .metric-card--neutral strong { color: #fff7df !important; }
      .insight-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--erp-grid-gap); margin-bottom: 0; }
      .insight-card { border-radius: var(--erp-card-radius); padding: var(--erp-card-padding); background: rgba(8,28,49,0.62); border: 1px solid rgba(248,223,155,0.2); color: white; backdrop-filter: blur(16px); box-shadow: 0 16px 42px rgba(0,0,0,0.16); }
      .insight-card span { display: block; color: rgba(255,255,255,0.62); font-size: var(--erp-section-label); line-height: 1.25; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
      .insight-card strong { display: block; margin-top: 8px; font-size: 22px; line-height: 1.12; color: var(--gold-300); letter-spacing: -0.03em; }
      .insight-card p { margin: 8px 0 0; color: rgba(255,255,255,0.72); line-height: 1.45; font-size: var(--erp-card-description); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .insight-card--success { border-color: rgba(55,211,130,0.28); }
      .insight-card--success strong { color: var(--success); }
      .insight-card--warning { border-color: rgba(246,184,81,0.3); }
      .insight-card--warning strong { color: var(--warning); }
      .insight-card--danger { border-color: rgba(255,107,107,0.3); }
      .insight-card--danger strong { color: var(--danger); }
      .two-column--dashboard { align-items: start; }
      .notification-center-card { min-height: 100%; }
      .notification-list { display: grid; gap: 12px; margin-top: 16px; }
      .notification-item { display: grid; grid-template-columns: 14px 1fr; gap: 12px; align-items: start; border-radius: 18px; padding: 13px; background: rgba(255,255,255,0.08); border: 1px solid rgba(248,223,155,0.18); }
      .notification-item strong { display: block; color: var(--gold-300); margin-bottom: 4px; }
      .notification-item span { display: -webkit-box; color: rgba(255,255,255,0.72); line-height: 1.45; font-size: var(--erp-card-description); -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .notification-dot { width: 12px; height: 12px; margin-top: 4px; border-radius: 999px; background: var(--gold-400); box-shadow: 0 0 0 5px rgba(248,223,155,0.08); }
      .notification-item--success .notification-dot { background: var(--success); box-shadow: 0 0 0 5px rgba(55,211,130,0.1); }
      .notification-item--warning .notification-dot { background: var(--warning); box-shadow: 0 0 0 5px rgba(246,184,81,0.1); }
      .notification-item--danger .notification-dot { background: var(--danger); box-shadow: 0 0 0 5px rgba(255,107,107,0.1); }
      .notification-item--info .notification-dot { background: #69b7ff; box-shadow: 0 0 0 5px rgba(105,183,255,0.1); }
      .notification-item--gold .notification-dot { background: var(--gold-300); }
      .premium-panel, .metric-card, .action-card, .history-card, .notice-card, .insight-card, .notification-item { -webkit-font-smoothing: antialiased; }
      .primary-button:focus-visible, .secondary-button:focus-visible, .logout-button:focus-visible, .nav-item:focus-visible, .action-card:focus-visible, .role-pill:focus-visible { outline: 3px solid rgba(248,223,155,0.68); outline-offset: 3px; }
      .portal-header h1 { text-wrap: balance; }
      .portal-header span, .work-panel p, .action-card span, .status-row, .history-meta { color: rgba(255,255,255,0.76); }
      .logout-button { min-height: 42px; }



      /* Day 38 unified dashboard rhythm system */
      .portal-content { padding: 28px 30px 34px; gap: 18px; }
      .portal-header { margin-bottom: 8px; align-items: flex-start; }
      .portal-header h1 { margin: 2px 0 6px; font-size: clamp(30px, 3.5vw, 44px); line-height: 1.04; }
      .workspace-title { margin-top: 4px; line-height: 1.28; }
      .workspace-subtitle { margin-top: 6px; line-height: 1.42 !important; max-width: 760px; }
      .executive-hero { min-height: 206px; grid-template-columns: minmax(0,1.4fr) minmax(280px,0.6fr); padding: 22px; margin-bottom: 0; background: linear-gradient(145deg, rgba(8, 28, 49, 0.74), rgba(3, 10, 20, 0.74)); overflow: hidden; }
      .executive-hero::after { content: ''; position: absolute; right: 6%; bottom: -52px; width: 190px; height: 190px; border-radius: 999px; background: url('/branding/vidyasetu-logo.png') center/contain no-repeat; opacity: 0.045; pointer-events: none; }
      .executive-hero h2 { font-size: clamp(30px, 3.1vw, 42px); line-height: 1.06; margin: 8px 0 8px; }
      .executive-hero p { max-width: 760px; line-height: 1.48; margin-bottom: 0; }
      .hero-chip-row { margin-top: 16px; }
      .executive-focus-card { background: linear-gradient(145deg, #fff8e7, #f8df9b); border-color: rgba(214,168,79,0.42); color: var(--navy-950); box-shadow: 0 18px 38px rgba(0,0,0,0.18); }
      .executive-focus-card span { color: var(--gold-700); }
      .executive-focus-card strong { color: var(--navy-950); line-height: 1.18; }
      .executive-focus-card p { color: var(--ink-700); }
      .dashboard-grid { gap: 16px; }
      .metric-card { min-height: 152px; padding: 18px; background: linear-gradient(145deg, #fff8e7, #f5dda0); border-color: rgba(214,168,79,0.5); box-shadow: 0 18px 38px rgba(0,0,0,0.18); }
      .metric-card p { color: var(--gold-700); }
      .metric-card strong { color: var(--navy-950) !important; font-size: 28px; }
      .metric-card span { color: var(--ink-700); }
      .metric-card__trend { background: rgba(10,29,50,0.08); border-color: rgba(10,29,50,0.1); color: var(--navy-900) !important; }
      .work-panel { padding: 22px; }
      .work-panel h2 { margin-bottom: 8px; line-height: 1.14; }
      .work-panel > p:not(.eyebrow) { margin-bottom: 0; line-height: 1.45; }
      .action-grid { gap: 14px; }
      .action-card { min-height: 142px; background: linear-gradient(145deg, #fff8e7, #f8df9b); border-color: rgba(214,168,79,0.5); color: var(--navy-950); box-shadow: 0 14px 30px rgba(0,0,0,0.14); }
      .action-card:hover { background: linear-gradient(145deg, #fff6dc, #f4d37d); border-color: rgba(214,168,79,0.7); }
      .action-card strong { color: var(--navy-950); margin: 10px 0 6px; }
      .action-card span { color: var(--ink-700); line-height: 1.44; }
      .action-card-icon { color: var(--gold-700) !important; }
      .notification-item { background: rgba(255,248,231,0.96); border-color: rgba(214,168,79,0.44); }
      .notification-item strong { color: var(--navy-950); }
      .notification-item span { color: var(--ink-700); }
      .two-column--dashboard { gap: 18px; }

      @media (max-width: 1180px) { .portal-shell { grid-template-columns: 280px minmax(0, 1fr); } .dashboard-grid { grid-template-columns: 1fr 1fr; } .action-grid { grid-template-columns: 1fr 1fr; } .executive-hero { grid-template-columns: 1fr; } .insight-grid { grid-template-columns: 1fr 1fr 1fr; } }
      @media (max-width: 920px) { .portal-shell { grid-template-columns: 1fr; } .sidebar { position: static; max-height: 42vh; } .two-column, .day23-hero, .day23-layout, .day25-hero, .day25-split, .executive-hero { grid-template-columns: 1fr; } .day25-gate-grid, .insight-grid { grid-template-columns: 1fr 1fr; } .portal-header { flex-direction: column; } .header-actions { justify-content: flex-start; } }
      .erp-section { width: 100%; }
      @media (max-width: 680px) { .portal-content { padding: 18px; gap: 16px; } .dashboard-grid, .action-grid, .day25-gate-grid, .form-grid, .role-switch, .insight-grid { grid-template-columns: 1fr; } .executive-hero h2 { font-size: 32px; } .metric-card { min-height: 144px; } .hero-chip-row { gap: 8px; } .day23-table-header, .day25-section-header { flex-direction: column; } .day23-action { grid-template-columns: 42px 1fr; } .day23-action em { grid-column: 2; justify-self: flex-start; } }


      /* Day 2 web ERP MVP polish overrides */
      .portal-shell { grid-template-columns: 300px minmax(0, 1fr); }
      .sidebar { padding: 18px; }
      .brand-block { margin-bottom: 14px; padding: 11px; }
      .nav-list { gap: 14px; }
      .nav-group { display: grid; gap: 6px; }
      .nav-group-label { margin: 0 0 2px 4px; color: rgba(248,223,155,0.58); font-size: 10px; line-height: 1.2; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
      .nav-item { grid-template-columns: 34px 1fr; gap: 10px; padding: 9px 10px; border-radius: 16px; }
      .nav-icon { width: 34px; height: 34px; border-radius: 13px; font-size: 16px; }
      .nav-item strong { font-size: 13px; line-height: 1.18; }
      .nav-item small { font-size: 11px; line-height: 1.22; -webkit-line-clamp: 1; }
      .nav-item:hover, .nav-item--active { transform: none; }

      .portal-content { padding: 24px 26px 30px; gap: 16px; }
      .portal-header { margin-bottom: 4px; }
      .portal-header h1 { font-size: clamp(28px, 3vw, 40px); line-height: 1.04; margin: 0 0 6px; }
      .workspace-title { font-size: clamp(15px, 1.45vw, 19px); line-height: 1.25; }
      .workspace-subtitle { font-size: 13px; line-height: 1.4 !important; max-width: 720px; }
      .session-identity { margin-top: 7px; font-size: 12px; }
      .user-chip { padding: 8px 12px; font-size: 12px; }
      .logout-button { min-height: 38px; padding: 10px 15px; }

      .executive-hero { min-height: 132px; padding: 20px 22px; display: block; }
      .executive-hero h2 { font-size: clamp(26px, 2.6vw, 34px); margin: 6px 0 6px; line-height: 1.05; }
      .executive-hero p:not(.eyebrow) { max-width: 860px; font-size: 14px; line-height: 1.42; color: rgba(255,255,255,0.74); }
      .executive-hero::after { width: 150px; height: 150px; right: 4%; bottom: -58px; opacity: 0.038; }

      .work-panel { padding: 20px; border-radius: 24px; }
      .work-panel h2 { margin: 0; font-size: 21px; line-height: 1.12; }
      .section-heading-row { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
      .section-heading-row--compact { margin-bottom: 12px; }
      .section-count { border-radius: 999px; padding: 7px 10px; color: var(--navy-950); background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); font-size: 11px; line-height: 1.1; font-weight: 950; white-space: nowrap; }
      .action-grid { margin-top: 0; }
      .action-grid--primary { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
      .action-list { display: grid; gap: 10px; }
      .action-card { min-height: 132px; padding: 16px; border-radius: 20px; }
      .action-card strong { margin: 9px 0 5px; font-size: 15px; line-height: 1.18; }
      .action-card span { font-size: 12.5px; line-height: 1.38; }
      .action-card-icon { width: 38px; height: 38px; border-radius: 14px; font-size: 19px !important; }
      .action-card--compact { min-height: auto; display: grid; grid-template-columns: 38px 1fr; column-gap: 12px; row-gap: 2px; align-items: center; padding: 13px; }
      .action-card--compact .action-card-icon { grid-row: span 2; }
      .action-card--compact strong { margin: 0; }
      .action-card--compact span:not(.action-card-icon) { -webkit-line-clamp: 1; }
      .two-column--dashboard { grid-template-columns: 1fr 0.88fr; gap: 16px; }
      .notification-list { margin-top: 0; gap: 10px; }
      .notification-item { padding: 12px; border-radius: 16px; }
      .notification-item strong { margin-bottom: 3px; font-size: 13px; line-height: 1.18; }
      .notification-item span { font-size: 12.5px; line-height: 1.36; }
      .notification-dot { width: 10px; height: 10px; margin-top: 4px; }

      @media (max-width: 1180px) {
        .portal-shell { grid-template-columns: 260px minmax(0, 1fr); }
        .action-grid--primary { grid-template-columns: 1fr 1fr; }
        .two-column--dashboard { grid-template-columns: 1fr; }
      }
      @media (max-width: 920px) {
        .portal-shell { grid-template-columns: 1fr; }
        .sidebar { position: static; max-height: none; }
        .nav-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .nav-group { align-content: start; }
        .portal-header { flex-direction: column; }
        .header-actions { justify-content: flex-start; }
      }
      @media (max-width: 680px) {
        .portal-content { padding: 18px; }
        .nav-list, .action-grid--primary { grid-template-columns: 1fr; }
        .section-heading-row { flex-direction: column; }
        .section-count { align-self: flex-start; }
        .executive-hero h2 { font-size: 28px; }
      }

    `}</style>
  );
}
