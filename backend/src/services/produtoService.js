import { produtoRepository } from '../repositories/produtoRepository.js';
import { AppError } from '../errors/AppError.js';

function validarDados(dados, parcial = false) {
  const { nome, preco, estoque } = dados;

  if (!parcial || nome !== undefined) {
    if (!nome || nome.trim().length < 2) {
      throw new AppError('Nome deve ter ao menos 2 caracteres');
    }
  }

  if (!parcial || preco !== undefined) {
    if (preco === undefined || isNaN(preco) || Number(preco) <= 0) {
      throw new AppError('Preço deve ser um número maior que zero');
    }
  }

  if (estoque !== undefined) {
    if (!Number.isInteger(Number(estoque)) || Number(estoque) < 0) {
      throw new AppError('Estoque deve ser um número inteiro não negativo');
    }
  }
}

export const produtoService = {
  async listar() {
    return produtoRepository.listar();
  },

  async buscarPorId(id) {
    const produto = await produtoRepository.buscarPorId(id);
    if (!produto || !produto.ativo) {
      throw new AppError('Produto não encontrado', 404);
    }
    return produto;
  },

  async criar(dados) {
    validarDados(dados);
    return produtoRepository.criar({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      preco: Number(dados.preco),
      estoque: Number(dados.estoque ?? 0)
    });
  },

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    validarDados(dados, true);

    const atualizacao = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome.trim();
    if (dados.descricao !== undefined) atualizacao.descricao = dados.descricao?.trim() || null;
    if (dados.preco !== undefined) atualizacao.preco = Number(dados.preco);
    if (dados.estoque !== undefined) atualizacao.estoque = Number(dados.estoque);

    return produtoRepository.atualizar(id, atualizacao);
  },

  async remover(id) {
    await this.buscarPorId(id);
    return produtoRepository.desativar(id);
  },

  async ajustarEstoque(id, quantidade) {
    const produto = await this.buscarPorId(id);
    const qtd = Number(quantidade);

    if (!Number.isInteger(qtd) || qtd === 0) {
      throw new AppError('Quantidade deve ser um inteiro diferente de zero');
    }

    if (produto.estoque + qtd < 0) {
      throw new AppError(
        `Estoque insuficiente. Disponível: ${produto.estoque}`
      );
    }

    return produtoRepository.ajustarEstoque(id, qtd);
  }
};