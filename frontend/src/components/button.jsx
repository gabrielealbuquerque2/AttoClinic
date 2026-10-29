export default function Button({
  label,
  type = 'button',
  variant = 'primary',
  onClick
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`botao-principal botao-${variant}`}
    >
      {label}
    </button>
  );
}