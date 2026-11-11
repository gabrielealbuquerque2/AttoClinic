import { Badge } from 'react-bootstrap';

// Cor de cada status do sistema (variantes do Bootstrap).
const variantes = {
  Ativo: 'success',
  Inativo: 'warning',
  Concluído: 'success',
  Confirmado: 'success',
  Aguardando: 'warning',
  Agendado: 'primary',
  Cancelado: 'danger',
  Normal: 'success',
  'Estoque Baixo': 'warning',
  'Próximo da Validade': 'info',
  Esgotado: 'danger',
  Vencido: 'dark',
  Pago: 'success',
  Pendente: 'warning',
  Receita: 'success',
  Despesa: 'danger',
  Entrada: 'success',
  Saída: 'danger',
};

export function varianteDe(status) {
  return variantes[status] ?? 'secondary';
}

export default function StatusBadge({ status, className = '', children }) {
  const variante = varianteDe(status);
  return (
    <Badge
      pill
      bg={`${variante}-subtle`}
      text={`${variante}-emphasis`}
      className={className}
    >
      {children ?? status}
    </Badge>
  );
}
