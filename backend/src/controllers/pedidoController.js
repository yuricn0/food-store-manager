import { pedidoService } from '../services/pedidoService.js';

export const pedidoController = {
  async listar(req, res, next) {
    try {
      res.json(await pedidoService.listar());
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      res.json(await pedidoService.buscarPorId(Number(req.params.id)));
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const pedido = await pedidoService.criar(req.body);
      res.status(201).json(pedido);
    } catch (erro) {
      next(erro);
    }
  },

  async alterarStatus(req, res, next) {
    try {
      const pedido = await pedidoService.alterarStatus(
        Number(req.params.id),
        req.body.status
      );
      res.json(pedido);
    } catch (erro) {
      next(erro);
    }
  }
};