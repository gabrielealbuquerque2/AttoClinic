export default function PageHeader({ titulo, subtitulo, children }) {
  return (
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="fs-3 fw-bold mb-1">{titulo}</h1>
        {subtitulo && <div className="text-secondary">{subtitulo}</div>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
