const BASE_URL = 'http://localhost:3000';
const CHAVE_TOKEN = 'fsm.token';

export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function lerToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

async function request(caminho, opcoes = {}) {
  const token = lerToken();

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  // Token ausente, inválido ou expirado: derruba a sessão
  if (resposta.status === 401) {
    limparToken();
    window.dispatchEvent(new Event('sessao-expirada'));
    throw new Error('Sessão expirada. Entre novamente.');
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na requisição');
  }

  return dados;
}

export const authApi = {
  login: (email, senha) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),
  eu: () => request('/auth/eu'),
};

export const dashboardApi = {
  resumo: () => request('/dashboard'),
};

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

export const loteApi = {
  listar: () => request('/lotes'),
  buscarPorId: (id) => request(`/lotes/${id}`),
  listarPendentes: () => request('/lotes/pendentes'),
  sugestoes: () => request('/lotes/sugestoes'),
  criar: (dados) =>
    request('/lotes', { method: 'POST', body: JSON.stringify(dados) }),
  alterarStatus: (id, status) =>
    request(`/lotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};