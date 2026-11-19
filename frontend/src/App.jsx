import { useState, useEffect } from 'react';
import { authApi, salvarToken, limparToken, lerToken } from './services/api';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';
import ClientesPage from './pages/ClientesPage';
import PedidosPage from './pages/PedidosPage';
import EntregasPage from './pages/EntregasPage';

const TITULOS = {
  dashboard: 'Dashboard',
  produtos: 'Produtos',
  clientes: 'Clientes',
  pedidos: 'Pedidos',
  entregas: 'Entregas',
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(true);
  const [pagina, setPagina] = useState('dashboard');

  // Se já existe token guardado, valida com o servidor antes de confiar nele
  useEffect(() => {
    if (!lerToken()) {
      setVerificando(false);
      return;
    }
    authApi
      .eu()
      .then(setUsuario)
      .catch(() => limparToken())
      .finally(() => setVerificando(false));
  }, []);

  // Qualquer 401 vindo de qualquer tela derruba a sessão
  useEffect(() => {
    function aoExpirar() {
      setUsuario(null);
    }
    window.addEventListener('sessao-expirada', aoExpirar);
    return () => window.removeEventListener('sessao-expirada', aoExpirar);
  }, []);

  async function entrar(email, senha) {
    const { token, usuario } = await authApi.login(email, senha);
    salvarToken(token);
    setUsuario(usuario);
    setPagina('dashboard');
  }

  function sair() {
    limparToken();
    setUsuario(null);
  }

  if (verificando) {
    return <div className="min-h-screen bg-[#FAFAF7]" />;
  }

  if (!usuario) {
    return <LoginPage onEntrar={entrar} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A2E1F]">
      <Sidebar
        aberto={menuAberto}
        onAlternar={() => setMenuAberto((v) => !v)}
        ativo={pagina}
        onNavegar={setPagina}
        usuario={usuario}
        onSair={sair}
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
          {pagina === 'dashboard' && <DashboardPage />}
          {pagina === 'produtos' && <ProdutosPage />}
          {pagina === 'clientes' && <ClientesPage />}
          {pagina === 'pedidos' && <PedidosPage />}
          {pagina === 'entregas' && <EntregasPage />}
        </main>
      </div>
    </div>
  );
}