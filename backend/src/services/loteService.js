import { prisma } from '../lib/prisma.js';
import { loteRepository } from '../repositories/loteRepository.js';
import { AppError } from '../errors/AppError.js';

const CAPACIDADE_MAXIMA = 10;

const STATUS_VALIDOS = ['AGUARDANDO', 'EM_ROTA', 'CONCLUIDO', 'CANCELADO'];

// Para onde cada status pode avançar
const TRANSICOES = {
  AGUARDANDO: ['EM_ROTA', 'CANCELADO'],
  EM_ROTA: ['CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: [],
  CANCELADO: []
};

export const loteService = {
  async listar() {
    return loteRepository.listar();
  },

  async buscarPorId(id) {
    const lote = await loteRepository.buscarPorId(id);
    if (!lote) throw new AppError('Lote não encontrado', 404);
    return lote;
  },

  async listarPendentes() {
    return loteRepository.listarPendentes();
  },

  // Agrupa os pedidos pendentes por bairro, respeitando a capacidade do lote
  async sugerirAgrupamento() {
    const pendentes = await loteRepository.listarPendentes();

    const porBairro = new Map();
    for (const pedido of pendentes) {
      const bairro = pedido.cliente.bairro?.trim() || 'Sem bairro informado';
      if (!porBairro.has(bairro)) porBairro.set(bairro, []);
      porBairro.get(bairro).push(pedido);
    }

    const sugestoes = [];

    for (const [bairro, pedidos] of porBairro) {
      // Um bairro com mais pedidos que a capacidade vira mais de um lote
      for (let i = 0; i < pedidos.length; i += CAPACIDADE_MAXIMA) {
        const grupo = pedidos.slice(i, i + CAPACIDADE_MAXIMA);
        sugestoes.push({
          bairro,
          quantidade: grupo.length,
          valorTotal: grupo.reduce((t, p) => t + Number(p.total), 0),
          pedidos: grupo
        });
      }
    }

    // Bairros com mais pedidos primeiro: são as rotas mais eficientes
    return sugestoes.sort((a, b) => b.quantidade - a.quantidade);
  },

  async criar({ bairro, entregador, dataEntrega, observacao, pedidoIds }) {
    if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) {
      throw new AppError('Selecione ao menos um pedido para o lote');
    }

    const ids = [...new Set(pedidoIds.map(Number))];

    if (ids.length > CAPACIDADE_MAXIMA) {
      throw new AppError(
        `Um lote comporta no máximo ${CAPACIDADE_MAXIMA} pedidos`
      );
    }

    const pedidos = await loteRepository.buscarPedidosPorIds(ids);

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não foram encontrados', 404);
    }

    for (const pedido of pedidos) {
      if (pedido.loteId !== null) {
        throw new AppError(
          `O pedido #${pedido.id} já pertence a outro lote`
        );
      }
      if (['ENTREGUE', 'CANCELADO'].includes(pedido.status)) {
        throw new AppError(
          `O pedido #${pedido.id} não está disponível para entrega`
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const lote = await loteRepository.criar(tx, {
        bairro: bairro?.trim() || null,
        entregador: entregador?.trim() || null,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : null,
        observacao: observacao?.trim() || null
      });

      await loteRepository.vincularPedidos(tx, lote.id, ids);

      return tx.loteEntrega.findUnique({
        where: { id: lote.id },
        include: { pedidos: { include: { cliente: true, itens: true } } }
      });
    });
  },

  async alterarStatus(id, status) {
    const lote = await this.buscarPorId(id);

    if (!STATUS_VALIDOS.includes(status)) {
      throw new AppError('Status inválido');
    }

    if (!TRANSICOES[lote.status].includes(status)) {
      throw new AppError(
        `Um lote ${lote.status.toLowerCase()} não pode mudar para ${status.toLowerCase()}`
      );
    }

    // Concluir a rota entrega todos os pedidos do lote
    if (status === 'CONCLUIDO') {
      return prisma.$transaction(async (tx) => {
        await tx.pedido.updateMany({
          where: { loteId: id },
          data: { status: 'ENTREGUE' }
        });

        return loteRepository.atualizarStatus(tx, id, 'CONCLUIDO');
      });
    }

    // Cancelar a rota devolve os pedidos para a fila, sem cancelá-los
    if (status === 'CANCELADO') {
      return prisma.$transaction(async (tx) => {
        await tx.pedido.updateMany({
          where: { loteId: id },
          data: { loteId: null }
        });

        return loteRepository.atualizarStatus(tx, id, 'CANCELADO');
      });
    }

    return prisma.$transaction((tx) =>
      loteRepository.atualizarStatus(tx, id, status)
    );
  }
};