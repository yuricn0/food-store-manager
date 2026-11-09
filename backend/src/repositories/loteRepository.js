import { prisma } from '../lib/prisma.js';

const COM_PEDIDOS = {
  pedidos: {
    include: { cliente: true, itens: true },
    orderBy: { id: 'asc' }
  }
};

export const loteRepository = {
  listar() {
    return prisma.loteEntrega.findMany({
      include: COM_PEDIDOS,
      orderBy: { criadoEm: 'desc' }
    });
  },

  buscarPorId(id) {
    return prisma.loteEntrega.findUnique({
      where: { id },
      include: COM_PEDIDOS
    });
  },

  // Pedidos que ainda não foram vinculados a nenhum lote
  listarPendentes() {
    return prisma.pedido.findMany({
      where: {
        loteId: null,
        status: { notIn: ['ENTREGUE', 'CANCELADO'] }
      },
      include: { cliente: true },
      orderBy: { criadoEm: 'asc' }
    });
  },

  buscarPedidosPorIds(ids) {
    return prisma.pedido.findMany({
      where: { id: { in: ids } },
      include: { cliente: true }
    });
  },

  criar(tx, dados) {
    return tx.loteEntrega.create({ data: dados });
  },

  vincularPedidos(tx, loteId, pedidoIds) {
    return tx.pedido.updateMany({
      where: { id: { in: pedidoIds } },
      data: { loteId }
    });
  },

  atualizarStatus(tx, id, status) {
    return tx.loteEntrega.update({
      where: { id },
      data: { status },
      include: COM_PEDIDOS
    });
  }
};