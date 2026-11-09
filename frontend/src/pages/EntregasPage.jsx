import { useState, useEffect } from 'react';
import { loteApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';
import LoteForm from '../components/LoteForm';

const STATUS = {
  AGUARDANDO: { rotulo: 'Aguardando saída', cor: 'bg-[#F4E9D0] text-[#8A6516]' },
  EM_ROTA: { rotulo: 'Em rota', cor: 'bg-[#DEE8F2] text-[#2C5679]' },
  CONCLUIDO: { rotulo: 'Concluído', cor: 'bg-[#DCEADF] text-[#2F6B3F]' },
  CANCELADO: { rotulo: 'Cancelado', cor: 'bg-[#F6DED9] text-[#8A4335]' },
};

const ACOES = {
  AGUARDANDO: { status: 'EM_ROTA', texto: 'Iniciar rota' },
  EM_ROTA: { status: 'CONCLUIDO', texto: 'Concluir entrega' },
};

function formatarData(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  });
}

export default function EntregasPage() {
  const [lotes, setLotes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
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
      const [l, p] = await Promise.all([
        loteApi.listar(),
        loteApi.listarPendentes(),
      ]);
      setLotes(l);
      setPendentes(p);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function criar(dados) {
    await loteApi.criar(dados);
    await carregar();
  }

  async function mudarStatus(id, status) {
    try {
      setErro(null);
      await loteApi.alterarStatus(id, status);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const emRota = lotes.filter((l) => l.status === 'EM_ROTA').length;

  return (
    <>
      <div className="flex gap-10 mb-8">
        <div>
          <p className="text-3xl font-semibold num">{pendentes.length}</p>
          <p className="text-sm text-[#6B6B60]">aguardando lote</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">{emRota}</p>
          <p className="text-sm text-[#6B6B60]">em rota</p>
        </div>
        <div>
          <p className="text-3xl font-semibold num">{lotes.length}</p>
          <p className="text-sm text-[#6B6B60]">lotes</p>
        </div>
      </div>

      {carregando && <p className="text-[#6B6B60]">Carregando lotes...</p>}

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#F4D5CE] rounded px-4 py-3 mb-6">
          <p className="text-sm text-[#B4341F]">{erro}</p>
        </div>
      )}

      {!carregando && lotes.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Nenhum lote montado</p>
          <p className="text-sm text-[#6B6B60] mt-1">
            Agrupe os pedidos em aberto para organizar a rota do entregador.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {lotes.map((lote) => {
          const aberto = expandido === lote.id;
          const status = STATUS[lote.status];
          const acao = ACOES[lote.status];
          const data = formatarData(lote.dataEntrega);
          const total = lote.pedidos.reduce(
            (t, p) => t + Number(p.total),
            0
          );

          return (
            <div
              key={lote.id}
              className="border border-[#E3E3DC] rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandido(aberto ? null : lote.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAF7]"
              >
                <span className="num text-sm text-[#9A9A90] w-10">
                  #{lote.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-snug truncate">
                    {lote.bairro || 'Rota sem bairro definido'}
                  </p>
                  <p className="text-xs text-[#6B6B60] num">
                    {lote.pedidos.length}{' '}
                    {lote.pedidos.length === 1 ? 'parada' : 'paradas'}
                    {lote.entregador ? ` · ${lote.entregador}` : ''}
                    {data ? ` · ${data}` : ''}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.cor}`}
                >
                  {status.rotulo}
                </span>
                <span className="num font-semibold w-24 text-right shrink-0">
                  {formatarMoeda(total)}
                </span>
              </button>

              {aberto && (
                <div className="border-t border-[#EFEFE8] px-4 py-3 bg-[#FAFAF7]">
                  <table className="w-full mb-3">
                    <tbody>
                      {lote.pedidos.map((pedido) => (
                        <tr key={pedido.id}>
                          <td className="py-1 num text-sm text-[#9A9A90] w-10">
                            #{pedido.id}
                          </td>
                          <td className="py-1 text-sm">
                            {pedido.cliente.nome}
                            {pedido.cliente.endereco && (
                              <span className="text-[#6B6B60]">
                                {' '}
                                — {pedido.cliente.endereco}
                              </span>
                            )}
                          </td>
                          <td className="py-1 text-sm num text-right w-24">
                            {formatarMoeda(pedido.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {lote.observacao && (
                    <p className="text-sm text-[#6B6B60] mb-3">
                      {lote.observacao}
                    </p>
                  )}

                  {(acao || lote.status !== 'CONCLUIDO') && (
                    <div className="flex gap-2">
                      {acao && (
                        <button
                          onClick={() => mudarStatus(lote.id, acao.status)}
                          className="px-3 py-1.5 text-sm bg-[#2F6B3F] text-white rounded font-medium hover:bg-[#255632]"
                        >
                          {acao.texto}
                        </button>
                      )}
                      {['AGUARDANDO', 'EM_ROTA'].includes(lote.status) && (
                        <button
                          onClick={() => mudarStatus(lote.id, 'CANCELADO')}
                          className="px-3 py-1.5 text-sm text-[#8A4335] rounded font-medium hover:bg-[#F6DED9]"
                        >
                          Desfazer lote
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
        title="Novo lote"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2F6B3F] text-white
                   shadow-lg flex items-center justify-center hover:bg-[#255632]
                   focus:outline-none focus:ring-4 focus:ring-[#2F6B3F]/30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <LoteForm
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvar={criar}
      />
    </>
  );
}