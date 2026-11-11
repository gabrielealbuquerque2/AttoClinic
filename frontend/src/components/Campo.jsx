import { Form } from 'react-bootstrap';

export default function Campo({
  id,
  label,
  obrigatorio = false,
  erro = '',
  tipo = 'input',
  className = 'mb-3',
  children,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  rows = 3
}) {

  return (
    <Form.Group controlId={id} className={className}>

      {/* Label */}
      <Form.Label className="small fw-semibold mb-1">
        {label}

        {obrigatorio && (
          <span className="text-danger"> *</span>
        )}
      </Form.Label>

      {/* Select ou campo de texto */}
      {tipo === 'select' ? (
        <Form.Select
          value={value}
          onChange={onChange}
          isInvalid={Boolean(erro)}
        >
          {children}
        </Form.Select>
      ) : (
        <Form.Control
          as={tipo === 'textarea' ? 'textarea' : 'input'}
          type={type}
          rows={tipo === 'textarea' ? rows : undefined}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          isInvalid={Boolean(erro)}
        />
      )}

      {/* Mensagem de erro */}
      {erro && (
        <Form.Control.Feedback type="invalid">
          {erro}
        </Form.Control.Feedback>
      )}

    </Form.Group>
  );
}