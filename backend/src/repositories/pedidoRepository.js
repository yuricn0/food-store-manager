import { prisma } from '../lib/prisma.js';

const COM_RELACOES = {
  cliente: true,
  itens: { include: { produto: true } }
};

export const pedidoRepository = {
  listar() {
    return prisma.pedido.findMany({
      include: { cliente: true, itens: true },
      orderBy: { criadoEm: 'desc' }
    });
  },

  buscarPorId(id) {
    return prisma.pedido.findUnique({
      where: { id },
      include: COM_RELACOES
    });
  },

  // Recebe o cliente da transação para que a criação do pedido
  // e a baixa de estoque aconteçam de forma atômica.
  criar(tx, { clienteId, total, observacao, itens }) {
    return tx.pedido.create({
      data: {
        clienteId,
        total,
        observacao,
        itens: { create: itens }
      },
      include: COM_RELACOES
    });
  },

  atualizarStatus(id, status) {
    return prisma.pedido.update({
      where: { id },
      data: { status },
      include: COM_RELACOES
    });
  }
};