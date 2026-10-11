import { prisma } from '../lib/prisma.js';

export const clienteRepository = {
  listar() {
    return prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
  },

  buscarPorId(id) {
    return prisma.cliente.findUnique({ where: { id } });
  },

  criar(dados) {
    return prisma.cliente.create({ data: dados });
  },

  atualizar(id, dados) {
    return prisma.cliente.update({ where: { id }, data: dados });
  },

  desativar(id) {
    return prisma.cliente.update({
      where: { id },
      data: { ativo: false }
    });
  }
};