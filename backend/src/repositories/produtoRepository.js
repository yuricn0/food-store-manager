import { prisma } from '../lib/prisma.js';

export const produtoRepository = {
  listar() {
    return prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
  },

  buscarPorId(id) {
    return prisma.produto.findUnique({
      where: { id }
    });
  },

  criar(dados) {
    return prisma.produto.create({ data: dados });
  },

  atualizar(id, dados) {
    return prisma.produto.update({
      where: { id },
      data: dados
    });
  },

  desativar(id) {
    return prisma.produto.update({
      where: { id },
      data: { ativo: false }
    });
  },

  ajustarEstoque(id, quantidade) {
    return prisma.produto.update({
      where: { id },
      data: { estoque: { increment: quantidade } }
    });
  }
};