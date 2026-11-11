import { Container, Row, Col } from 'react-bootstrap';
import SideBar2 from './SideBar2';

// Estrutura de Login e Cadastro: painel azul à esquerda + formulário à direita.
export default function AuthLayout({ children }) {
  return (
    <Container fluid as="main" className="auth-split p-0">
      <Row className="g-0 min-vh-100">
        <Col md={6} className="d-flex">
          <SideBar2 />
        </Col>

        <Col
          md={6}
          as="section"
          className="auth-painel bg-white d-flex align-items-center justify-content-center p-4 p-md-5"
        >
          <div className="w-100" style={{ maxWidth: 432 }}>
            {children}
            <footer className="text-center text-secondary small mt-4">
              © 2026 AttoClinic · Clínica Odontológica
            </footer>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
