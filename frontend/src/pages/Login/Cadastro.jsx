import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase';
import AuthLayout from '../../components/AuthLayout';
import Campo from '../../components/Campo';
import api, { mensagemDeErro } from '../../services/api';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [usuarioFirebasePendente, setUsuarioFirebasePendente] = useState(null);

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !email.trim() || !funcao) {
      setError('Preencha nome, e-mail e função na clínica.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não são iguais.');
      return;
    }

    setSalvando(true);
    try {
      let usuario = usuarioFirebasePendente;
      if (!usuario) {
        const resultado = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );
        usuario = resultado.user;
        setUsuarioFirebasePendente(usuario);
      }

      await updateProfile(usuario, {
        displayName: nome.trim()
      });

      const token = await usuario.getIdToken();
      try {
        await api.post('/usuarios/post', {
          nome: nome.trim(),
          email: email.trim(),
          perfil: funcao,
          firebase_uid: usuario.uid
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (erroApi) {
        setError(mensagemDeErro(erroApi, 'Não foi possível salvar o cadastro no banco de dados.'));
        return;
      }

      setUsuarioFirebasePendente(null);
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Digite um e-mail válido.');
      } else {
        setError('Não foi possível criar a conta no Firebase. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AuthLayout>
      <Button
        variant="link"
        className="p-0 mb-4 text-secondary text-decoration-none"
        onClick={() => navigate('/login')}
      >
        ‹ Voltar ao login
      </Button>

      <header className="mb-4">
        <h2 className="fs-3 fw-bold mb-1">Criar conta</h2>
        <p className="text-secondary mb-0">Cadastre-se para acessar o Sistema AttoClinic</p>
      </header>

      <Form onSubmit={handleCadastro} className="d-grid gap-3">
        <Campo
          id="cadastro-nome"
          label="Nome completo"
          obrigatorio
          placeholder="Dr. Lucas de Oliveira"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className=""
          required
          disabled={salvando}
        />

        <Campo
          id="cadastro-email"
          label="E-mail"
          obrigatorio
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className=""
          required
          disabled={Boolean(usuarioFirebasePendente) || salvando}
        />

        <Campo
          id="cadastro-funcao"
          label="Função na clínica"
          obrigatorio
          tipo="select"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className=""
          required
          disabled={salvando}
        >
          <option value="">Selecione sua função</option>
          <option value="gestor">Gestor</option>
          <option value="funcionario">Funcionario(a)</option>
        </Campo>

        <Campo
          id="cadastro-senha"
          label="Senha"
          obrigatorio
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}  // atualiza a senha a cada digitacao
          minLength={6}
          className=""
          required
          disabled={salvando || Boolean(usuarioFirebasePendente)}
        />

        <Campo
          id="cadastro-confirmar"
          label="Confirmar senha"
          obrigatorio
          type="password"
          placeholder="Repita a senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          minLength={6}
          className=""
          required
          disabled={salvando || Boolean(usuarioFirebasePendente)}
        />

        {error && (
          <Alert variant="danger" className="py-2 mb-0">
            {error}
          </Alert>
        )}

        <Button type="submit" className="py-2 fw-semibold" disabled={salvando}>
          {salvando ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </Form>
    </AuthLayout>
  );
}