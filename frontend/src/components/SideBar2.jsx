
export default function SideBar2() {
  return (
    <aside className="side-bar2">
      <div className="sidebar2-conteudo">

        <div className="sidebar2-logo">
          <i className="bi bi-tooth"></i>

          <h1>
            Atto<span>Clinic</span>
          </h1>
        </div>

        <div className="sidebar2-frase">
          <div className="sidebar2-linha"></div>

          <h2>
            Gestão dental
            <br />
            inteligente e <span>eficiente.</span>
          </h2>
        </div>

        <div className="sidebar2-recursos">

          <div className="sidebar2-recurso">
            <i className="bi bi-calendar-week"></i>
            <span>Agenda</span>
          </div>

          <div className="sidebar2-recurso">
            <i className="bi bi-people"></i>
            <span>Pacientes</span>
          </div>

          <div className="sidebar2-recurso">
            <i className="bi bi-bar-chart-line"></i>
            <span>Relatórios</span>
          </div>

          <div className="sidebar2-recurso">
            <i class="bi bi-prescription2"></i>
            <span>Tratamentos</span>
          </div>

        </div>
      </div>
    </aside>
  );
}
