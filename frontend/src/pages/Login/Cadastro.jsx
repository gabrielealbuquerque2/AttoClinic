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
        >
          <option value="">Selecione sua função</option>
          <option value="Dentista">Gestor</option>
          <option value="Administrador">Funcionario(a)</option>
        </Campo>

        <Campo
          id="cadastro-senha"
          label="Senha"
          obrigatorio
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          minLength={6}
          className=""
          required
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
        />

        {error && (
          <Alert variant="danger" className="py-2 mb-0">
            {error}
          </Alert>
        )}

        <Button type="submit" className="py-2 fw-semibold">
          Criar conta
        </Button>
      </Form>
    </AuthLayout>
  );
}
