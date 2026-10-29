export default function Sidebar() {
    return (
        <aside className="sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <span>🦷</span>
                </div>

                <div>
                    <h2>OdontoGestão</h2>
                    <span>SISTEMA WEB</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="sidebar-menu">
                <p className="sidebar-titulo">MENU PRINCIPAL</p>

                <a href="/Dashboard" className="sidebar-link ativo">
                    <span>▦</span>
                    Dashboard
                </a>

                <a href="/Pacientes" className="sidebar-link">
                    <span>♧</span>
                    Pacientes
                </a>

                <a href="/Agenda" className="sidebar-link">
                    <span>▣</span>
                    Agenda
                </a>

                <a href="/Prontuarios" className="sidebar-link">
                    <span>▤</span>
                    Prontuários
                </a>

                <a href="/Financeiro" className="sidebar-link">
                    <span>$</span>
                    Financeiro
                </a>

                <a href="/Estoque" className="sidebar-link">
                    <span>⬡</span>
                    Estoque
                </a>

                <a href="/Relatorios" className="sidebar-link">
                    <span>▥</span>
                    Relatórios
                </a>
            </nav>

            {/* Perfil do dentista */}
            <div className="sidebar-perfil">
                <div className="sidebar-avatar">CM</div>

                <div>
                    <h3>Dr. Lucas de Oliveira</h3>
                    <p>Dentista</p>
                </div>
            </div>

        </aside>
    );
}