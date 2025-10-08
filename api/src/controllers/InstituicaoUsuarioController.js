import * as InstituicaoUsuarioModel from "../models/InstituicaoUsuarioModel.js";
import * as InstituicaoModel from "../models/InstituicoesModel.js";
import * as responses from "../utils/responses.js";

/**
 * Usuário logado solicita vínculo em uma instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId` (usuário logado) e `instituicao` no body.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna o vínculo criado ou erro.
 */
export const solicitarCadastro = async (req, res) => {
  try {
    const usuario = req.loginId;
    const { instituicao } = req.body;

    if (!usuario || !instituicao) {
      return responses.error(res, {
        statusCode: 400,
        message: "Dados incompletos. 'usuario' e 'instituicao' são obrigatórios.",
      });
    }

    // Verifica se já existe vínculo
    const jaExiste = await InstituicaoUsuarioModel.verificarVinculo({ instituicao, usuario });
    if (jaExiste) {
      return responses.error(res, {
        statusCode: 409,
        message: "Você já possui vínculo (pendente ou aceito) com esta instituição.",
      });
    }

    const novoVinculo = await InstituicaoUsuarioModel.solicitarCadastro({ instituicao, usuario });
    return responses.created(res, { message: "Solicitação enviada com sucesso.", data: novoVinculo });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Organizador vincula diretamente um usuário à sua instituição (aceito = true).
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `loginId` (organizador logado), e no body `usuario` e `instituicao`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna o vínculo criado ou erro de permissão.
 */
export const cadastrar = async (req, res) => {
  try {
    const organizador = req.loginId;
    const { usuario, instituicao } = req.body;

    console.log("Organizador ID:", organizador);
    console.log("Usuário a ser vinculado ID:", usuario);
    console.log("Instituição ID:", instituicao);

    if (!organizador || !usuario || !instituicao) {
      return responses.error(res, {
        statusCode: 400,
        message: "Dados incompletos. 'organizador', 'usuario' e 'instituicao' são obrigatórios.",
      });
    }

    const instituicaoExistente = await InstituicaoModel.buscarPorId(instituicao);
    if (!instituicaoExistente) {
      return responses.notFound(res, { message: "Instituição não encontrada." });
    }
    console.log("Instituição existente:", instituicaoExistente);
    if (parseInt(instituicaoExistente.organizador) !== parseInt(organizador)) {
      return responses.error(res, {
        statusCode: 403,
        message: "Você não tem permissão para adicionar usuários a esta instituição.",
      });
    }

    const novoVinculo = await InstituicaoUsuarioModel.cadastrar({ instituicao, usuario });
    return responses.created(res, { message: "Usuário vinculado com sucesso.", data: novoVinculo });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Atualiza um vínculo entre usuário e instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo `id` do vínculo e body com campos a atualizar.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna o vínculo atualizado ou erro.
 */
export const atualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const dados = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do vínculo é obrigatório." });
    }

    const atualizado = await InstituicaoUsuarioModel.atualizar(id, dados);
    return responses.success(res, { message: "Vínculo atualizado com sucesso.", data: atualizado });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Busca um vínculo pelo ID.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo parâmetro `id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna o vínculo encontrado ou erro 404 se não existir.
 */
export const buscarPorId = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do vínculo é obrigatório." });
    }

    const vinculo = await InstituicaoUsuarioModel.buscarPorId(id);
    if (!vinculo) {
      return responses.notFound(res, { message: "Vínculo não encontrado." });
    }

    return responses.success(res, { message: "Vínculo encontrado com sucesso.", data: vinculo });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Remove um vínculo entre usuário e instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo parâmetro `id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object>} Retorna confirmação da remoção ou erro.
 */
export const sairDoVinculo = async (req, res) => {
  try {
    const usuario_id = req.loginId;
    const { vinculo_id } = req.body;

    if (!vinculo_id) {
      return responses.error(res, { statusCode: 400, message: "ID do vínculo é obrigatório." });
    }

    await InstituicaoUsuarioModel.sairDoVinculo(usuario_id, vinculo_id);
    return responses.success(res, { message: "Vínculo removido com sucesso." });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do vínculo é obrigatório." });
    }

    await InstituicaoUsuarioModel.deletar(id);
    return responses.success(res, { message: "Vínculo removido com sucesso." });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Lista todas as instituições de um usuário.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo parâmetro `usuario_id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object[]>} Retorna a lista de instituições do usuário.
 */
export const listarInstituicoesPorUsuario = async (req, res) => {
  try {
    const usuario_id = req.loginId;

    if (!usuario_id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório." });
    }

    const instituicoes = await InstituicaoUsuarioModel.listarInstituicoesPorUsuario(usuario_id);
    return responses.success(res, { message: "Instituições listadas com sucesso.", data: instituicoes });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Lista todos os usuários de uma instituição.
 *
 * @param {import("express").Request} req - Objeto da requisição contendo parâmetro `instituicao_id`.
 * @param {import("express").Response} res - Objeto da resposta HTTP.
 * @returns {Promise<Object[]>} Retorna a lista de usuários vinculados à instituição.
 */
export const listarUsuariosPorInstituicao = async (req, res) => {
  try {
    const instituicao_id = req.params.instituicao_id;

    if (!instituicao_id) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório." });
    }

    const usuarios = await InstituicaoUsuarioModel.listarUsuariosPorInstituicao(instituicao_id);
    return responses.success(res, { message: "Usuários listados com sucesso.", data: usuarios });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};
