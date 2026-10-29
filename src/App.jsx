import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pacientes from "./pages/Pacientes/Pacientes";
import Prontuario from "./pages/Prontuario/Prontuario";
import Relatorios from "./pages/Relatorios/Relatorios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pacientes />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/prontuarios" element={<Prontuario />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;