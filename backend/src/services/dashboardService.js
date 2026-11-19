import { dashboardRepository } from '../repositories/dashboardRepository.js';

const LIMITE_ESTOQUE_BAIXO = 10;

export const dashboardService = {
  async resumo() {
    const [
      vendas,
      porStatus,
      clientes,
      produtos,
      lotes,
      vendidos,
      serie
    ] = await Promise.all([
      dashboardRepository.totaisDeVenda(),
      dashboardRepository.pedidosPorStatus(),
      dashboardRepository.contarClientesAtivos(),
      dashboardRepository.produtosAtivos(),
      dashboardRepository.lotesPorStatus(),
      dashboardRepository.maisVendidos(),
      dashboardRepository.vendasPorDia()
    ]);

    const valorEmEstoque = produtos.reduce(
      (t, p) => t + Number(p.preco) * p.estoque,
      0
    );

    const estoqueBaixo = produtos
      .filter((p) => p.estoque <= LIMITE_ESTOQUE_BAIXO)
      .sort((a, b) => a.estoque - b.estoque)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        estoque: p.estoque,
        preco: Number(p.preco)
      }));

    // Junta a quantidade vendida com o nome do produto
    const nomes = await dashboardRepository.nomesDeProdutos(
      vendidos.map((v) => v.produtoId)
    );

    const maisVendidos = vendidos.map((v) => ({
      produtoId: v.produtoId,
      nome:
        nomes.find((n) => n.id === v.produtoId)?.nome ??
        `Produto ${v.produtoId}`,
      quantidade: v._sum.quantidade ?? 0
    }));

    return {
      faturamento: Number(vendas._sum.total ?? 0),
      ticketMedio: Number(vendas._avg.total ?? 0),
      totalPedidos: vendas._count,
      clientesAtivos: clientes,
      produtosAtivos: produtos.length,
      valorEmEstoque,
      limiteEstoqueBaixo: LIMITE_ESTOQUE_BAIXO,
      estoqueBaixo,
      pedidosPorStatus: porStatus.map((s) => ({
        status: s.status,
        quantidade: s._count._all,
        total: Number(s._sum.total ?? 0)
      })),
      lotesPorStatus: lotes.map((l) => ({
        status: l.status,
        quantidade: l._count._all
      })),
      maisVendidos,
      vendasPorDia: serie
    };
  }
};