import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

export function mensagemDeErro(erro, padrao = 'Não foi possível concluir a operação.') {
  if (!erro.response) return 'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.';
  return erro.response.data?.error ?? padrao;
}

export default api;