import { useState, useEffect } from 'react';
import { pedidoApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';
import PedidoForm from '../components/PedidoForm';

const STATUS = {
  PENDENTE: { rotulo: 'Pendente', cor: 'bg-[#F4E9D0] text-[#8A6516]' },
  EM_SEPARACAO: { rotulo: 'Em separação', cor: 'bg-[#DEE8F2] text-[#2C5679]' },
  PRONTO: { rotulo: 'Pronto', cor: 'bg-[#DCEADF] text-[#2F6B3F]' },
  ENTREGUE: { rotulo: 'Entregue', cor: 'bg-[#E6E6DE] text-[#5A5A52]' },
  CANCELADO: { rotulo: 'Cancelado', cor: 'bg-[#F6DED9] text-[#8A4335]' },
};

const PROXIMO = {
  PENDENTE: 'EM_SEPARACAO',
  EM_SEPARACAO: 'PRONTO',
  PRONTO: 'ENTREGUE',
};

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setCarregando(true);
      setErro(null);
      setPedidos(await pedidoApi.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function criar(dados) {
    await pedidoApi.criar(dados);
    await carregar();
  }

  async function mudarStatus(id, status) {
    try {
      await pedidoApi.alterarStatus(id, status);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const abertos = pedidos.filter(
    (p) => !['ENTREGUE', 'CANCELADO'].includes(p.status)
  );
  const faturado = pedidos
    .filter((p) => p.status !== 'CANCELADO')
    .reduce((t, p) => t + Number(p.total), 0);

  return (
    <>
      <div className="flex gap-10 mb-8">
        <div>
          <p className="text-3xl font-semibold num">{pedidos.length}</p>
          <p className="text-sm text-[#6B6B60]">pedidos</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">{abertos.length}</p>
          <p className="text-sm text-[#6B6B60]">em aberto</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">{formatarMoeda(faturado)}</p>
          <p className="text-sm text-[#6B6B60]">faturado</p>
        </div>
      </div>

      {carregando && <p className="text-[#6B6B60]">Carregando pedidos...</p>}

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#F4D5CE] rounded px-4 py-3 mb-6">
          <p className="text-sm text-[#B4341F]">{erro}</p>
        </div>
      )}

      {!carregando && pedidos.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Nenhum pedido registrado</p>
          <p className="text-sm text-[#6B6B60] mt-1">
            Registre o primeiro pedido para começar.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {pedidos.map((pedido) => {
          const aberto = expandido === pedido.id;
          const status = STATUS[pedido.status];
          const proximo = PROXIMO[pedido.status];

          return (
            <div
              key={pedido.id}
              className="border border-[#E3E3DC] rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandido(aberto ? null : pedido.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAF7]"
              >
                <span className="num text-sm text-[#9A9A90] w-10">
                  #{pedido.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-snug truncate">
                    {pedido.cliente.nome}
                  </p>
                  <p className="text-xs text-[#6B6B60] num">
                    {formatarData(pedido.criadoEm)} ·{' '}
                    {pedido.itens.length}{' '}
                    {pedido.itens.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.cor}`}
                >
                  {status.rotulo}
                </span>
                <span className="num font-semibold w-24 text-right shrink-0">
                  {formatarMoeda(pedido.total)}
                </span>
              </button>

              {aberto && (
                <div className="border-t border-[#EFEFE8] px-4 py-3 bg-[#FAFAF7]">
                  <table className="w-full mb-3">
                    <tbody>
                      {pedido.itens.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1 text-sm">
                            {item.produto?.nome ?? `Produto ${item.produtoId}`}
                          </td>
                          <td className="py-1 text-sm num text-[#6B6B60] text-right w-20">
                            {item.quantidade} ×{' '}
                            {formatarMoeda(item.precoUnit)}
                          </td>
                          <td className="py-1 text-sm num text-right w-24">
                            {formatarMoeda(item.precoUnit * item.quantidade)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pedido.observacao && (
                    <p className="text-sm text-[#6B6B60] mb-3">
                      {pedido.observacao}
                    </p>
                  )}

                  {(proximo || pedido.status !== 'CANCELADO') && (
                    <div className="flex gap-2">
                      {proximo && (
                        <button
                          onClick={() => mudarStatus(pedido.id, proximo)}
                          className="px-3 py-1.5 text-sm bg-[#2F6B3F] text-white rounded font-medium hover:bg-[#255632]"
                        >
                          Marcar como {STATUS[proximo].rotulo.toLowerCase()}
                        </button>
                      )}
                      {pedido.status !== 'ENTREGUE' && (
                        <button
                          onClick={() => mudarStatus(pedido.id, 'CANCELADO')}
                          className="px-3 py-1.5 text-sm text-[#8A4335] rounded font-medium hover:bg-[#F6DED9]"
                        >
                          Cancelar pedido
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setFormAberto(true)}
        title="Novo pedido"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2F6B3F] text-white
                   shadow-lg flex items-center justify-center hover:bg-[#255632]
                   focus:outline-none focus:ring-4 focus:ring-[#2F6B3F]/30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <PedidoForm
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvar={criar}
      />
    </>
  );
}