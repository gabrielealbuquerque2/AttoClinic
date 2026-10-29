import { NavLink } from 'react-router-dom';

const linksMenu = [
    { caminho: '/dashboard', icone: '▦', rotulo: 'Dashboard' },
    { caminho: '/pacientes', icone: '♧', rotulo: 'Pacientes' },
    { caminho: '/agenda', icone: '▣', rotulo: 'Agenda' },
    { caminho: '/prontuario', icone: '▤', rotulo: 'Prontuários' },
    { caminho: '/financeiro', icone: '$', rotulo: 'Financeiro' },
    { caminho: '/estoque', icone: '⬡', rotulo: 'Estoque' },
    { caminho: '/relatorios', icone: '▥', rotulo: 'Relatórios' },
];

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
                {linksMenu.map((link) => (
                    <NavLink
                        key={link.caminho}
                        to={link.caminho}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' ativo' : ''}`
                        }
                    >
                        <span>{link.icone}</span>
                        {link.rotulo}
                    </NavLink>
                ))}
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