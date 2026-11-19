import { prisma } from '../lib/prisma.js';

// Nunca devolve o senhaHash para fora da camada de autenticação
const CAMPOS_PUBLICOS = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  criadoEm: true
};

export const usuarioRepository = {
  listar() {
    return prisma.usuario.findMany({
      where: { ativo: true },
      select: CAMPOS_PUBLICOS,
      orderBy: { nome: 'asc' }
    });
  },

  // Usado só no login: é o único lugar que precisa do hash
  buscarPorEmailComSenha(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id) {
    return prisma.usuario.findUnique({
      where: { id },
      select: CAMPOS_PUBLICOS
    });
  },

  criar(dados) {
    return prisma.usuario.create({
      data: dados,
      select: CAMPOS_PUBLICOS
    });
  }
};