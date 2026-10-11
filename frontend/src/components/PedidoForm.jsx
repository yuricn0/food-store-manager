import { useState, useEffect } from 'react';
import { clienteApi, produtoApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';

export default function PedidoForm({ aberto, onFechar, onSalvar }) {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [itens, setItens] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    setClienteId('');
    setObservacao('');
    setItens([]);
    setBuscaProduto('');
    setErro(null);

    Promise.all([clienteApi.listar(), produtoApi.listar()])
      .then(([c, p]) => {
        setClientes(c);
        setProdutos(p);
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

  function adicionar(produto) {
    setItens((atuais) => {
      const existente = atuais.find((i) => i.produtoId === produto.id);
      if (existente) {
        return atuais.map((i) =>
          i.produtoId === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [
        ...atuais,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
          estoque: produto.estoque,
          quantidade: 1,
        },
      ];
    });
    setBuscaProduto('');
  }

  function mudarQuantidade(produtoId, delta) {
    setItens((atuais) =>
      atuais
        .map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: i.quantidade + delta }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }

  async function enviar(e) {
    e.preventDefault();
    try {
      setSalvando(true);
      setErro(null);
      await onSalvar({
        clienteId: Number(clienteId),
        observacao,
        itens: itens.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
        })),
      });
      onFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const termo = buscaProduto.trim().toLowerCase();
  const sugestoes = termo
    ? produtos
        .filter((p) => p.nome.toLowerCase().includes(termo))
        .slice(0, 6)
    : [];

  const total = itens.reduce((t, i) => t + i.preco * i.quantidade, 0);
  const temExcesso = itens.some((i) => i.quantidade > i.estoque);
  const podeSalvar = clienteId && itens.length > 0 && !temExcesso;

  const campo =
    'w-full px-3 py-2 bg-white border border-[#D8D8D0] rounded ' +
    'text-[#1A2E1F] placeholder:text-[#9A9A90] ' +
    'focus:outline-none focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20';
  const rotulo = 'block text-sm font-medium text-[#4A4A42] mb-1.5';

  return (
    <div
      className="fixed inset-0 bg-[#1A2E1F]/40 flex items-start justify-center p-4 pt-12 z-50 overflow-y-auto"
      onClick={onFechar}
    >
      <div
        className="bg-[#FAFAF7] w-full max-w-2xl rounded-lg shadow-xl mb-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E3E3DC]">
          <h2 className="text-lg font-semibold">Novo pedido</h2>
        </div>

        <form onSubmit={enviar} className="px-6 py-5 space-y-5">
          <div>
            <label className={rotulo}>Cliente</label>
            <select
              className={campo}
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.bairro ? ` — ${c.bairro}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={rotulo}>Adicionar produtos</label>
            <div className="relative">
              <input
                className={campo}
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Digite o nome do produto"
              />
              {sugestoes.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#D8D8D0] rounded shadow-lg overflow-hidden">
                  {sugestoes.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => adicionar(p)}
                        className="w-full text-left px-3 py-2 hover:bg-[#F2F2EC] flex justify-between gap-4"
                      >
                        <span className="truncate">{p.nome}</span>
                        <span className="num text-sm text-[#6B6B60] shrink-0">
                          {formatarMoeda(p.preco)} · {p.estoque} un
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {itens.length === 0 ? (
            <div className="border border-dashed border-[#D8D8D0] rounded py-10 text-center">
              <p className="text-sm text-[#6B6B60]">
                Nenhum item adicionado ainda.
              </p>
            </div>
          ) : (
            <div className="border border-[#E3E3DC] rounded overflow-hidden bg-white">
              <table className="w-full">
                <tbody>
                  {itens.map((item) => {
                    const excedeu = item.quantidade > item.estoque;
                    return (
                      <tr
                        key={item.produtoId}
                        className="border-b border-[#EFEFE8] last:border-0"
                      >
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-sm leading-snug">
                            {item.nome}
                          </p>
                          <p
                            className={`text-xs num ${
                              excedeu ? 'text-[#B4341F]' : 'text-[#6B6B60]'
                            }`}
                          >
                            {formatarMoeda(item.preco)} · estoque {item.estoque}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 w-32">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => mudarQuantidade(item.produtoId, -1)}
                              className="w-7 h-7 rounded border border-[#D8D8D0] hover:bg-[#F2F2EC]"
                            >
                              −
                            </button>
                            <span className="w-8 text-center num text-sm">
                              {item.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => mudarQuantidade(item.produtoId, 1)}
                              className="w-7 h-7 rounded border border-[#D8D8D0] hover:bg-[#F2F2EC]"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right num text-sm font-medium w-24">
                          {formatarMoeda(item.preco * item.quantidade)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-between items-center px-3 py-3 bg-[#F2F2EC] border-t border-[#E3E3DC]">
                <span className="text-sm font-medium text-[#4A4A42]">Total</span>
                <span className="num text-lg font-semibold">
                  {formatarMoeda(total)}
                </span>
              </div>
            </div>
          )}

          {temExcesso && (
            <p className="text-sm text-[#B4341F]">
              Há itens com quantidade acima do estoque disponível.
            </p>
          )}

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
              disabled={!podeSalvar || salvando}
              className="px-4 py-2 bg-[#2F6B3F] text-white font-medium rounded hover:bg-[#255632] disabled:opacity-40"
            >
              {salvando ? 'Registrando...' : 'Registrar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}