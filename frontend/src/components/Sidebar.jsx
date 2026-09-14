const ITENS = [
  {
    id: 'produtos',
    rotulo: 'Produtos',
    disponivel: true,
    icone: (
      <>
        <path d="M21 8V16a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </>
    ),
  },
  {
    id: 'pedidos',
    rotulo: 'Pedidos',
    disponivel: false,
    icone: (
      <>
        <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2z" />
        <path d="M8 8h8M8 12h8M8 16h4" />
      </>
    ),
  },
  {
    id: 'entregas',
    rotulo: 'Entregas',
    disponivel: false,
    icone: (
      <>
        <path d="M14 16V5a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
        <path d="M14 8h4l3 4v4a1 1 0 0 1-1 1h-1" />
        <circle cx="6.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </>
    ),
  },
  {
    id: 'dashboard',
    rotulo: 'Dashboard',
    disponivel: false,
    icone: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </>
    ),
  },
];

export default function Sidebar({ aberto, onAlternar, ativo, onNavegar }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-[#1A2E1F] text-[#F2F2EC]
                  flex flex-col transition-[width] duration-200
                  ${aberto ? 'w-60' : 'w-16'}`}
    >
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        {aberto && (
          <span className="font-semibold tracking-tight truncate">
            Food Store
          </span>
        )}
        <button
          onClick={onAlternar}
          title={aberto ? 'Recolher menu' : 'Expandir menu'}
          className="ml-auto p-1.5 rounded hover:bg-white/10 text-[#A8BCAE]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-3">
        {ITENS.map((item) => {
          const selecionado = item.id === ativo;
          return (
            <button
              key={item.id}
              onClick={() => item.disponivel && onNavegar(item.id)}
              disabled={!item.disponivel}
              title={aberto ? undefined : item.rotulo}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                ${
                  selecionado
                    ? 'bg-white/10 text-white font-medium'
                    : item.disponivel
                    ? 'text-[#C4D3C8] hover:bg-white/5'
                    : 'text-[#5E7264] cursor-not-allowed'
                }`}
            >
              <svg
                className="shrink-0"
                width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round"
              >
                {item.icone}
              </svg>
              {aberto && <span className="truncate">{item.rotulo}</span>}
              {aberto && !item.disponivel && (
                <span className="ml-auto text-[10px] text-[#5E7264] shrink-0">
                  em breve
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}