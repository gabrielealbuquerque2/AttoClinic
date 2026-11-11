import { Card } from 'react-bootstrap';

// Card de indicador (ícone + título + valor + detalhe).
// tom: success | danger | warning | info | primary | secondary
export default function IndicatorCard({ icone, tom = 'primary', titulo, valor, detalhe }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <span
          className={`indicador-icone bg-${tom}-subtle text-${tom}-emphasis`}
          aria-hidden="true"
        >
          {icone}
        </span>
        <div className="min-w-0">
          <div className="small text-secondary">{titulo}</div>
          <div className="fs-4 fw-bold lh-sm">{valor}</div>
          {detalhe && <div className="small text-secondary">{detalhe}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}
