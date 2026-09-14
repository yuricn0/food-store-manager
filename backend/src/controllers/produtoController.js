import { produtoService } from '../services/produtoService.js';

export const produtoController = {
  async listar(req, res, next) {
    try {
      const produtos = await produtoService.listar();
      res.json(produtos);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const produto = await produtoService.buscarPorId(Number(req.params.id));
      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const produto = await produtoService.criar(req.body);
      res.status(201).json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const produto = await produtoService.atualizar(
        Number(req.params.id),
        req.body
      );
      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async remover(req, res, next) {
    try {
      await produtoService.remover(Number(req.params.id));
      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },

  async ajustarEstoque(req, res, next) {
    try {
      const produto = await produtoService.ajustarEstoque(
        Number(req.params.id),
        req.body.quantidade
      );
      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  }
};