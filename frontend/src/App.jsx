import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProdutosPage from './pages/ProdutosPage';

const TITULOS = {
  produtos: 'Produtos',
  pedidos: 'Pedidos',
  entregas: 'Entregas',
  dashboard: 'Dashboard',
};

export default function App() {
  const [menuAberto, setMenuAberto] = useState(true);
  const [pagina, setPagina] = useState('produtos');

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A2E1F]">
      <Sidebar
        aberto={menuAberto}
        onAlternar={() => setMenuAberto((v) => !v)}
        ativo={pagina}
        onNavegar={setPagina}
      />

      <div
        className={`transition-[padding] duration-200 ${
          menuAberto ? 'pl-60' : 'pl-16'
        }`}
      >
        <header className="h-14 border-b border-[#E9E9E1] bg-white flex items-center px-8">
          <h1 className="font-medium">{TITULOS[pagina]}</h1>
        </header>

        <main className="px-8 py-10 pb-28 max-w-4xl">
          {pagina === 'produtos' && <ProdutosPage />}
        </main>
      </div>
    </div>
  );
}