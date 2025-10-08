import pool from "../database/data.js";

/**
 * Cadastra uma nova instituição no banco de dados.
 *
 * @param {Object} instituicao - Dados da instituição.
 * @param {number} instituicao.organizador - ID do organizador.
 * @param {string} instituicao.nome - Nome da instituição.
 * @param {string} instituicao.descricao - Descrição da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object>} Retorna a instituição recém-cadastrada.
 * @throws {Error} Caso ocorra erro durante o cadastro.
 */
export const cadastrar = async (instituicao, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { organizador, nome, descricao } = instituicao;
        const query = "INSERT INTO Instituicoes (organizador, nome, descricao) VALUES (?, ?, ?)";
        const values = [organizador, nome, descricao];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar Instituição.");
        } 

        const lastId = result.insertId;

        const newInstituicao = await buscarPorId(lastId, localCx);       
        return newInstituicao;

    } catch (error) {
        throw new Error("Erro ao cadastrar Instituição: " + error.message);
    } finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
};


/**
 * Busca uma instituição pelo ID.
 *
 * @param {number} id - ID da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object|null>} Retorna a instituição encontrada ou null se não existir.
 * @throws {Error} Caso ocorra erro na consulta.
 */
export const buscarPorId = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE id = ?";
        const [rows] = await localCx.execute(query, [id]);

        let Instituicao = rows[0];
        return Instituicao;
    } catch (error) {
        throw new Error("Erro ao buscar Instituicao por ID: " + error.message);
    }finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
}


/**
 * Busca uma instituição pelo nome.
 *
 * @param {string} nome - Nome da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object|null>} Retorna a instituição encontrada ou null se não existir.
 * @throws {Error} Caso ocorra erro na consulta.
 */
export const buscarPorNome = async (nome, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE nome = ?";
        const [rows] = await localCx.execute(query, [nome]);

        let Instituicao = rows[0];
        return Instituicao;
    } catch (error) {
        throw new Error("Erro ao buscar Instituicao por Nome: " + error.message);
    }finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Lista todas as instituições de um organizador específico.
 *
 * @param {number} organizadorId - ID do organizador.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object[]>} Retorna a lista de instituições do organizador.
 * @throws {Error} Caso ocorra erro na consulta.
 */
export const listarPorOrganizador = async (organizadorId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE organizador = ?";
        const [rows] = await localCx.execute(query, [organizadorId]);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar Instituições por Organizador: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
}

/**
 * Lista todas as instituições filtradas por nome ou descrição.
 *
 * @param {string} search - Texto de busca para nome ou descrição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object[]>} Retorna a lista de instituições encontradas.
 * @throws {Error} Caso ocorra erro na consulta.
 */
export const listar = async (search, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE nome LIKE ? OR descricao LIKE ?";
        const searchPattern = `%${search}%`;
        const queryParams = [searchPattern, searchPattern];
        const [rows] = await localCx.execute(query, queryParams);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar todas as Instituições: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
}

/**
 * Atualiza todos os campos de uma instituição.
 *
 * @param {number} id - ID da instituição.
 * @param {Object} instituicao - Dados da instituição.
 * @param {number} instituicao.organizador - ID do organizador.
 * @param {string} instituicao.nome - Nome da instituição.
 * @param {string} instituicao.descricao - Descrição da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object>} Retorna a instituição atualizada.
 * @throws {Error} Caso ocorra erro durante a atualização.
 */
export const atualizarTudo = async (id, instituicao, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const { organizador, nome, descricao } = instituicao;
        const query = "UPDATE Instituicoes SET organizador = ?, nome = ?, descricao = ? WHERE id = ?";
        const values = [organizador, nome, descricao, id];

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
 * Atualiza apenas os campos fornecidos de uma instituição.
 *
 * @param {number} id - ID da instituição.
 * @param {Object} instituicao - Campos para atualização.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object>} Retorna a instituição atualizada.
 * @throws {Error} Caso ocorra erro durante a atualização.
 */
export const atualizar = async (id, instituicao, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(instituicao)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            throw new Error("Nenhum campo fornecido para atualização.");
        }

        values.push(id); // Adiciona o ID ao final dos valores

        const query = `UPDATE Instituicoes SET ${fields.join(", ")} WHERE id = ?`;

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
 * Deleta uma instituição pelo ID.
 *
 * @param {number} id - ID da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<boolean>} Retorna true se a instituição foi deletada com sucesso.
 * @throws {Error} Caso ocorra erro durante a exclusão.
 */
export const deletar = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "DELETE FROM Instituicoes WHERE id = ?";
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao deletar Instituição ou Instituição não encontrada.");
        }

        return true;

    } catch (error) {
        throw new Error("Erro ao deletar Instituição: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};