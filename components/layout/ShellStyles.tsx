export default function ShellStyles() {
  return (
      <style>{`
      :root {
        --navy-950: #061321;
        --navy-900: #0a1d32;
        --navy-800: #102943;
        --gold-600: #b9822e;
        --gold-500: #d6a84f;
        --gold-400: #edc873;
        --gold-300: #f8df9b;
        --cream-50: #fff8e7;
        --ink-900: #142033;
        --ink-700: #475569;
        --ink-600: #64748b;
        --success: #1f7a4d;
        --warning: #a86412;
        --danger: #a93535;
        --shadow-soft: 0 22px 60px rgba(6, 19, 33, 0.16);
      }

      * { box-sizing: border-box; }
      a { color: inherit; text-decoration: none; }
      button, input, select { font: inherit; }
      body { margin: 0; }

      .page-dark, .page-gold {
        position: relative;
        overflow: hidden;
        background-size: cover;
        background-position: center;
      }
      .page-dark { background-image: linear-gradient(135deg, rgba(3, 12, 24, 0.94), rgba(9, 31, 53, 0.9)), url('/branding/splash-dark.png'); }
      .page-gold { background-image: linear-gradient(135deg, rgba(255, 248, 230, 0.94), rgba(245, 218, 148, 0.82)), url('/branding/splash-gold.png'); }
      .page-dark::before, .page-gold::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image: radial-gradient(circle at top right, rgba(248, 223, 155, 0.18), transparent 35%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.08), transparent 38%);
      }

      .portal-shell { display: grid; grid-template-columns: 322px minmax(0, 1fr); min-height: 100vh; }
      .sidebar { position: relative; z-index: 1; padding: 24px; border-right: 1px solid rgba(244, 213, 141, 0.2); background: rgba(4, 16, 31, 0.78); backdrop-filter: blur(20px); overflow-y: auto; }
      .brand-block { display: flex; gap: 14px; align-items: center; color: white; margin-bottom: 24px; padding: 12px; border-radius: 22px; background: rgba(255,255,255,0.08); border: 1px solid rgba(244, 213, 141, 0.18); }
      .brand-block span { display: block; color: rgba(255,255,255,0.62); font-size: 13px; margin-top: 3px; }
      .brand-mark { width: 52px; height: 52px; border-radius: 18px; object-fit: cover; box-shadow: 0 15px 32px rgba(214,168,79,0.24); }
      .nav-list { display: flex; flex-direction: column; gap: 9px; }
      .nav-item { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: center; padding: 12px; border-radius: 18px; color: rgba(255,255,255,0.82); border: 1px solid transparent; transition: 160ms ease; }
      .nav-item:hover, .nav-item--active { background: rgba(255,255,255,0.11); border-color: rgba(244, 213, 141, 0.32); transform: translateX(2px); }
      .nav-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 15px; background: rgba(255,255,255,0.1); }
      .nav-item strong { display: block; font-size: 14px; }
      .nav-item small { display: block; color: rgba(255,255,255,0.55); margin-top: 2px; line-height: 1.35; }
      .sidebar-footer { margin-top: 18px; padding: 14px; border-radius: 18px; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(244, 213, 141, 0.14); font-size: 12px; line-height: 1.5; }

      .portal-content { position: relative; z-index: 1; padding: 34px; min-width: 0; }
      .portal-header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; color: white; margin-bottom: 24px; }
      .portal-header h1 { margin: 4px 0 8px; font-size: clamp(30px, 4vw, 48px); letter-spacing: -0.045em; line-height: 1.02; }
      .portal-header span { color: rgba(255,255,255,0.72); line-height: 1.55; display: block; max-width: 780px; }
      .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
      .user-chip { padding: 10px 14px; border-radius: 999px; color: white; background: rgba(255,255,255,0.1); border: 1px solid rgba(244, 213, 141, 0.2); font-size: 13px; font-weight: 800; }
      .eyebrow { color: var(--gold-300); font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
      .logout-button, .primary-button, .secondary-button { border: 0; border-radius: 999px; font-weight: 900; padding: 12px 18px; cursor: pointer; transition: 160ms ease; }
      .logout-button, .primary-button { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); box-shadow: 0 16px 34px rgba(214,168,79,0.22); }
      .secondary-button { background: rgba(255,255,255,0.14); color: white; border: 1px solid rgba(244, 213, 141, 0.22); }
      .logout-button:hover, .primary-button:hover, .secondary-button:hover { transform: translateY(-1px); }

      .dashboard-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
      .metric-card { border-radius: 24px; padding: 20px; background: rgba(255,255,255,0.95); border: 1px solid rgba(214,168,79,0.24); box-shadow: var(--shadow-soft); }
      .metric-card p { margin: 0; color: var(--ink-600); font-weight: 800; }
      .metric-card strong { display: block; font-size: 34px; margin: 8px 0; color: var(--ink-900); }
      .metric-card span { color: var(--ink-600); font-size: 13px; line-height: 1.45; }
      .metric-card--success strong { color: var(--success); }
      .metric-card--warning strong { color: var(--warning); }
      .metric-card--danger strong { color: var(--danger); }

      .gold-panel { background: linear-gradient(145deg, rgba(255,252,241,0.97), rgba(255,241,199,0.94)); border: 1px solid rgba(214,168,79,0.32); box-shadow: var(--shadow-soft); }
      .glass-panel { background: rgba(255,255,255,0.1); border: 1px solid rgba(244,213,141,0.18); box-shadow: 0 22px 60px rgba(0,0,0,0.16); backdrop-filter: blur(16px); }
      .work-panel, .page-card { border-radius: 28px; padding: 24px; color: var(--ink-900); }
      .work-panel h2, .page-card h2 { margin: 0 0 10px; font-size: 28px; letter-spacing: -0.03em; }
      .work-panel p, .page-card p { color: var(--ink-700); line-height: 1.58; }
      .action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
      .action-card { border-radius: 22px; padding: 18px; background: white; border: 1px solid rgba(214,168,79,0.2); color: var(--ink-900); }
      .action-card strong { display: block; margin: 8px 0 4px; }
      .action-card span { color: var(--ink-600); font-size: 13px; line-height: 1.45; }
      .two-column { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; align-items: stretch; }
      .status-list { display: grid; gap: 10px; margin-top: 14px; }
      .status-row { display: flex; justify-content: space-between; gap: 14px; padding: 13px 14px; border-radius: 16px; background: rgba(255,255,255,0.74); border: 1px solid rgba(214,168,79,0.18); color: var(--ink-700); }
      .status-row strong { color: var(--ink-900); }

      .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .login-card { width: min(490px, 100%); border-radius: 34px; padding: 30px; position: relative; z-index: 1; }
      .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .login-logo img { width: 56px; height: 56px; border-radius: 18px; object-fit: cover; }
      .login-card h1 { margin: 8px 0 8px; font-size: 38px; letter-spacing: -0.04em; color: var(--ink-900); }
      .login-copy { color: var(--ink-600); line-height: 1.55; }
      .login-card label { display: grid; gap: 8px; margin-top: 16px; font-weight: 800; color: var(--ink-900); }
      .login-card input { border: 1px solid rgba(13,23,38,0.12); border-radius: 16px; padding: 13px 14px; background: white; outline: none; color: var(--ink-900); }
      .role-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 18px 0; }
      .role-pill { border: 1px solid rgba(13,23,38,0.12); border-radius: 999px; padding: 11px; background: white; cursor: pointer; font-weight: 900; color: var(--ink-600); }
      .role-pill--active { background: var(--navy-950); color: var(--gold-300); border-color: var(--gold-500); }
      .login-card .primary-button { width: 100%; margin-top: 22px; }
      .dev-note { display: block; margin-top: 14px; color: var(--ink-600); line-height: 1.45; }

      @media (max-width: 1100px) { .portal-shell { grid-template-columns: 1fr; } .sidebar { position: static; } .dashboard-grid, .action-grid { grid-template-columns: 1fr 1fr; } .two-column { grid-template-columns: 1fr; } }
      @media (max-width: 680px) { .portal-content { padding: 20px; } .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .portal-header { flex-direction: column; } .header-actions { justify-content: flex-start; } }
    `}</style>
  );
}
