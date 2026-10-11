const BASE_URL = 'http://localhost:3000';

async function request(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na requisição');
  }

  return dados;
}

export const produtoApi = {
  listar: () => request('/produtos'),
  buscarPorId: (id) => request(`/produtos/${id}`),
  criar: (dados) =>
    request('/produtos', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) =>
    request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  remover: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
  ajustarEstoque: (id, quantidade) =>
    request(`/produtos/${id}/estoque`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade }),
    }),
};

export const clienteApi = {
  listar: () => request('/clientes'),
  buscarPorId: (id) => request(`/clientes/${id}`),
  criar: (dados) =>
    request('/clientes', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id, dados) =>
    request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  remover: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
};

export const pedidoApi = {
  listar: () => request('/pedidos'),
  buscarPorId: (id) => request(`/pedidos/${id}`),
  criar: (dados) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(dados) }),
  alterarStatus: (id, status) =>
    request(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};