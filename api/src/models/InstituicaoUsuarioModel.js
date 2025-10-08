import pool from "../database/data.js";


/**
 * Verifica se um usuário já está vinculado a uma instituição.
 *
 * @async
 * @function verificarVinculo
 * @param {Object} instituicao_usuario - Objeto contendo IDs.
 * @param {number} instituicao_usuario.instituicao - ID da instituição.
 * @param {number} instituicao_usuario.usuario - ID do usuário.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<boolean>} Retorna `true` se existir vínculo, caso contrário `false`.
 * @throws {Error} Caso ocorra erro na execução da query.
 */
export const verificarVinculo = async (instituicao_usuario, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { instituicao, usuario } = instituicao_usuario;

        const query = "SELECT * FROM InstituicaoUsuario WHERE fk_instituicao_id = ? AND fk_usuario_id = ?;";
  
        const [rows] = await localCx.execute(query, [instituicao, usuario]);

        return rows.length > 0;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Solicita vínculo de um usuário a uma instituição (pendente de aceitação).
 *
 * @async
 * @function solicitarCadastro
 * @param {Object} instituicao_usuario - Objeto contendo IDs.
 * @param {number} instituicao_usuario.instituicao - ID da instituição.
 * @param {number} instituicao_usuario.usuario - ID do usuário.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object|null>} O novo vínculo criado ou `null` se não inserido.
 * @throws {Error} Caso ocorra erro na execução da query.
 */
export const solicitarCadastro  = async (instituicao_usuario, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        const { instituicao, usuario } = instituicao_usuario;

        const query = `INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id, aceito) VALUES (?, ?, ?);`;
        const values = [instituicao, usuario, false];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao vincular usuário a instituição.");
        } 

        // pega o último id inserido (se realmente inseriu)
        if (result.insertId) {
            const novoVinculo = await buscarPorId(result.insertId, localCx);
            return novoVinculo;
        }

        return null; // caso não tenha inserido por duplicidade
    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Cadastra vínculo de um usuário a uma instituição (já aceito).
 *
 * @async
 * @function cadastrar
 * @param {Object} instituicao_usuario - Objeto contendo IDs.
 * @param {number} instituicao_usuario.instituicao - ID da instituição.
 * @param {number} instituicao_usuario.usuario - ID do usuário.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object|null>} O novo vínculo criado ou `null` se não inserido.
 * @throws {Error} Caso ocorra erro na execução da query.
 */
export const cadastrar = async (instituicao_usuario, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        const { instituicao, usuario, aceito } = instituicao_usuario;

        const query = `INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id, aceito) VALUES (?, ?, ?);`;
        const values = [instituicao, usuario, aceito || true];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao vincular usuário a instituição.");
        } 

        // pega o último id inserido (se realmente inseriu)
        if (result.insertId) {
            const novoVinculo = await buscarPorId(result.insertId, localCx);
            return novoVinculo;
        }

        return null; // caso não tenha inserido por duplicidade
    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Atualiza os dados de um vínculo entre usuário e instituição.
 *
 * @async
 * @function atualizar
 * @param {number} id - ID do vínculo.
 * @param {Object} instituicao_usuario - Campos a serem atualizados (ex.: {aceito: true}).
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object>} O vínculo atualizado.
 * @throws {Error} Caso nenhum campo seja fornecido ou ocorra erro na query.
 */
export const atualizar = async (id, instituicao_usuario, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(instituicao_usuario)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            throw new Error("Nenhum campo fornecido para atualização.");
        }

        values.push(id); // Adiciona o ID ao final dos valores

        const query = `UPDATE InstituicaoUsuario SET ${fields.join(", ")} WHERE id = ?`;

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar Instituição ou Instituição não encontrada.");
        }

        const updatedInstituicao = await buscarPorId(id, localCx);
        return updatedInstituicao;

    } catch (error) {
        throw new Error("Erro ao atualizar Instituição: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Busca um vínculo pelo ID.
 *
 * @async
 * @function buscarPorId
 * @param {number} id - ID do vínculo.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object|null>} Retorna o vínculo encontrado ou `null` se não existir.
 * @throws {Error} Caso ocorra erro na query.
 */
export const buscarPorId = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "SELECT * FROM InstituicaoUsuario WHERE id = ?";
  
        const [rows] = await localCx.execute(query, [id]);

        return rows[0];

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Remove um vínculo entre usuário e instituição.
 *
 * @async
 * @function deletar
 * @param {number} id - ID do vínculo.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<boolean>} Retorna `true` se deletado com sucesso.
 * @throws {Error} Caso ocorra erro na query.
 */
export const deletar = async (id, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }
        const query = "DELETE FROM InstituicaoUsuario WHERE id = ?;";
    
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao remover usuário da instituição.");
        } 

        return true;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Sai do vínculo entre usuário e instituição.
 *
 * @async
 * @function deletar
 * @param {number} id - ID do vínculo.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<boolean>} Retorna `true` se deletado com sucesso.
 * @throws {Error} Caso ocorra erro na query.
 */
export const sairDoVinculo = async (usuario, vinculo_id, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }
        const query = "DELETE FROM InstituicaoUsuario WHERE id = ? AND fk_usuario_id = ?;";
    
        const [result] = await localCx.execute(query, [vinculo_id, usuario]);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao remover usuário da instituição.");
        } 

        return true;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Lista todas as instituições em que um usuário está vinculado.
 *
 * @async
 * @function listarInstituicoesPorUsuario
 * @param {number} usuario_id - ID do usuário.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object[]>} Lista de instituições vinculadas ao usuário.
 * @throws {Error} Caso ocorra erro na query.
 */
export const listarInstituicoesPorUsuario = async (usuario_id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT
                Instituicoes.*, 
                InstituicaoUsuario.id AS vinculo_id,
                InstituicaoUsuario.aceito,  
                InstituicaoUsuario.bloqueado
            FROM 
                InstituicaoUsuario
            JOIN 
                Instituicoes ON InstituicaoUsuario.fk_instituicao_id = Instituicoes.id
            WHERE 
                InstituicaoUsuario.fk_usuario_id = ?
        `;
        const values = [usuario_id];

        const [rows] = await localCx.execute(query, values);

        return rows;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Lista todos os usuários vinculados a uma instituição.
 *
 * @async
 * @function listarUsuariosPorInstituicao
 * @param {number} instituicao_id - ID da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional do pool.
 * @returns {Promise<Object[]>} Lista de usuários vinculados à instituição.
 * @throws {Error} Caso ocorra erro na query.
 */
export const listarUsuariosPorInstituicao = async (instituicao_id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT
                Usuarios.*, 
                InstituicaoUsuario.id AS vinculo_id,
                InstituicaoUsuario.aceito, 
                InstituicaoUsuario.bloqueado
            FROM 
                InstituicaoUsuario
            JOIN 
                Usuarios ON InstituicaoUsuario.fk_usuario_id = Usuarios.id
            WHERE 
                InstituicaoUsuario.fk_instituicao_id = ?
        `;
        const values = [instituicao_id];

        const [rows] = await localCx.execute(query, values);

        return rows;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};


