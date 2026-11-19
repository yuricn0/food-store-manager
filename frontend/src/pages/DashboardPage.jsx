import { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';

const STATUS_PEDIDO = {
  PENDENTE: { rotulo: 'Pendente', cor: 'bg-[#F4E9D0] text-[#8A6516]' },
  EM_SEPARACAO: { rotulo: 'Em separação', cor: 'bg-[#DEE8F2] text-[#2C5679]' },
  PRONTO: { rotulo: 'Pronto', cor: 'bg-[#DCEADF] text-[#2F6B3F]' },
  ENTREGUE: { rotulo: 'Entregue', cor: 'bg-[#E6E6DE] text-[#5A5A52]' },
  CANCELADO: { rotulo: 'Cancelado', cor: 'bg-[#F6DED9] text-[#8A4335]' },
};

function diaCurto(iso) {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

function GraficoVendas({ dados }) {
  const [hover, setHover] = useState(null);

  if (!dados.length) {
    return (
      <p className="text-sm text-[#6B6B60] py-10 text-center">
        Nenhuma venda registrada nos últimos 30 dias.
      </p>
    );
  }

  const L = 720;
  const A = 170;
  const BASE = A - 20;
  const TOPO = 14;
  const maximo = Math.max(...dados.map((d) => d.total));
  const faixa = L / dados.length;
  const larguraBarra = Math.max(4, faixa - 2);

  function caminhoBarra(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x},${BASE} L${x},${y + r} Q${x},${y} ${x + r},${y} L${
      x + w - r
    },${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${BASE} Z`;
  }

  const ativo = hover !== null ? dados[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${L} ${A}`}
        className="w-full"
        onMouseLeave={() => setHover(null)}
      >
        <line x1="0" y1={TOPO} x2={L} y2={TOPO} stroke="#EFEFE8" strokeWidth="1" />
        <line x1="0" y1={BASE} x2={L} y2={BASE} stroke="#D8D8D0" strokeWidth="1" />

        {dados.map((d, i) => {
          const altura = maximo > 0 ? ((BASE - TOPO) * d.total) / maximo : 0;
          const x = i * faixa + (faixa - larguraBarra) / 2;
          const y = BASE - altura;
          return (
            <g key={d.dia}>
              <path
                d={caminhoBarra(x, y, larguraBarra, altura)}
                fill={hover === i ? '#1A2E1F' : '#2F6B3F'}
              />
              <rect
                x={i * faixa}
                y="0"
                width={faixa}
                height={A}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            </g>
          );
        })}

        <text x="0" y={A - 4} fontSize="11" fill="#9A9A90">
          {diaCurto(dados[0].dia)}
        </text>
        {dados.length > 1 && (
          <text x={L} y={A - 4} fontSize="11" fill="#9A9A90" textAnchor="end">
            {diaCurto(dados[dados.length - 1].dia)}
          </text>
        )}
        <text x="0" y={TOPO - 4} fontSize="11" fill="#9A9A90">
          {formatarMoeda(maximo)}
        </text>
      </svg>

      {ativo && (
        <div
          className="absolute -top-1 bg-[#1A2E1F] text-[#F2F2EC] text-xs rounded px-2.5 py-1.5
                     pointer-events-none whitespace-nowrap -translate-x-1/2"
          style={{ left: `${((hover + 0.5) / dados.length) * 100}%` }}
        >
          <span className="num">{diaCurto(ativo.dia)}</span>
          {' · '}
          <span className="num font-medium">{formatarMoeda(ativo.total)}</span>
          {' · '}
          <span className="num text-[#A8BCAE]">
            {ativo.pedidos} {ativo.pedidos === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>
      )}
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="border border-[#E3E3DC] rounded-lg bg-white p-5">
      <h2 className="text-sm font-semibold text-[#4A4A42] mb-4">{titulo}</h2>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    dashboardApi
      .resumo()
      .then(setDados)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return <p className="text-[#6B6B60]">Carregando indicadores...</p>;
  }

  if (erro) {
    return (
      <div className="bg-[#FDF2F0] border border-[#F4D5CE] rounded px-4 py-3">
        <p className="text-sm text-[#B4341F]">{erro}</p>
      </div>
    );
  }

  const maxVendido = Math.max(1, ...dados.maisVendidos.map((p) => p.quantidade));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div>
          <p className="text-3xl font-semibold num">
            {formatarMoeda(dados.faturamento)}
          </p>
          <p className="text-sm text-[#6B6B60]">faturado</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">
            {formatarMoeda(dados.ticketMedio)}
          </p>
          <p className="text-sm text-[#6B6B60]">ticket médio</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">{dados.totalPedidos}</p>
          <p className="text-sm text-[#6B6B60]">pedidos</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">
            {formatarMoeda(dados.valorEmEstoque)}
          </p>
          <p className="text-sm text-[#6B6B60]">em estoque</p>
        </div>
      </div>

      <Secao titulo="Vendas nos últimos 30 dias">
        <GraficoVendas dados={dados.vendasPorDia} />
      </Secao>

      <div className="grid grid-cols-2 gap-6">
        <Secao titulo="Pedidos por situação">
          {dados.pedidosPorStatus.length === 0 ? (
            <p className="text-sm text-[#6B6B60]">Nenhum pedido registrado.</p>
          ) : (
            <table className="w-full">
              <tbody>
                {dados.pedidosPorStatus.map((s) => {
                  const info = STATUS_PEDIDO[s.status];
                  return (
                    <tr key={s.status}>
                      <td className="py-1.5">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.cor}`}
                        >
                          {info.rotulo}
                        </span>
                      </td>
                      <td className="py-1.5 text-right num text-sm">
                        {s.quantidade}
                      </td>
                      <td className="py-1.5 text-right num text-sm font-medium">
                        {formatarMoeda(s.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Secao>

        <Secao titulo="Produtos mais vendidos">
          {dados.maisVendidos.length === 0 ? (
            <p className="text-sm text-[#6B6B60]">Nenhuma venda ainda.</p>
          ) : (
            <ul className="space-y-2.5">
              {dados.maisVendidos.map((p) => (
                <li key={p.produtoId}>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-sm truncate">{p.nome}</span>
                    <span className="num text-sm font-medium shrink-0">
                      {p.quantidade} un
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#EFEFE8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2F6B3F] rounded-full"
                      style={{ width: `${(p.quantidade / maxVendido) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>

      <Secao
        titulo={`Estoque baixo (até ${dados.limiteEstoqueBaixo} unidades)`}
      >
        {dados.estoqueBaixo.length === 0 ? (
          <p className="text-sm text-[#6B6B60]">
            Todos os produtos estão com estoque adequado.
          </p>
        ) : (
          <table className="w-full">
            <tbody>
              {dados.estoqueBaixo.map((p) => (
                <tr key={p.id} className="border-b border-[#EFEFE8] last:border-0">
                  <td className="py-2 text-sm">{p.nome}</td>
                  <td className="py-2 text-right num text-sm text-[#6B6B60]">
                    {formatarMoeda(p.preco)}
                  </td>
                  <td className="py-2 text-right num text-sm font-medium text-[#9A6212] w-20">
                    {p.estoque} un
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Secao>
    </div>
  );
}