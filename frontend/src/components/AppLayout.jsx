import Sidebar from './SideBar';

// Estrutura das telas internas: menu lateral fixo + conteúdo com rolagem própria.
export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
