import pool from '../database/data.js';

export const cadastrarSala = async (salas) => {
    try {
        const {fk_instituicao_id, nome, capacidade} = salas;
        const query = "INSERT INTO salas (fk_instituicao_id, nome, capacidade) VALUES (?, ?, ?)";
        const values = [fk_instituicao_id, nome, capacidade];
        const [result] = await pool.execute(query, values);
        const lastIdSala = result.insertId;
        return lastIdSala;
    } catch (error) {
        throw new Error("Erro ao cadastrar sala: " + error.message);
    }
};

export const listarSala = async () => {
    try {
        const query = "SELECT * FROM salas";
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar salas: " + error.message);
    }
};

export const atualizarSala = async (id, salas) => {
    try {
        const { fk_instituicao_id, nome, capacidade } = salas;
        const query = "UPDATE salas SET fk_instituicao_id = ?, nome = ?, capacidade = ? WHERE id = ?";
        const values = [fk_instituicao_id, nome, capacidade, id];
        await pool.execute(query, values);
    } catch (error) {
        throw new Error("Erro ao atualizar sala: " + error.message);
    }
};

export const deletarSala = async (id) => {
    try {
        const query = "DELETE FROM salas WHERE id = ?";
        await pool.execute(query, [id]);
    } catch (error) {
        throw new Error("Erro ao deletar sala: " + error.message);
    }
};