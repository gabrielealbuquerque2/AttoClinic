import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import api, { mensagemDeErro } from '../../services/api';
import AuthLayout from '../../components/AuthLayout';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Guarda a conta caso o Firebase cadastre, mas o mysql apresente algum erro
  const [usuarioFirebasePendente, setUsuarioFirebasePendente] = useState(null);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !email.trim() || !funcao) {
      setError('Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não são iguais.');
      return;
    }

    setSalvando(true);

    try {
      let usuario = usuarioFirebasePendente;

      // cria a conta no Firebase, caso ainda não tenha sido criada
      if (!usuario) {
        const conta = await createUserWithEmailAndPassword(auth, email, senha);

        usuario = conta.user;
        setUsuarioFirebasePendente(usuario);
      }

      // Atualiza o nome no Firebase
      await updateProfile(usuario, {
        displayName: nome.trim()
      });

      // Salva os dados do usuário no MySQL
      await api.post('/usuarios/post', {
        nome: nome.trim(),
        email: email.trim(),
        perfil: funcao,
        firebase_uid: usuario.uid
      });

      setUsuarioFirebasePendente(null);

      alert('Cadastro realizado com sucesso!');
      navigate('/login');

    } catch (error) {
      if (error.response) {  // erro retornado do back, mostra msg do servidor
        setError(mensagemDeErro(error, 'Erro ao salvar os dados no banco.'));
      } else { // erro sem resposta http, mostra msg do proprio erro
        setError(error.message || 'Não foi possível realizar o cadastro.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AuthLayout>
      <Form onSubmit={handleCadastro}>
        <h2>Cadastro</h2>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            disabled={!!usuarioFirebasePendente}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Função</Form.Label>
          <Form.Select
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            required
          >
            <option value="">Selecione sua função</option>
            <option value="gestor">Gestor</option>
            <option value="funcionario">Funcionário</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            disabled={!!usuarioFirebasePendente}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirmar senha</Form.Label>
          <Form.Control
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Confirme sua senha"
            disabled={!!usuarioFirebasePendente}
            required
          />
        </Form.Group>

        <Button
          type="submit"
          disabled={salvando}
          className="w-100"
        >
          {salvando ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </Form>
    </AuthLayout>
  );
}