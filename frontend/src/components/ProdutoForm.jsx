import { useState, useEffect } from 'react';

const VAZIO = { nome: '', descricao: '', preco: '', estoque: '' };

export default function ProdutoForm({ aberto, produto, onFechar, onSalvar }) {
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const editando = Boolean(produto);

  useEffect(() => {
    if (!aberto) return;
    setErro(null);
    setForm(
      produto
        ? {
            nome: produto.nome,
            descricao: produto.descricao ?? '',
            preco: String(produto.preco),
            estoque: String(produto.estoque),
          }
        : VAZIO
    );
  }, [aberto, produto]);

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onFechar();
    }
    if (aberto) window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    try {
      setSalvando(true);
      setErro(null);
      await onSalvar({
        nome: form.nome,
        descricao: form.descricao,
        preco: form.preco,
        estoque: form.estoque === '' ? 0 : form.estoque,
      });
      onFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const campo =
    'w-full px-3 py-2 bg-white border border-[#D8D8D0] rounded ' +
    'text-[#1A2E1F] placeholder:text-[#9A9A90] ' +
    'focus:outline-none focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20';

  const rotulo = 'block text-sm font-medium text-[#4A4A42] mb-1.5';

  return (
    <div
      className="fixed inset-0 bg-[#1A2E1F]/40 flex items-start justify-center p-4 pt-20 z-50"
      onClick={onFechar}
    >
      <div
        className="bg-[#FAFAF7] w-full max-w-lg rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E3E3DC]">
          <h2 className="text-lg font-semibold text-[#1A2E1F]">
            {editando ? 'Editar produto' : 'Novo produto'}
          </h2>
        </div>

        <form onSubmit={enviar} className="px-6 py-5 space-y-4">
          <div>
            <label className={rotulo}>Nome</label>
            <input
              className={campo}
              value={form.nome}
              onChange={(e) => alterar('nome', e.target.value)}
              placeholder="Nome do produto"
              autoFocus
            />
          </div>

          <div>
            <label className={rotulo}>Descrição</label>
            <input
              className={campo}
              value={form.descricao}
              onChange={(e) => alterar('descricao', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={rotulo}>Preço</label>
              <input
                className={`${campo} num`}
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => alterar('preco', e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className={rotulo}>Estoque</label>
              <input
                className={`${campo} num`}
                type="number"
                min="0"
                value={form.estoque}
                onChange={(e) => alterar('estoque', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {erro && (
            <p className="text-sm text-[#B4341F] bg-[#FDF2F0] border border-[#F4D5CE] rounded px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 text-[#4A4A42] font-medium rounded hover:bg-[#EFEFE8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-[#2F6B3F] text-white font-medium rounded hover:bg-[#255632] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}