import crypto from "crypto";
import pool from "../database/data.js";

/**
 * Consulta uma sessão ativa no banco de dados a partir do ID do usuário.
 *
 * - Utilizada para verificar se existe uma sessão vinculada a um determinado usuário.
 * - Pode receber uma conexão externa (útil em transações) ou criar a sua própria.
 * - Retorna todos os campos da sessão encontrada (id, usuario, token, validade, etc).
 *
 * @param {number} usuario - ID único do usuário (chave primária na tabela de usuários).
 * @param {import("mysql2").PoolConnection|null} [cx=null] - Conexão ativa do pool. 
 *   Caso não seja informada, a função cria e gerencia a conexão automaticamente.
 * @returns {Promise<Object|null>} Objeto com os dados da sessão caso exista, ou `null` se não for encontrada.
 * @throws {Error} Caso ocorra falha na execução da query ou no acesso ao banco de dados.
 */
const consultarPorUsuario = async (usuario, cx = null) => {
  let localCx = cx;
  try {
    if (!localCx) {
      localCx = await pool.getConnection();
    }
    const cmdSql = "SELECT * FROM Sessoes WHERE usuario = ?;";
    const [rows] = await localCx.query(cmdSql, [usuario]);
    return (rows.length > 0) ? rows[0] : null;
  } catch (error) {
    throw new Error("Erro ao buscar usuário por ID: " + error.message);
  } finally {
    if (!cx && localCx) {
      localCx.release();
    }
  }
};

/**
 * Consulta e valida uma sessão existente no banco de dados.
 *
 * - Verifica se o usuário possui sessão ativa.
 * - Confere se o `token` informado corresponde ao armazenado na tabela `Sessoes`.
 * - Útil em middlewares de autenticação antes de liberar o acesso a rotas protegidas.
 *
 * @param {number} usuario - ID único do usuário autenticado.
 * @param {string} token - Token que deve ser validado contra o armazenado no banco.
 * @returns {Promise<Object|null>} Sessão encontrada (se válida), ou `null` se inválida ou inexistente.
 * @throws {Error} Caso haja falha no processo de consulta ao banco.
 */
export const buscarSessao = async (usuario, token) => {
  try {
    const sessao = await consultarPorUsuario(usuario);
    if (!sessao || sessao.token !== token) {
      return null;
    }
    return sessao;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria ou atualiza uma sessão de autenticação para o usuário.
 *
 * - Se o usuário já possui uma sessão, ela será sobrescrita com um novo token e nova validade.
 * - A validade é calculada adicionando `n` horas ao horário atual.
 * - Gera tokens criptograficamente seguros com 128 caracteres hexadecimais.
 *
 * @param {number} usuario - ID único do usuário para o qual a sessão será criada.
 * @param {number} validade - Tempo de validade da sessão em horas.
 * @returns {Promise<Object>} Retorna o objeto da sessão recém-criada/atualizada (inclui usuário, token, validade, etc).
 * @throws {Error} Caso não seja possível criar ou atualizar a sessão no banco.
 */
export const criar = async (usuario, validade) => {
  const cx = await pool.getConnection();
  try {
    const token = crypto.randomBytes(64).toString("hex"); // 128 caracteres
    const cmdSql = `
      INSERT INTO Sessoes (usuario, token, validade)
      VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? HOUR))
      ON DUPLICATE KEY UPDATE 
          token = VALUES(token), 
          validade = VALUES(validade);
    `;
    const [rows] = await cx.query(cmdSql, [usuario, token, validade]);

    if (rows.affectedRows === 0) {
      throw new Error("Erro ao criar uma sessão para o usuário");
    }

    return await consultarPorUsuario(usuario, cx);
    
  } catch (error) {
    throw error;
  } finally {
    if (cx) cx.release();
  }
};

/**
 * Estende a validade de uma sessão existente no banco de dados.
 *
 * - Adiciona mais horas à validade atual do token ativo do usuário.
 * - Não gera novo token, apenas prolonga a duração do já existente.
 * - Útil em fluxos de "lembrar-me" ou renovação de sessão.
 *
 * @param {number} usuario - ID único do usuário cuja sessão será estendida.
 * @param {number} tempo_em_horas - Quantidade de horas a acrescentar à validade atual.
 * @returns {Promise<boolean>} Retorna `true` se a validade foi atualizada com sucesso, ou `false` se nenhuma sessão foi encontrada.
 * @throws {Error} Caso haja falha ao atualizar a validade da sessão.
 */
export const extender = async (usuario, tempo_em_horas) => {
  let cx;
  try {
    const cmdSql =
      "UPDATE Sessoes SET validade = DATE_ADD(validade, INTERVAL ? HOUR) WHERE usuario = ?;";
    cx = await pool.getConnection();
    const [rows] = await cx.query(cmdSql, [tempo_em_horas, usuario]);
    return rows.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    if (cx) cx.release();
  }
};
