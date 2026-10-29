import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase';
import Button from '../../components/Button';
import SideBar2 from '../../components/SideBar2';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não são iguais.');
      return;
    }

    try {
      const resultado = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

      await updateProfile(resultado.user, {
        displayName: nome
      });

      navigate('/dashboard');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    }
  };

  return (
    <main className="cadastro-page">
      <SideBar2 />

      <section className="cadastro-content">
        <div className="cadastro-box">

          <button
            type="button"
            className="cadastro-voltar"
            onClick={() => navigate('/login')}
          >
            ‹ <span>Voltar ao login</span>
          </button>

          <header className="cadastro-header">
            <h2>Criar conta</h2>
            <p>Cadastre-se para acessar o Sistema AttoClinic</p>
          </header>

          <form
            className="cadastro-form"
            onSubmit={handleCadastro}
          >
            <div className="cadastro-campo">
              <label htmlFor="cadastro-nome">
                Nome completo <span>*</span>
              </label>

              <input
                id="cadastro-nome"
                type="text"
                placeholder="Dr. Lucas de Oliveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="cadastro-campo">
              <label htmlFor="cadastro-email">
                E-mail <span>*</span>
              </label>

              <input
                id="cadastro-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="cadastro-campo">
              <label htmlFor="cadastro-funcao">
                Função na clínica <span>*</span>
              </label>

              <select
                id="cadastro-funcao"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                required
              >
                <option value="">Selecione sua função</option>
                <option value="Dentista">Gestor</option>
                <option value="Administrador">Funcionario(a)</option>
              </select>
            </div>

            <div className="cadastro-campo">
              <label htmlFor="cadastro-senha">
                Senha <span>*</span>
              </label>

              <input
                id="cadastro-senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="cadastro-campo">
              <label htmlFor="cadastro-confirmar">
                Confirmar senha <span>*</span>
              </label>

              <input
                id="cadastro-confirmar"
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && (
              <p className="cadastro-erro">{error}</p>
            )}

            <Button
              label="Criar conta"
              type="submit"
            />
          </form>

          <footer className="cadastro-footer">
            © 2026 AttoClinic · Clínica Odontológica
          </footer>

        </div>
      </section>
    </main>
  );
}