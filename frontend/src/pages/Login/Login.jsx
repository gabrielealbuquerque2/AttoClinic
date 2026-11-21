import { useState } from 'react';                        // guarda informacoes que podem mudar durante o uso da tela 
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import AuthLayout from '../../components/AuthLayout';
import Campo from '../../components/Campo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();   // impede de recarregar a pagina
    setError('');         // apaga qualquer mensagem de erro anterior
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard');
    } catch (error) {
      setError('Não foi possível entrar. Confira seu e-mail e senha.');
    }
  };

  const handleEsqueciSenha = async () => {
    setError('');
    if (!email.trim()) {    // remove espaços
      setError('Digite seu e-mail antes de recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Enviamos um link de recuperação para seu e-mail! Confira também a caixa de spam.');
    } catch (error) {
      setError('Não foi possível enviar o e-mail de recuperação. Confira o endereço digitado.');
      console.error(error);
    }
  };

  return (
    <AuthLayout>
      <header className="mb-4">
        <h2 className="fs-3 fw-bold mb-1">Bem-vindo de volta</h2>
        <p className="text-secondary mb-0">Acesse o sistema AttoClinic</p>
      </header>

      <Form onSubmit={handleLogin} className="d-grid gap-3">   
        <Campo // quando o form for enviado, executa a funcao handlelogin
          id="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className=""
          required
        />

        <Campo
          id="senha"
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className=""
          required
        />

        <div className="text-end">
          <Button variant="link" size="sm" className="p-0" onClick={handleEsqueciSenha}>
            Esqueci minha senha
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 mb-0">
            {error}
          </Alert>
        )}

        {/* nao recebe navigate pq ta ligado ao form, que executa o handlelogin */}
        <Button type="submit" className="py-2 fw-semibold"> 
          Entrar
        </Button>

        <div className="d-flex align-items-center gap-3 text-secondary small">
          <hr className="flex-grow-1 m-0" />
          ou
          <hr className="flex-grow-1 m-0" />
        </div>

        <Button
          variant="outline-primary"
          className="py-2 fw-semibold"
          onClick={() => navigate('/cadastro')}
        >
          Criar sua conta
        </Button>
      </Form>
    </AuthLayout>
  );
}
