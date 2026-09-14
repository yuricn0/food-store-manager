import { useState, useEffect } from 'react';
import { produtoApi } from '../services/api';
import { formatarMoeda } from '../utils/formato';
import ProdutoForm from '../components/ProdutoForm';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro(null);
      setProdutos(await produtoApi.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarProduto(dados) {
    if (emEdicao) {
      await produtoApi.atualizar(emEdicao.id, dados);
    } else {
      await produtoApi.criar(dados);
    }
    await carregarProdutos();
  }

  function abrirNovo() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEdicao(produto) {
    setEmEdicao(produto);
    setFormAberto(true);
  }

  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          (p.descricao ?? '').toLowerCase().includes(termo)
      )
    : produtos;

  const valorEstoque = produtos.reduce(
    (total, p) => total + Number(p.preco) * p.estoque,
    0
  );
  const estoqueBaixo = produtos.filter((p) => p.estoque <= 10).length;

  return (
    <>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="flex gap-10">
          <div>
            <p className="text-3xl font-semibold num">{produtos.length}</p>
            <p className="text-sm text-[#6B6B60]">produtos</p>
          </div>
          <div>
            <p className="text-3xl font-semibold num">
              {formatarMoeda(valorEstoque)}
            </p>
            <p className="text-sm text-[#6B6B60]">em estoque</p>
          </div>
          {estoqueBaixo > 0 && (
            <div>
              <p className="text-3xl font-semibold num text-[#9A6212]">
                {estoqueBaixo}
              </p>
              <p className="text-sm text-[#6B6B60]">com pouco estoque</p>
            </div>
          )}
        </div>

        <div className="relative w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A90]"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar produto"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D8D0] rounded
                       placeholder:text-[#9A9A90] focus:outline-none
                       focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20"
          />
        </div>
      </div>

      {carregando && <p className="text-[#6B6B60]">Carregando produtos...</p>}

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#F4D5CE] rounded px-4 py-3">
          <p className="font-medium text-[#B4341F]">
            Não foi possível carregar os produtos
          </p>
          <p className="text-sm text-[#8A4335] mt-0.5">{erro}</p>
        </div>
      )}

      {!carregando && !erro && produtos.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Seu catálogo está vazio</p>
          <p className="text-sm text-[#6B6B60] mt-1">
            Adicione o primeiro produto para começar a controlar o estoque.
          </p>
        </div>
      )}

      {!carregando && !erro && produtos.length > 0 && filtrados.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Nenhum produto encontrado</p>
          <p className="text-sm text-[#6B6B60] mt-1">Tente outro termo de busca.</p>
        </div>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <table className="w-full">
          <tbody>
            {filtrados.map((produto) => (
              <tr
                key={produto.id}
                onClick={() => abrirEdicao(produto)}
                className="border-b border-[#E9E9E1] hover:bg-[#F2F2EC] cursor-pointer"
              >
                <td className="py-3.5 pr-4">
                  <p className="font-medium leading-snug">{produto.nome}</p>
                  {produto.descricao && (
                    <p className="text-sm text-[#6B6B60] leading-snug">
                      {produto.descricao}
                    </p>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap num font-medium">
                  {formatarMoeda(produto.preco)}
                </td>
                <td className="py-3.5 pl-4 text-right w-24">
                  <span
                    className={`num text-sm font-medium ${
                      produto.estoque <= 10 ? 'text-[#9A6212]' : 'text-[#6B6B60]'
                    }`}
                  >
                    {produto.estoque} un
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={abrirNovo}
        title="Adicionar produto"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2F6B3F] text-white
                   shadow-lg flex items-center justify-center hover:bg-[#255632]
                   focus:outline-none focus:ring-4 focus:ring-[#2F6B3F]/30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <ProdutoForm
        aberto={formAberto}
        produto={emEdicao}
        onFechar={() => setFormAberto(false)}
        onSalvar={salvarProduto}
      />
    </>
  );
}