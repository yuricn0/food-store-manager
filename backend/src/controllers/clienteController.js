import { clienteService } from '../services/clienteService.js';

export const clienteController = {
  async listar(req, res, next) {
    try {
      res.json(await clienteService.listar());
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      res.json(await clienteService.buscarPorId(Number(req.params.id)));
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const cliente = await clienteService.criar(req.body);
      res.status(201).json(cliente);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const cliente = await clienteService.atualizar(
        Number(req.params.id),
        req.body
      );
      res.json(cliente);
    } catch (erro) {
      next(erro);
    }
  },

  async remover(req, res, next) {
    try {
      await clienteService.remover(Number(req.params.id));
      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  }
};