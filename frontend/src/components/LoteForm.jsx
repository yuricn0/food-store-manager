import { useState, useEffect } from 'react';
import { loteApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';

const CAPACIDADE = 10;

export default function LoteForm({ aberto, onFechar, onSalvar }) {
  const [pendentes, setPendentes] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [selecionados, setSelecionados] = useState(new Set());
  const [bairro, setBairro] = useState('');
  const [entregador, setEntregador] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    setSelecionados(new Set());
    setBairro('');
    setEntregador('');
    setDataEntrega('');
    setObservacao('');
    setErro(null);

    Promise.all([loteApi.listarPendentes(), loteApi.sugestoes()])
      .then(([p, s]) => {
        setPendentes(p);
        setSugestoes(s);
      })
      .catch((e) => setErro(e.message));
  }, [aberto]);

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar();
    }
    if (aberto) window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  function alternar(id) {
    setSelecionados((atuais) => {
      const novo = new Set(atuais);
      if (novo.has(id)) {
        novo.delete(id);
      } else if (novo.size < CAPACIDADE) {
        novo.add(id);
      }
      return novo;
    });
  }

  function aplicarSugestao(sugestao) {
    setSelecionados(new Set(sugestao.pedidos.map((p) => p.id)));
    setBairro(
      sugestao.bairro === 'Sem bairro informado' ? '' : sugestao.bairro
    );
  }

  async function enviar(e) {
    e.preventDefault();
    try {
      setSalvando(true);
      setErro(null);
      await onSalvar({
        bairro,
        entregador,
        dataEntrega: dataEntrega || null,
        observacao,
        pedidoIds: [...selecionados],
      });
      onFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const totalSelecionado = pendentes
    .filter((p) => selecionados.has(p.id))
    .reduce((t, p) => t + Number(p.total), 0);

  const campo =
    'w-full px-3 py-2 bg-white border border-[#D8D8D0] rounded ' +
    'text-[#1A2E1F] placeholder:text-[#9A9A90] ' +
    'focus:outline-none focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20';
  const rotulo = 'block text-sm font-medium text-[#4A4A42] mb-1.5';

  return (
    <div
      className="fixed inset-0 bg-[#1A2E1F]/40 flex items-start justify-center p-4 pt-10 z-50 overflow-y-auto"
      onClick={onFechar}
    >
      <div
        className="bg-[#FAFAF7] w-full max-w-2xl rounded-lg shadow-xl mb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E3E3DC] flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Novo lote de entrega</h2>
          <span className="text-sm text-[#6B6B60] num">
            {selecionados.size} de {CAPACIDADE}
          </span>
        </div>

        <form onSubmit={enviar} className="px-6 py-5 space-y-5">
          {sugestoes.length > 0 && (
            <div>
              <label className={rotulo}>Agrupamento sugerido</label>
              <div className="flex gap-2 flex-wrap">
                {sugestoes.map((s, i) => (
                  <button
                    key={`${s.bairro}-${i}`}
                    type="button"
                    onClick={() => aplicarSugestao(s)}
                    className="text-left px-3 py-2 bg-white border border-[#D8D8D0] rounded
                               hover:border-[#2F6B3F] hover:bg-[#F2F2EC]"
                  >
                    <p className="text-sm font-medium leading-snug">
                      {s.bairro}
                    </p>
                    <p className="text-xs text-[#6B6B60] num">
                      {s.quantidade}{' '}
                      {s.quantidade === 1 ? 'pedido' : 'pedidos'} ·{' '}
                      {formatarMoeda(s.valorTotal)}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#6B6B60] mt-2">
                Os pedidos em aberto são agrupados por bairro. Clique para
                selecionar um grupo inteiro.
              </p>
            </div>
          )}

          <div>
            <label className={rotulo}>Pedidos do lote</label>
            {pendentes.length === 0 ? (
              <div className="border border-dashed border-[#D8D8D0] rounded py-10 text-center">
                <p className="text-sm text-[#6B6B60]">
                  Nenhum pedido aguardando entrega.
                </p>
              </div>
            ) : (
              <div className="border border-[#E3E3DC] rounded overflow-hidden bg-white max-h-72 overflow-y-auto">
                {pendentes.map((pedido) => {
                  const marcado = selecionados.has(pedido.id);
                  const cheio = selecionados.size >= CAPACIDADE && !marcado;
                  return (
                    <label
                      key={pedido.id}
                      className={`flex items-center gap-3 px-3 py-2.5 border-b border-[#EFEFE8]
                                  last:border-0 ${
                                    cheio
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'cursor-pointer hover:bg-[#FAFAF7]'
                                  }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        disabled={cheio}
                        onChange={() => alternar(pedido.id)}
                        className="w-4 h-4 accent-[#2F6B3F]"
                      />
                      <span className="num text-sm text-[#9A9A90] w-10">
                        #{pedido.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug truncate">
                          {pedido.cliente.nome}
                        </p>
                        <p className="text-xs text-[#6B6B60] truncate">
                          {pedido.cliente.bairro || 'Sem bairro'}
                          {pedido.cliente.endereco
                            ? ` · ${pedido.cliente.endereco}`
                            : ''}
                        </p>
                      </div>
                      <span className="num text-sm font-medium shrink-0">
                        {formatarMoeda(pedido.total)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {selecionados.size > 0 && (
              <p className="text-sm text-[#4A4A42] mt-2 num">
                {selecionados.size}{' '}
                {selecionados.size === 1 ? 'pedido' : 'pedidos'} ·{' '}
                {formatarMoeda(totalSelecionado)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={rotulo}>Bairro</label>
              <input
                className={campo}
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>
            <div>
              <label className={rotulo}>Entregador</label>
              <input
                className={campo}
                value={entregador}
                onChange={(e) => setEntregador(e.target.value)}
              />
            </div>
            <div>
              <label className={rotulo}>Data</label>
              <input
                className={campo}
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={rotulo}>Observação</label>
            <input
              className={campo}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {erro && (
            <p className="text-sm text-[#B4341F] bg-[#FDF2F0] border border-[#F4D5CE] rounded px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 text-[#4A4A42] font-medium rounded hover:bg-[#EFEFE8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selecionados.size === 0 || salvando}
              className="px-4 py-2 bg-[#2F6B3F] text-white font-medium rounded hover:bg-[#255632] disabled:opacity-40"
            >
              {salvando ? 'Criando...' : 'Criar lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}