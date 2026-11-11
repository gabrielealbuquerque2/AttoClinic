import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

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
      <div className="sidebar-logo d-flex align-items-center gap-3">
        <div className="sidebar-logo-icone">🦷</div>
        <h2 className="h5 fw-bold mb-0">AttoClinic</h2>
      </div>

      <Nav as="nav" className="sidebar-menu">
        <p className="sidebar-titulo">MENU PRINCIPAL</p>
        {linksMenu.map((link) => (
          <Nav.Link key={link.caminho} as={NavLink} to={link.caminho}>
            <span className="sidebar-icone">{link.icone}</span>
            {link.rotulo}
          </Nav.Link>
        ))}
      </Nav>

      <div className="sidebar-perfil d-flex align-items-center gap-3">
        <div className="sidebar-avatar">CM</div>
        <div>
          <h3 className="fs-6 fw-semibold mb-0">Dr. Lucas de Oliveira</h3>
          <small>Dentista</small>
        </div>
      </div>
    </aside>
  );
}
