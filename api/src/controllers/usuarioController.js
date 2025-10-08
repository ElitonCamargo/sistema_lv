// controller/usuarioController.js
import * as UsuarioModel from "../models/UsuarioModel.js";
import * as Sessoes from '../models/SessoesModel.js';
import * as responses from '../utils/responses.js';

/**
 * Cadastra um novo usuário no sistema.
 *
 * @async
 * @function cadastrar
 * @param {import('express').Request} req - Objeto da requisição contendo os dados do usuário no corpo ({nome, email, senha, cargo}).
 * @param {import('express').Response} res - Objeto de resposta do Express utilizado para retornar o resultado da operação.
 * @returns {Promise<void>} Retorna uma resposta HTTP com o usuário cadastrado (201) ou um erro (400/500).
 *
 * @example
 * // Exemplo de corpo da requisição (JSON):
 * {
 *   "nome": "João Silva",
 *   "email": "joao@email.com",
 *   "senha": "123456",
 *   "cargo": "admin",
 *   "avatar": "http:link/avatar.jpg" // Opcional
 * }
 *
 * @throws {Error} Caso algum campo obrigatório não seja informado ou ocorra falha ao inserir no banco.
 */
export const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha || !cargo) {
      return responses.error(res, { statusCode: 400, message: "Todos os campos são obrigatórios" });
    }

    const newUsuario = await UsuarioModel.cadastrar(req.body);
    delete newUsuario.senha;

    return responses.created(res, { message: "Usuário cadastrado com sucesso", data: newUsuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Realiza o login de um usuário.
 *
 * - Valida email e senha.
 * - Caso as credenciais sejam válidas, gera um token de sessão com tempo de expiração.
 *
 * @async
 * @function login
 * @param {import('express').Request} req - Objeto da requisição contendo `email` e `senha` no corpo.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com o token de autenticação e os dados do usuário (200), ou erro (400/401/500).
 *
 * @example
 * // Corpo da requisição:
 * {
 *   "email": "usuario@email.com",
 *   "senha": "123456"
 * }
 */
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return responses.error(res, { statusCode: 400, message: "Email e senha são obrigatórios" });
    }

    const usuario = await UsuarioModel.login(email, senha);
    if (!usuario) {
      return responses.error(res, { statusCode: 401, message: "Credenciais inválidas" });
    }
    //Efetuou login com sucesso
    const horas_validade = 36;
    const sessao = await Sessoes.criar(usuario.id, horas_validade);
    
    const data = {
      token: usuario.id + "." + sessao.token,
      expiracao: sessao.validade,
      usuario
    };

    return responses.success(res, { message: "Login realizado com sucesso", data });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Lista usuários cadastrados no sistema.
 *
 * - Permite filtrar usuários por nome ou email via query string (?search=...).
 * - Retorna uma lista com todos os usuários encontrados.
 *
 * @async
 * @function listar
 * @param {import('express').Request} req - Objeto da requisição com parâmetro opcional `search`.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com a lista de usuários (200) ou mensagem de não encontrado (404).
 */
export const listar = async (req, res) => {
  try {
    const search = req.query.search || "";
    const usuarios = await UsuarioModel.listar(search);

    if (!usuarios || usuarios.length === 0) {
      return responses.notFound(res, { message: "Nenhum usuário encontrado" });
    }

    return responses.success(res, {message: "Lista de usuários",data: usuarios});
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Busca um usuário pelo ID.
 *
 * - Valida se o ID foi informado e se é um número válido.
 * - Caso encontrado, retorna os dados do usuário.
 *
 * @async
 * @function buscarPorId
 * @param {import('express').Request} req - Objeto da requisição com parâmetro `id` na URL.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com os dados do usuário (200) ou erro (400/404/500).
 */
export const buscarPorId = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const usuario = await UsuarioModel.buscarPorId(id);
    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário encontrado", data: usuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Retorna o usuário logado na sessão atual.
 *
 * - Identifica o usuário a partir do `req.loginId` (previamente preenchido pelo middleware de autenticação).
 * - Caso exista, retorna os dados do usuário autenticado.
 *
 * @async
 * @function buscarUsuarioLogado
 * @param {import('express').Request} req - Objeto da requisição com `loginId` definido.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com os dados do usuário autenticado (200) ou erro (404/500).
 */
export const buscarUsuarioLogado = async (req, res) => {
  try {
    if (!req.loginId) {
      return responses.notFound(res, { message: "ID de sessão não encontrado" });
    }

    const usuario = await UsuarioModel.buscarPorId(req.loginId);

    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, {message: "Usuário encontrado", data: usuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Busca um usuário pelo email.
 *
 * - Procura na base de dados um usuário correspondente ao email informado.
 *
 * @async
 * @function buscarPorEmail
 * @param {import('express').Request} req - Objeto da requisição com parâmetro `email` na URL.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com os dados do usuário (200) ou mensagem de não encontrado (404).
 */
export const buscarPorEmail = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorEmail(req.params.email);
    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário encontrado", data: usuario });
    
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Atualiza todos os campos obrigatórios de um usuário.
 *
 * - Exige que `nome`, `email`, `senha` e `cargo` estejam presentes no corpo da requisição.
 * - Valida se o `id` informado é válido.
 *
 * @async
 * @function atualizarTudo
 * @param {import('express').Request} req - Objeto da requisição com parâmetro `id` na URL e os dados do usuário no corpo.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com os dados do usuário atualizado (200) ou erro (400/404/500).
 */
export const atualizarTudo = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const { nome, email, senha, cargo } = usuario;
    if (!nome || !email || !senha || !cargo) {
      return responses.error(res, { statusCode: 400, message: "Todos os campos (nome, email, senha, cargo) são obrigatórios" });
    }

    const resultado = await UsuarioModel.atualizar(id, usuario);
    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário atualizado com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Atualiza parcialmente os dados de um usuário.
 *
 * - Permite atualizar apenas os campos enviados no corpo da requisição.
 * - Valida se o `id` informado é válido.
 *
 * @async
 * @function atualizar
 * @param {import('express').Request} req - Objeto da requisição com parâmetro `id` na URL e os dados do usuário no corpo.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP com os dados do usuário atualizado (200) ou erro (400/404/500).
 */
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }
    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const resultado = await UsuarioModel.atualizar(id, req.body);

    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário atualizado com sucesso", data: resultado });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Deleta um usuário do sistema.
 *
 * - Valida se o `id` informado é válido.
 * - Remove o usuário permanentemente da base de dados.
 *
 * @async
 * @function deletar
 * @param {import('express').Request} req - Objeto da requisição com parâmetro `id` na URL.
 * @param {import('express').Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Retorna resposta HTTP sem conteúdo (204) em caso de sucesso, ou erro (400/404/500).
 */
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }
    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const resultado = await UsuarioModel.deletar(id);
    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.noContent(res, {message: "Usuário deletado com sucesso"});
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};
