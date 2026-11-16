import axios from 'axios';

// Endereço do back-end. Para trocar, crie frontend/.env com VITE_API_URL=http://localhost:8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

// Texto de erro amigável a partir da resposta do back (ou da falta de conexão).
export function mensagemDeErro(erro, padrao = 'Não foi possível concluir a operação.') {
  if (!erro.response) return 'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.';
  return erro.response.data?.error ?? padrao;
}

export default api;
