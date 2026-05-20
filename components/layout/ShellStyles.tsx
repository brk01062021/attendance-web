export default function ShellStyles() {
  return (
    <style>{`
      .portal-shell { display: grid; grid-template-columns: 320px minmax(0, 1fr); min-height: 100vh; }
      .sidebar { padding: 24px; border-right: 1px solid rgba(244, 213, 141, 0.18); background: rgba(7, 20, 38, 0.82); backdrop-filter: blur(18px); }
      .brand-block { display: flex; gap: 14px; align-items: center; color: white; margin-bottom: 26px; }
      .brand-block span { display: block; color: rgba(255,255,255,0.62); font-size: 13px; margin-top: 3px; }
      .brand-mark { width: 48px; height: 48px; border-radius: 18px; display: grid; place-items: center; background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); font-weight: 900; }
      .nav-list { display: flex; flex-direction: column; gap: 10px; }
      .nav-item { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: center; padding: 13px; border-radius: 18px; color: rgba(255,255,255,0.82); border: 1px solid transparent; transition: 160ms ease; }
      .nav-item:hover, .nav-item--active { background: rgba(255,255,255,0.1); border-color: rgba(244, 213, 141, 0.28); transform: translateX(2px); }
      .nav-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 15px; background: rgba(255,255,255,0.1); }
      .nav-item strong { display: block; font-size: 14px; }
      .nav-item small { display: block; color: rgba(255,255,255,0.55); margin-top: 2px; line-height: 1.35; }
      .portal-content { padding: 34px; min-width: 0; }
      .portal-header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; color: white; margin-bottom: 24px; }
      .portal-header h1 { margin: 4px 0 8px; font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.04em; }
      .portal-header span { color: rgba(255,255,255,0.7); }
      .eyebrow { color: var(--gold-300); font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
      .logout-button, .primary-button { border: 0; border-radius: 999px; background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); color: var(--navy-950); font-weight: 900; padding: 12px 18px; cursor: pointer; box-shadow: 0 16px 34px rgba(214,168,79,0.22); }
      .dashboard-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
      .metric-card { border-radius: 24px; padding: 20px; background: rgba(255,255,255,0.95); border: 1px solid rgba(214,168,79,0.24); box-shadow: var(--shadow-soft); }
      .metric-card p { margin: 0; color: var(--ink-600); font-weight: 800; }
      .metric-card strong { display: block; font-size: 34px; margin: 8px 0; color: var(--ink-900); }
      .metric-card span { color: var(--ink-600); font-size: 13px; }
      .work-panel { border-radius: 28px; padding: 24px; color: var(--ink-900); }
      .work-panel h2 { margin: 0 0 10px; }
      .action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
      .action-card { border-radius: 22px; padding: 18px; background: white; border: 1px solid rgba(214,168,79,0.2); }
      .action-card strong { display: block; margin: 8px 0 4px; }
      .action-card span { color: var(--ink-600); font-size: 13px; line-height: 1.45; }
      .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .login-card { width: min(460px, 100%); border-radius: 34px; padding: 30px; }
      .login-card h1 { margin: 8px 0 8px; font-size: 38px; letter-spacing: -0.04em; }
      .login-copy { color: var(--ink-600); line-height: 1.55; }
      .login-card label { display: grid; gap: 8px; margin-top: 16px; font-weight: 800; color: var(--ink-900); }
      .login-card input { border: 1px solid rgba(13,23,38,0.12); border-radius: 16px; padding: 13px 14px; background: white; outline: none; }
      .role-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 18px 0; }
      .role-pill { border: 1px solid rgba(13,23,38,0.12); border-radius: 999px; padding: 11px; background: white; cursor: pointer; font-weight: 900; color: var(--ink-600); }
      .role-pill--active { background: var(--navy-950); color: var(--gold-300); border-color: var(--gold-500); }
      .login-card .primary-button { width: 100%; margin-top: 22px; }
      .dev-note { display: block; margin-top: 14px; color: var(--ink-600); line-height: 1.45; }
      @media (max-width: 1000px) { .portal-shell { grid-template-columns: 1fr; } .sidebar { position: static; } .dashboard-grid, .action-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 640px) { .portal-content { padding: 20px; } .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .portal-header { flex-direction: column; } }
    `}</style>
  );
}
