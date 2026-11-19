import { authService } from '../services/authService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      res.json(await authService.login(email, senha));
    } catch (erro) {
      next(erro);
    }
  },

  async eu(req, res, next) {
    try {
      res.json(await authService.perfilAtual(req.usuario.id));
    } catch (erro) {
      next(erro);
    }
  },

  async listarUsuarios(req, res, next) {
    try {
      res.json(await authService.listarUsuarios());
    } catch (erro) {
      next(erro);
    }
  },

  async criarUsuario(req, res, next) {
    try {
      const usuario = await authService.criarUsuario(req.body);
      res.status(201).json(usuario);
    } catch (erro) {
      next(erro);
    }
  }
};