import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Veiculos } from './pages/Veiculos';
import { Funcionarios } from './pages/Funcionarios';
import { OrdensServico } from './pages/OrdensServico';
import { OrdemServicoDetalhe } from './pages/OrdemServicoDetalhe';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="veiculos" element={<Veiculos />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="ordens" element={<OrdensServico />} />
            <Route path="ordens/:id" element={<OrdemServicoDetalhe />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
