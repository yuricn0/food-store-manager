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