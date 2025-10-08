import * as InstituicaoModel from "../models/InstituicoesModel.js";
import * as responses from '../utils/responses.js';
import * as InstituicaoUsuarioModel from "../models/InstituicaoUsuarioModel.js";

/**
 * Cadastra uma nova instituição vinculada ao organizador logado.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId`, `nome` e `descricao`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna a instituição cadastrada ou um erro.
 */
export const cadastrar = async (req, res) => {
    try {

        const organizador =   req.loginId;

        const { nome, descricao } = req.body;


        if (!organizador || !nome || !descricao) {
            return responses.error(res, { 
                statusCode: 400, 
                message: "Dados incompletos. 'organizador', 'nome' e 'descricao' são obrigatórios." 
            });
        }

        const instituicao = { organizador, nome, descricao };

        const instituicaoCriada = await InstituicaoModel.cadastrar(instituicao);
        InstituicaoUsuarioModel.cadastrar({instituicao: instituicaoCriada.id, usuario: organizador, aceito: true});
        return responses.created(res, {message: "Instituição cadastrada com sucesso", data: instituicaoCriada});
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Busca uma instituição pelo seu ID.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo o parâmetro `id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna a instituição encontrada ou erro 404 se não existir.
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da Instituição é obrigatório." });
        }

        const instituicao = await InstituicaoModel.buscarPorId(id);

        if (!instituicao) {
            return responses.error(res, { statusCode: 404, message: "Instituição não encontrada." });
        }

        return responses.success(res, { message: "Instituição encontrada com sucesso.", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Busca uma instituição pelo seu nome.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo o parâmetro `nome`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna a instituição encontrada ou erro 404 se não existir.
 */
export const buscarPorNome = async (req, res) => {
    try {
        const nome = req.params.nome;

        if (!nome) {
            return responses.error(res, { statusCode: 400, message: "Nome da Instituição é obrigatório." });
        }

        const instituicao = await InstituicaoModel.buscarPorNome(nome);

        if (!instituicao) {
            return responses.error(res, { statusCode: 404, message: "Instituição não encontrada." });
        }

        return responses.success(res, { message: "Instituição encontrada com sucesso.", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};


/**
 * Lista todas as instituições vinculadas ao organizador logado.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId` do organizador.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object[]>} Retorna a lista de instituições do organizador.
 */
export const listarPorOrganizador = async (req, res) => {
    try {
        const organizadorId = req.loginId;

        if (!organizadorId) {
            return responses.error(res, { statusCode: 400, message: "ID do Organizador é obrigatório." });
        }

        const instituicoes = await InstituicaoModel.listarPorOrganizador(organizadorId);
        return responses.success(res, { message: "Instituições listadas com sucesso.", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Lista todas as instituições com opção de busca por nome ou descrição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo query `search`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object[]>} Retorna a lista de instituições encontradas ou erro 404 se nenhuma for encontrada.
 */
export const listar = async (req, res) => {
    try {
        const search = req.query.search || "";
        const instituicoes = await InstituicaoModel.listar(search);

        if (!instituicoes || instituicoes.length === 0) {
            return responses.error(res, { statusCode: 404, message: "Nenhuma Instituição encontrada." });
        }

        return responses.success(res, { message: "Instituições listadas com sucesso.", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Atualiza todos os campos de uma instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId`, parâmetro `id` e body com `nome` e `descricao`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna a instituição atualizada ou erro se não existir ou não pertencer ao organizador.
 */
export const atualizarTudo = async (req, res) => {
  try {
    const organizador =   req.loginId;
    const id = req.params.id;
    const instituicoes = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
    }

    const { nome, descricao } = instituicoes;
    if (!nome || !descricao) {
      return responses.error(res, { statusCode: 400, message: "Todos os campos (nome, descricao) são obrigatórios" });
    }

    const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
    if (!instituicaoExistente) {
      return responses.notFound(res, { message: "Instituição não encontrada" });
    }

    if (instituicaoExistente.organizador !== organizador) {
      return responses.error(res, { statusCode: 403, message: "Você não tem permissão para atualizar esta instituição" });
    }

    const resultado = await InstituicaoModel.atualizar(id, instituicoes);
    if (!resultado) {
      return responses.notFound(res, { message: "Instituição não encontrada" });
    }

    return responses.success(res, { message: "Instituição atualizada com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Atualiza parcialmente os campos de uma instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId`, parâmetro `id` e body com pelo menos um campo (`nome` ou `descricao`).
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna a instituição atualizada ou erro se não existir ou não pertencer ao organizador.
 */
export const atualizar = async (req, res) => {
  try {
    const organizador =   req.loginId;
    const id = req.params.id;
    const instituicoes = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
    }

    const { nome, descricao } = instituicoes;
    if (!nome && !descricao) {
      return responses.error(res, { statusCode: 400, message: "Pelo menos um campo (nome ou descricao) deve ser fornecido para atualização" });
    }

    const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
    if (!instituicaoExistente) {
      return responses.notFound(res, { message: "Instituição não encontrada" });
    }

    if (instituicaoExistente.organizador !== organizador) {
      return responses.error(res, { statusCode: 403, message: "Você não tem permissão para atualizar esta instituição" });
    }

    const resultado = await InstituicaoModel.atualizar(id, instituicoes);
    if (!resultado) {
      return responses.notFound(res, { message: "Instituição não encontrada" });
    }

    return responses.success(res, { message: "Instituição atualizada com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};


/**
 * Deleta uma instituição pelo ID, apenas se pertencer ao organizador logado.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId` e parâmetro `id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna confirmação de exclusão ou erro se não existir ou não pertencer ao organizador.
 */
export const deletar = async (req, res) => {
    try {
        const organizador =   req.loginId;
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
        }

        const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
        if (!instituicaoExistente) {
          return responses.notFound(res, { message: "Instituição não encontrada" });
        }

        if (instituicaoExistente.organizador !== organizador) {
          return responses.error(res, { statusCode: 403, message: "Você não tem permissão para atualizar esta instituição" });
        }

        const resultado = await InstituicaoModel.deletar(id);
       

        return responses.success(res, { message: "Instituição deletada com sucesso", data: resultado });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
}; 