import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { AppError } from '../errors/AppError.js';

const PERFIS = ['ADMIN', 'OPERADOR'];

function gerarToken(usuario) {
  const segredo = process.env.JWT_SECRET;

  if (!segredo) {
    throw new AppError('JWT_SECRET não configurado no servidor', 500);
  }

  return jwt.sign(
    { sub: usuario.id, perfil: usuario.perfil },
    segredo,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

export const authService = {
  async login(email, senha) {
    if (!email || !senha) {
      throw new AppError('Informe e-mail e senha');
    }

    const usuario = await usuarioRepository.buscarPorEmailComSenha(
      email.trim().toLowerCase()
    );

    // Mensagem igual nos dois casos: não revela se o e-mail existe
    const CREDENCIAL_INVALIDA = new AppError('E-mail ou senha inválidos', 401);

    if (!usuario || !usuario.ativo) throw CREDENCIAL_INVALIDA;

    const confere = await bcrypt.compare(senha, usuario.senhaHash);
    if (!confere) throw CREDENCIAL_INVALIDA;

    return {
      token: gerarToken(usuario),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    };
  },

  async perfilAtual(id) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario || !usuario.ativo) {
      throw new AppError('Usuário não encontrado', 401);
    }
    return usuario;
  },

  async listarUsuarios() {
    return usuarioRepository.listar();
  },

  async criarUsuario({ nome, email, senha, perfil }) {
    if (!nome || nome.trim().length < 2) {
      throw new AppError('Nome deve ter ao menos 2 caracteres');
    }

    const emailLimpo = (email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      throw new AppError('E-mail inválido');
    }

    if (!senha || senha.length < 6) {
      throw new AppError('Senha deve ter ao menos 6 caracteres');
    }

    if (perfil && !PERFIS.includes(perfil)) {
      throw new AppError('Perfil inválido');
    }

    const existente = await usuarioRepository.buscarPorEmailComSenha(emailLimpo);
    if (existente) {
      throw new AppError('Já existe um usuário com esse e-mail');
    }

    return usuarioRepository.criar({
      nome: nome.trim(),
      email: emailLimpo,
      senhaHash: await bcrypt.hash(senha, 10),
      perfil: perfil || 'OPERADOR'
    });
  }
};