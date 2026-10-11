import { prisma } from '../lib/prisma.js';
import { pedidoRepository } from '../repositories/pedidoRepository.js';
import { clienteService } from '../services/clienteService.js';
import { AppError } from '../errors/AppError.js';

const STATUS_VALIDOS = [
  'PENDENTE',
  'EM_SEPARACAO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO'
];

export const pedidoService = {
  async listar() {
    return pedidoRepository.listar();
  },

  async buscarPorId(id) {
    const pedido = await pedidoRepository.buscarPorId(id);
    if (!pedido) throw new AppError('Pedido não encontrado', 404);
    return pedido;
  },

  async criar({ clienteId, itens, observacao }) {
    if (!clienteId) {
      throw new AppError('Informe o cliente do pedido');
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      throw new AppError('O pedido precisa ter ao menos um item');
    }

    await clienteService.buscarPorId(Number(clienteId));

    // Agrupa itens repetidos do mesmo produto em uma única linha
    const agrupados = new Map();
    for (const item of itens) {
      const produtoId = Number(item.produtoId);
      const quantidade = Number(item.quantidade);

      if (!produtoId || !Number.isInteger(quantidade) || quantidade <= 0) {
        throw new AppError('Item inválido: verifique produto e quantidade');
      }

      agrupados.set(produtoId, (agrupados.get(produtoId) ?? 0) + quantidade);
    }

    const produtos = await prisma.produto.findMany({
      where: { id: { in: [...agrupados.keys()] } }
    });

    const itensDoPedido = [];
    let total = 0;

    for (const [produtoId, quantidade] of agrupados) {
      const produto = produtos.find((p) => p.id === produtoId);

      if (!produto || !produto.ativo) {
        throw new AppError(`Produto ${produtoId} não encontrado`, 404);
      }

      if (produto.estoque < quantidade) {
        throw new AppError(
          `Estoque insuficiente de "${produto.nome}". Disponível: ${produto.estoque}`
        );
      }

      const precoUnit = Number(produto.preco);
      total += precoUnit * quantidade;

      itensDoPedido.push({ produtoId, quantidade, precoUnit });
    }

    // Tudo acontece junto: ou grava o pedido e baixa o estoque, ou nada acontece
    return prisma.$transaction(async (tx) => {
      const pedido = await pedidoRepository.criar(tx, {
        clienteId: Number(clienteId),
        total,
        observacao: observacao?.trim() || null,
        itens: itensDoPedido
      });

      for (const item of itensDoPedido) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } }
        });
      }

      return pedido;
    });
  },

  async alterarStatus(id, status) {
    const pedido = await this.buscarPorId(id);

    if (!STATUS_VALIDOS.includes(status)) {
      throw new AppError('Status inválido');
    }

    if (pedido.status === 'CANCELADO') {
      throw new AppError('Pedido cancelado não pode mudar de status');
    }

    if (pedido.status === 'ENTREGUE') {
      throw new AppError('Pedido entregue não pode mudar de status');
    }

    // Cancelar devolve os itens ao estoque
    if (status === 'CANCELADO') {
      return prisma.$transaction(async (tx) => {
        for (const item of pedido.itens) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { increment: item.quantidade } }
          });
        }

        return tx.pedido.update({
          where: { id },
          data: { status: 'CANCELADO' },
          include: { cliente: true, itens: { include: { produto: true } } }
        });
      });
    }

    return pedidoRepository.atualizarStatus(id, status);
  }
};