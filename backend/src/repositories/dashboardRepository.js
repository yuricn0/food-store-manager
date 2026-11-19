import { prisma } from '../lib/prisma.js';

export const dashboardRepository = {
  // Soma e média dos pedidos que não foram cancelados
  totaisDeVenda() {
    return prisma.pedido.aggregate({
      where: { status: { not: 'CANCELADO' } },
      _sum: { total: true },
      _avg: { total: true },
      _count: true
    });
  },

  // Quantos pedidos e quanto em dinheiro há em cada situação
  pedidosPorStatus() {
    return prisma.pedido.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { total: true }
    });
  },

  contarClientesAtivos() {
    return prisma.cliente.count({ where: { ativo: true } });
  },

  produtosAtivos() {
    return prisma.produto.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true, estoque: true }
    });
  },

  lotesPorStatus() {
    return prisma.loteEntrega.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
  },

  // Os cinco produtos com maior quantidade vendida
  maisVendidos() {
    return prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: { pedido: { status: { not: 'CANCELADO' } } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 5
    });
  },

  // Série diária dos últimos 30 dias.
  // Agrupar por dia exige SQL: o Prisma agrupa por valor exato,
  // e cada pedido tem um horário diferente.
  vendasPorDia() {
    return prisma.$queryRaw`
      SELECT
        to_char(date_trunc('day', "criadoEm"), 'YYYY-MM-DD') AS dia,
        COUNT(*)::int AS pedidos,
        COALESCE(SUM(total), 0)::float AS total
      FROM pedidos
      WHERE status::text <> 'CANCELADO'
        AND "criadoEm" >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1
    `;
  },

  nomesDeProdutos(ids) {
    return prisma.produto.findMany({
      where: { id: { in: ids } },
      select: { id: true, nome: true }
    });
  }
};