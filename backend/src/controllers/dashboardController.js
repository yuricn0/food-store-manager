import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  async resumo(req, res, next) {
    try {
      res.json(await dashboardService.resumo());
    } catch (erro) {
      next(erro);
    }
  }
};