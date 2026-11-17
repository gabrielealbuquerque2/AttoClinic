// "2025-08-15" (ou "2025-08-15T..." ) -> "15/08/2025". Não usa Date para não sofrer com fuso horário.
export function dataParaISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeISO() {
  return dataParaISO(new Date());
}

export function mesAtual() {
  return hojeISO().slice(0, 7);
}

export function formatarData(valor) {
  if (!valor) return '—';
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// "09:00:00" -> "09:00"
export function formatarHora(valor) {
  return valor ? String(valor).slice(0, 5) : '—';
}

export function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Idade a partir de "AAAA-MM-DD"
export function calcularIdade(nascimento) {
  if (!nascimento) return null;
  const [ano, mes, dia] = String(nascimento).slice(0, 10).split('-').map(Number);
  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) idade -= 1;
  return idade;
}

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

const CORES = ['#e11d48', '#0284c7', '#9333ea', '#d97706', '#059669'];

// Cor fixa por paciente (mesmo id = mesma cor)
export function corDoAvatar(id = 0) {
  return CORES[Number(id) % CORES.length];
}
