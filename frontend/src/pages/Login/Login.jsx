import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import SideBar2 from '../../components/SideBar2';
import Button from '../../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard');
    } catch (error) {
      setError('Não foi possível entrar. Confira seu e-mail e senha.');
    }
  };

  const handleEsqueciSenha = async () => {
    setError('');
    if (!email.trim()) {
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
    <main className="login-page">
      <SideBar2 />
      <section className="login-content">
        <div className="login-box">
          <header className="login-header">
            <h2>Bem-vindo de volta</h2>
            <p>Acesse o sistema AttoClinic</p>
          </header>
          <form onSubmit={handleLogin} className="login-form">
            <div className="campo-formulario">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="campo-formulario">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <div className="esqueci-senha">
              <Button
                label="Esqueci minha senha"
                variant="link"
                type="button"
                onClick={handleEsqueciSenha}
              />
            </div>
            {error && (
              <p className="mensagem-erro">{error}</p>
            )}
            <Button label="Entrar" type="submit" />
            <div className="login-divider">
              <span></span>
              <p>ou</p>
              <span></span>
            </div>
            <Button
              label="Criar sua conta"
              variant="secondary"
              onClick={() => navigate('/cadastro')}
            />
          </form>
          <footer className="login-footer">
            © 2026 AttoClinic · Clínica Odontológica
          </footer>
        </div>
      </section>
    </main>
  );
}