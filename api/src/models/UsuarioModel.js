import bycrypt from 'bcryptjs';
import pool from "../database/data.js";

export const cadastrar = async (usuario, cx = null) => {    
    let cxLocal = cx;
    if (!cxLocal) {
        // Obter uma conexão do pool se não foi fornecida (se é null)
        cxLocal = await pool.getConnection(); 
    }

    try {
        // Desestruturar o objeto usuario
        const { email ,senha ,nome ,avatar } = usuario; 

        const usuarioExistente = await consultarPorEmail(email, cxLocal);

        if (usuarioExistente) {
            throw new Error("Email já cadastrado");
        }

        // Hash da senha
        const salt = bycrypt.genSaltSync(10);
        const hashSenha = bycrypt.hashSync(senha, salt);

        // Query para inserir um novo usuário
        const query = `INSERT INTO Usuario (email ,senha ,nome ,avatar) VALUES (?, ?, ?, ?)`;

        // Executar a query com os valores do usuário
        const [result] = await cxLocal.query(query,[email ,hashSenha ,nome ,avatar]);
    
        // Verificar se a inserção foi bem-sucedida
        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar usuário");
        } 
        // Retornar o ID do usuário inserido
        const usuarioCadastrado = consultarPorId(result.insertId, cxLocal);
        usuarioCadastrado.senha = undefined;
        return usuarioCadastrado;
    } catch (error) {
        // Lançar o erro para ser tratado pelo chamador
        throw error; 
    } finally{
        if (!cx && cxLocal) {
            cxLocal.release(); // Liberar a conexão de volta ao pool
        }
    }
}


export const consultarPorEmail = async (email, cx = null) => {
    let cxLocal = cx;
    if (!cxLocal) {
        // Obter uma conexão do pool se não foi fornecida (se é null)
        cxLocal = await pool.getConnection(); 
    }

    try {
        // Query para consultar o usuário pelo email
        const query = `SELECT * FROM Usuario WHERE email = ?`;

        // Executar a query com o email fornecido
        const [rows] = await cxLocal.query(query, [email]);
        
        // Verificar se algum usuário foi encontrado
        if (rows.length === 0) {
            return null; // Retornar null se nenhum usuário for encontrado
        }
        
        // Retornar o primeiro usuário encontrado
        return rows[0]; 
    } catch (error) {
        // Lançar o erro para ser tratado pelo chamador
        throw error; 
    } finally{
        if (!cx && cxLocal) {
            cxLocal.release(); // Liberar a conexão de volta ao pool
        }
    }
}


export const consultarPorId = async (id, cx=null) => {
    let cxLocal = cx;
    if (!cxLocal) {
        // Obter uma conexão do pool se não foi fornecida (se é null)
        cxLocal = await pool.getConnection(); 
    }

    try {
        // Query para consultar o usuário por id
        const query = `SELECT * FROM Usuario WHERE id = ?`;

        // Executar a query com o email fornecido
        const [rows] = await cxLocal.query(query, [id]);
        
        // Verificar se algum usuário foi encontrado
        if (rows.length === 0) {
            return null; // Retornar null se nenhum usuário for encontrado
        }
        
        // Retornar o primeiro usuário encontrado
        return rows[0]; 
    } catch (error) {
        // Lançar o erro para ser tratado pelo chamador
        throw error; 
    } finally{
        if (!cx && cxLocal) {
            cxLocal.release(); // Liberar a conexão de volta ao pool
        }
    }
}

export const login = async (email, senha) => {
    // Obter uma conexão do pool
    const cx = await pool.getConnection(); 
    try {
        // Consultar o usuário pelo email
        const usuario = await consultarPorEmail(email, cx);   
        
        // Verificar se o usuário existe
        if (!usuario) {
            throw new Error("Usuário ou senha incorretos");
        }

        // Verificar se a senha está correta
        const senhaCorreta = bycrypt.compareSync(senha, usuario.senha);
        if (!senhaCorreta) {
            throw new Error("Usuário ou senha incorretos");
        }

        // Remover a senha do objeto usuário antes de retornar
        usuario.senha = undefined;
        
        // Retornar o usuário autenticado
        return usuario; 
    } catch (error) {
        // Lançar o erro para ser tratado pelo chamador
        throw error; 
    } finally {
        if (cx) {
            cx.release(); // Liberar a conexão de volta ao pool
        }
    }
}

