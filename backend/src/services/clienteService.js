import { clienteRepository } from '../repositories/clienteRepository.js';
import { AppError } from '../errors/AppError.js';

function validar(dados, parcial = false) {
  const { nome, email } = dados;

  if (!parcial || nome !== undefined) {
    if (!nome || nome.trim().length < 2) {
      throw new AppError('Nome deve ter ao menos 2 caracteres');
    }
  }

  if (email) {
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!formatoValido) {
      throw new AppError('E-mail inválido');
    }
  }
}

function normalizar(dados) {
  const limpo = {};
  if (dados.nome !== undefined) limpo.nome = dados.nome.trim();
  if (dados.telefone !== undefined) limpo.telefone = dados.telefone?.trim() || null;
  if (dados.email !== undefined) limpo.email = dados.email?.trim() || null;
  if (dados.endereco !== undefined) limpo.endereco = dados.endereco?.trim() || null;
  if (dados.bairro !== undefined) limpo.bairro = dados.bairro?.trim() || null;
  return limpo;
}

export const clienteService = {
  async listar() {
    return clienteRepository.listar();
  },

  async buscarPorId(id) {
    const cliente = await clienteRepository.buscarPorId(id);
    if (!cliente || !cliente.ativo) {
      throw new AppError('Cliente não encontrado', 404);
    }
    return cliente;
  },

  async criar(dados) {
    validar(dados);
    return clienteRepository.criar(normalizar(dados));
  },

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    validar(dados, true);
    return clienteRepository.atualizar(id, normalizar(dados));
  },

  async remover(id) {
    await this.buscarPorId(id);
    return clienteRepository.desativar(id);
  }
};