// ...existing code...
import bcrypt from 'bcryptjs';
import pool from "../database/data.js";

/**
 * Modelo de Usuário convertido para classe.
 */
export class UsuarioModel {
    constructor(dbPool = pool) {
        this.pool = dbPool;
    }

    
    async cadastrar(usuario, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();

            const { nome, email, senha, cargo, avatar } = usuario;
            const query = "INSERT INTO Usuarios (nome, email, senha, cargo, avatar) VALUES (?, ?, ?, ?, ?)";
            const hashSenha = await bcrypt.hash(senha, 10);
            const values = [nome, email, hashSenha, cargo, avatar];

            const usuarioExistente = await this.buscarPorEmail(email, localCx);
            if (usuarioExistente) throw new Error("Email já cadastrado");

            const [result] = await localCx.execute(query, values);
            if (result.affectedRows === 0) throw new Error("Erro ao cadastrar usuário");

            const lastIdUser = result.insertId;
            const usuarioCadastrado = await this.buscarPorId(lastIdUser, localCx);
            if (usuarioCadastrado) delete usuarioCadastrado.senha;
            return usuarioCadastrado;
        } catch (error) {
            throw new Error("Erro ao cadastrar usuário: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async login(email, senha) {
        const cx = await this.pool.getConnection();
        try {
            const usuario = await this.buscarPorEmail(email, cx);
            if (!usuario) return null;
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) return null;
            delete usuario.senha;
            return usuario;
        } catch (error) {
            throw new Error("Erro ao efetuar login: " + error.message);
        } finally {
            if (cx) cx.release();
            console.log("finalizou login");
        }
    }

    async listar(search = "", cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();

            let query = "SELECT id,nome,email,cargo,avatar,createdAt,updatedAt FROM Usuarios";
            let values = [];

            if (search) {
                query += " WHERE nome LIKE ? OR email LIKE ?";
                values = [`%${search}%`, `%${search}%`];
            }

            const [rows] = await localCx.execute(query, values);
            return rows;
        } catch (error) {
            throw new Error("Erro ao buscar usuário por email: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async buscarPorId(id, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();
            const query = "SELECT * FROM Usuarios WHERE id = ?";
            const [rows] = await localCx.execute(query, [id]);
            return rows[0];
        } catch (error) {
            throw new Error("Erro ao buscar usuário por ID: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async buscarPorEmail(email, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();
            const query = "SELECT * FROM Usuarios WHERE email = ?";
            const [rows] = await localCx.execute(query, [email]);
            return rows[0];
        } catch (error) {
            throw new Error("Erro ao buscar usuário por email: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async atualizarTudo(id, usuario, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();
            const { nome, email, senha, cargo, avatar } = usuario;
            const hashSenha = await bcrypt.hash(senha, 10);
            const query = "UPDATE Usuarios SET nome = ?, email = ?, senha = ?, cargo = ?, avatar = ? WHERE id = ?";
            const values = [nome, email, hashSenha, cargo, avatar, id];
            const [result] = await localCx.execute(query, values);
            if (result.affectedRows === 0) throw new Error("Erro ao atualizar usuário");
            const usuarioAtualizado = await this.buscarPorId(id, localCx);
            if (usuarioAtualizado) delete usuarioAtualizado.senha;
            return usuarioAtualizado;
        } catch (error) {
            throw new Error("Erro ao atualizar usuário: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async atualizar(id, usuario, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();

            let atributos = [];
            let values = [];

            for (const chave in usuario) {
                if (Object.prototype.hasOwnProperty.call(usuario, chave) && usuario[chave] !== undefined) {
                    if (chave === "senha") {
                        const hashSenha = await bcrypt.hash(usuario[chave], 10);
                        atributos.push('senha = ?');
                        values.push(hashSenha);
                    } else {
                        atributos.push(`${chave} = ?`);
                        values.push(usuario[chave]);
                    }
                }
            }

            if (atributos.length === 0) throw new Error("Nenhum campo para atualizar");

            values.push(id);
            const query = `UPDATE Usuarios SET ${atributos.join(", ")} WHERE id = ?`;
            const [result] = await localCx.execute(query, values);
            if (result.affectedRows === 0) throw new Error("Erro ao atualizar usuário");
            const usuarioAtualizado = await this.buscarPorId(id, localCx);
            if (usuarioAtualizado) delete usuarioAtualizado.senha;
            return usuarioAtualizado;
        } catch (error) {
            throw new Error("Erro ao atualizar usuário: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }

    async deletar(id, cx = null) {
        let localCx = cx;
        try {
            if (!localCx) localCx = await this.pool.getConnection();
            const query = "DELETE FROM Usuarios WHERE id = ?";
            const [result] = await localCx.execute(query, [id]);
            return (result.affectedRows > 0);
        } catch (error) {
            throw new Error("Erro ao deletar usuário: " + error.message);
        } finally {
            if (!cx && localCx) localCx.release();
        }
    }
}

// Exporta a classe e uma instância padrão
// ...existing code...
export default new UsuarioModel();