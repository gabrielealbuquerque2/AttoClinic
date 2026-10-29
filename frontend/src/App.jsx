import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Cadastro from './pages/Login/Cadastro';
import './App.css';

function App() {
return ( 
  <BrowserRouter> 
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/cadastro" element={<Cadastro />} />
    </Routes> 
  </BrowserRouter>
);
}

export default App;
