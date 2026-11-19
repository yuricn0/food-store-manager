import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';

export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho?.startsWith('Bearer ')) {
    return next(new AppError('Autenticação necessária', 401));
  }

  const token = cabecalho.slice(7);

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: dados.sub, perfil: dados.perfil };
    next();
  } catch {
    next(new AppError('Sessão expirada ou token inválido', 401));
  }
}

export function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return next(new AppError('Você não tem permissão para esta ação', 403));
    }
    next();
  };
}