export default function SideBar2() {
  return (
    <aside className="side-bar2">
      <div className="sidebar2-conteudo">
        <div className="sidebar2-logo">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 8 C5 12 7 24 12 31 C15 36 16 42 20 40 C23 39 22 28 25 28 C29 28 28 39 32 40 C36 42 37 33 40 27 C45 16 40 7 32 7 C28 7 27 11 23 11 C19 11 17 6 12 8Z" />
          </svg>
          <h1>Atto<span>Clinic</span></h1>
        </div>

        <div className="sidebar2-frase">
          <div className="sidebar2-linha"></div>
          <h2>Gestão dental<br />inteligente e <span>eficiente.</span></h2>
        </div>

        <div className="sidebar2-recursos">
          <div className="sidebar2-recurso">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="7" width="24" height="22" rx="2" />
              <path d="M10 3v8M22 3v8M4 13h24M10 18h3M18 18h3M10 23h3M18 23h3" />
            </svg>
            <span>Agenda</span>
          </div>

          <div className="sidebar2-recurso">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="10" r="5" />
              <path d="M3 27v-3a9 9 0 0 1 18 0v3H3Z" />
              <path d="M21 6a5 5 0 0 1 0 10M24 19a7 7 0 0 1 5 7v1h-5" />
            </svg>
            <span>Pacientes</span>
          </div>

          <div className="sidebar2-recurso">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 28V5M4 28h25" />
              <rect x="9" y="18" width="4" height="7" rx="1" />
              <rect x="17" y="12" width="4" height="13" rx="1" />
              <rect x="25" y="7" width="3" height="18" rx="1" />
              <path d="m8 14 7-5 5 2 7-7M23 4h4v4" />
            </svg>
            <span>Relatórios</span>
          </div>

          <div className="sidebar2-recurso">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 4C4 5 3 11 6 17c2 4 2 11 5 11s3-8 5-8 2 8 5 8 3-7 5-11c3-6 1-12-4-13-3 0-4 2-6 2S12 3 9 4Z" />
            </svg>
            <span>Tratamentos</span>
          </div>
        </div>
      </div>
    </aside>
  );
}