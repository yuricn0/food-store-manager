import { AppError } from '../errors/AppError.js';

export function errorHandler(erro, req, res, next) {
  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  if (erro.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}