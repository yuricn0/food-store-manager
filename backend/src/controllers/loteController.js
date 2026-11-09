import { loteService } from '../services/loteService.js';

export const loteController = {
  async listar(req, res, next) {
    try {
      res.json(await loteService.listar());
    } catch (erro) {
      next(erro);
    }
  },

  async listarPendentes(req, res, next) {
    try {
      res.json(await loteService.listarPendentes());
    } catch (erro) {
      next(erro);
    }
  },

  async sugerir(req, res, next) {
    try {
      res.json(await loteService.sugerirAgrupamento());
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      res.json(await loteService.buscarPorId(Number(req.params.id)));
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const lote = await loteService.criar(req.body);
      res.status(201).json(lote);
    } catch (erro) {
      next(erro);
    }
  },

  async alterarStatus(req, res, next) {
    try {
      const lote = await loteService.alterarStatus(
        Number(req.params.id),
        req.body.status
      );
      res.json(lote);
    } catch (erro) {
      next(erro);
    }
  }
};