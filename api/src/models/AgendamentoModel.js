import pool from "../database/data.js";

export const validarDisponibilidade = async (fk_salas_id, hora_inicio, hora_fim) => {
    try {
        const query = `
            SELECT COUNT(*) AS count
            FROM agendamento
            WHERE fk_salas_id = ?
            AND (
                (hora_inicio <= ? AND hora_fim > ?)
                OR (hora_inicio < ? AND hora_fim >= ?)
                OR (hora_inicio >= ? AND hora_fim <= ?)
            )
        `;
        const values = [fk_salas_id, hora_inicio, hora_inicio, hora_fim, hora_fim, hora_inicio, hora_fim];
        const [rows] = await pool.execute(query, values);
        return rows[0].count === 0;
    } catch (error) {
        throw new Error("Erro ao validar disponibilidade: " + error.message);
    }
};

export const agendarSala = async (agendamento) => {
    try {
        const { fk_usuario_id, fk_salas_id, titulo, descricao, hora_inicio, hora_fim } = agendamento;
        const query = "INSERT INTO agendamento (fk_usuario_id, fk_salas_id, titulo, descricao, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [fk_usuario_id, fk_salas_id, titulo, descricao, hora_inicio, hora_fim];
        const [result] = await pool.execute(query, values);
        const lastIdAgendamento = result.insertId;
        return lastIdAgendamento;
    } catch (error) {
        throw new Error("Erro ao agendar sala: " + error.message);
    }
};


