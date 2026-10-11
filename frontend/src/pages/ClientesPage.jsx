import { useState, useEffect } from 'react';
import { clienteApi } from '../services/api';
import ClienteForm from '../components/ClienteForm';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setCarregando(true);
      setErro(null);
      setClientes(await clienteApi.listar());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function salvar(dados) {
    if (emEdicao) {
      await clienteApi.atualizar(emEdicao.id, dados);
    } else {
      await clienteApi.criar(dados);
    }
    await carregar();
  }

  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          (c.bairro ?? '').toLowerCase().includes(termo) ||
          (c.telefone ?? '').includes(termo)
      )
    : clientes;

  return (
    <>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-3xl font-semibold num">{clientes.length}</p>
          <p className="text-sm text-[#6B6B60]">clientes</p>
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
            placeholder="Pesquisar cliente"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D8D0] rounded
                       placeholder:text-[#9A9A90] focus:outline-none
                       focus:border-[#2F6B3F] focus:ring-2 focus:ring-[#2F6B3F]/20"
          />
        </div>
      </div>

      {carregando && <p className="text-[#6B6B60]">Carregando clientes...</p>}

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#F4D5CE] rounded px-4 py-3">
          <p className="font-medium text-[#B4341F]">
            Não foi possível carregar os clientes
          </p>
          <p className="text-sm text-[#8A4335] mt-0.5">{erro}</p>
        </div>
      )}

      {!carregando && !erro && clientes.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Nenhum cliente cadastrado</p>
          <p className="text-sm text-[#6B6B60] mt-1">
            Cadastre um cliente para começar a registrar pedidos.
          </p>
        </div>
      )}

      {!carregando && !erro && clientes.length > 0 && filtrados.length === 0 && (
        <div className="border border-dashed border-[#D8D8D0] rounded-lg py-16 text-center">
          <p className="text-[#4A4A42] font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm text-[#6B6B60] mt-1">Tente outro termo de busca.</p>
        </div>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <table className="w-full">
          <tbody>
            {filtrados.map((cliente) => (
              <tr
                key={cliente.id}
                onClick={() => {
                  setEmEdicao(cliente);
                  setFormAberto(true);
                }}
                className="border-b border-[#E9E9E1] hover:bg-[#F2F2EC] cursor-pointer"
              >
                <td className="py-3.5 pr-4">
                  <p className="font-medium leading-snug">{cliente.nome}</p>
                  {cliente.endereco && (
                    <p className="text-sm text-[#6B6B60] leading-snug">
                      {cliente.endereco}
                    </p>
                  )}
                </td>
                <td className="py-3.5 px-4 text-sm text-[#6B6B60] whitespace-nowrap num">
                  {cliente.telefone}
                </td>
                <td className="py-3.5 pl-4 text-right w-36">
                  {cliente.bairro && (
                    <span className="text-sm text-[#4A4A42]">{cliente.bairro}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => {
          setEmEdicao(null);
          setFormAberto(true);
        }}
        title="Adicionar cliente"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2F6B3F] text-white
                   shadow-lg flex items-center justify-center hover:bg-[#255632]
                   focus:outline-none focus:ring-4 focus:ring-[#2F6B3F]/30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <ClienteForm
        aberto={formAberto}
        cliente={emEdicao}
        onFechar={() => setFormAberto(false)}
        onSalvar={salvar}
      />
    </>
  );
}