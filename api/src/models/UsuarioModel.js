import bcrypt from 'bcryptjs';
import pool from "../database/data.js";

/**
 * Cadastra um novo usuário no banco de dados.
 * - Criptografa a senha antes de salvar
 * - Verifica se o e-mail já está cadastrado
 *
 * @param {Object} usuario - Objeto contendo os dados do usuário
 * @param {string} usuario.nome - Nome do usuário
 * @param {string} usuario.email - E-mail do usuário
 * @param {string} usuario.senha - Senha em texto puro (será criptografada)
 * @param {string} usuario.cargo - Cargo/função do usuário
 * @param {string} usuario.avatar - Avatar/função do usuário
 * @returns {Promise<Object>} Retorna o usuário recém-cadastrado
 * @throws {Error} Caso o e-mail já exista ou ocorra erro no insert
 */
export const cadastrar = async (usuario, cx = null) => {   // Função para cadastrar um usuário no banco de dados (Create)
    let localCx = cx; // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {

        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }
        // Desestrutura os dados recebidos do objeto usuário
        const { nome, email, senha, cargo, avatar } = usuario;
        // Query SQL para inserir um novo usuário
        const query = "INSERT INTO Usuarios (nome, email, senha, cargo, avatar) VALUES (?, ?, ?, ?, ?)";

        // Criptografa a senha antes de salvar no banco
        const hashSenha = await bcrypt.hash(senha, 10);

        // Monta o array de valores para substituir os placeholders da query
        const values = [nome, email, hashSenha, cargo, avatar];

        // Verifica se já existe um usuário com o mesmo e-mail
        const usuarioExistente = await buscarPorEmail(email, localCx);
        if (usuarioExistente) {
            throw new Error("Email já cadastrado");
        }

        // Executa a query de inserção com os valores
        const [result] = await localCx.execute(query, values);

        // Verifica se alguma linha foi afetada (se o insert funcionou)
        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar usuário");
        } 

        // Pega o ID do último usuário inserido
        const lastIdUser = result.insertId;
        // Retorna o usuário cadastrado, buscando por ID
        const usuarioCadastrado = await buscarPorId(lastIdUser, localCx);       
        return usuarioCadastrado;

    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Efetua o login de um usuário.
 * - Verifica se o e-mail existe
 * - Compara a senha fornecida com a senha criptografada no banco
 *
 * @param {string} email - E-mail do usuário
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<Object>} Retorna o usuário logado (sem a senha)
 * @throws {Error} Caso o e-mail não exista ou a senha esteja incorreta 
 */

export const login = async (email, senha) => { // Função para efetuar o login do usuário
    const cx = await pool.getConnection(); // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {

        // Busca o usuário pelo e-mail
        const usuario = await buscarPorEmail(email, cx);
        if (!usuario) {
            return null; // Retorna null se o usuário não for encontrado
        }        
        // Compara a senha fornecida com a senha criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return null; // Retorna null se a senha estiver incorreta
        }
        // Remove a senha do objeto usuário antes de retornar
        
        
        return usuario;
        
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao efetuar login: " + error.message);
    }finally{        
        // Garante que a conexão será liberada de volta ao pool
        if (cx) { // só libera se a conexão foi criada aqui
            cx.release();
        }
        console.log("finalizou login");
    }
};

/**
 * Lista todos os usuários cadastrados no banco de dados.
 *
 * @returns {Promise<Array>} Array de usuários
 * @throws {Error} Caso ocorra erro na consulta
 */
export const listar = async (search = "", cx = null) => { // Função para listar todos os usuários (Read)
    let localCx = cx; // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }
        let query = "SELECT id,nome,email,cargo,avatar,createdAt,updatedAt FROM Usuarios";
        
        let values = [];

        if(search){
            query += "  WHERE nome LIKE ? OR email LIKE ?";
            values = [`%${search}%`, `%${search}%`];
        }
        
        // Executa a query passando o e-mail como parâmetro
        const [rows] = await localCx.execute(query, values);
        // Retorna apenas o primeiro resultado
        return rows;

    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por email: " + error.message);
    }finally{
    // Libera a conexão
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Busca um usuário pelo seu ID.
 *
 * @param {number} id - ID do usuário
 * @returns {Promise<Object|null>} Retorna o usuário encontrado ou null se não existir
 * @throws {Error} Caso ocorra erro na consulta
 */
export const buscarPorId = async (id, cx = null) => { // Função para buscar um usuário pelo ID (Read)
    let localCx = cx; // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }
        // Query SQL para buscar um usuário pelo ID
        const query = "SELECT * FROM Usuarios WHERE id = ?";
        // Executa a query passando o ID como parâmetro
        const [rows] = await localCx.execute(query, [id]);
        // Retorna apenas o primeiro resultado (usuário encontrado)
        let usuario = rows[0];
        return usuario;
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por ID: " + error.message);
    }finally{
        // Libera a conexão
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
}

/**
 * Busca um usuário pelo e-mail.
 *
 * @param {string} email - E-mail do usuário
 * @returns {Promise<Object|null>} Retorna o usuário encontrado ou null se não existir
 * @throws {Error} Caso ocorra erro na consulta
 */
export const buscarPorEmail = async (email, cx = null) => { // Função para buscar um usuário pelo e-mail (Read)
    let localCx = cx; // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }
        // Query SQL para buscar usuário pelo e-mail
        const query = "SELECT * FROM Usuarios WHERE email = ?";
        // Executa a query passando o e-mail como parâmetro
        const [rows] = await localCx.execute(query, [email]);
        // Retorna apenas o primeiro resultado
        let usuario = rows[0];
        return usuario;
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por email: " + error.message);
    }finally{
    // Libera a conexão
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Atualiza os dados de um usuário existente.
 *
 * @param {number} id - ID do usuário a ser atualizado
 * @param {Object} usuario - Objeto contendo os novos dados
 * @param {string} usuario.nome - Nome do usuário
 * @param {string} usuario.email - E-mail do usuário
 * @param {string} usuario.senha - Senha em texto puro (não está criptografada aqui)
 * @param {string} usuario.cargo - Cargo/função do usuário
 * @param {string} usuario.avatar - Avatar/função do usuário
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro na atualização
 */
export const atualizarTudo = async (id, usuario, cx = null) => {  // U
    let localCx = cx; // Declara a variável de conexão

    try {
        // Obtém uma conexão do pool
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }

        // Query SQL para atualizar um usuário por ID
        const { nome, email, senha, cargo, avatar } = usuario;

        // Criptografa a senha antes de salvar no banco
        const hashSenha = await bcrypt.hash(senha, 10);
        
        const query = "UPDATE Usuarios SET nome = ?, email = ?, senha = ?, cargo = ?, avatar = ? WHERE id = ?";
        const values = [nome, email, hashSenha, cargo, avatar, id];

        // Executa a query e captura o resultado
        const [result] = await localCx.execute(query, values);

        // Verifica se alguma linha foi afetada (se o update funcionou)
        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar usuário");
        }

        // Retorna o usuário atualizado, buscando por ID
        const usuarioAtualizado = await buscarPorId(id, localCx);
        delete usuarioAtualizado.senha; // Remove a senha do objeto antes de retornar
        return usuarioAtualizado;

    } catch (error) {
        // Lança um erro para ser capturado pelo controller
        throw new Error("Erro ao atualizar usuário: " + error.message);
    } finally {
        // Garante que a conexão será liberada, se ela existir
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Atualiza os dados de um usuário existente.
 *
 * @param {number} id - ID do usuário a ser atualizado
 * @param {Object} usuario - Objeto contendo os novos dados
 * @param {string} usuario.nome? - Nome do usuário
 * @param {string} usuario.email? - E-mail do usuário
 * @param {string} usuario.senha? - Senha em texto puro (não está criptografada aqui)
 * @param {string} usuario.cargo? - Cargo/função do usuário
 * @param {string} usuario.avatar? - Avatar/função do usuário
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro na atualização
 */
export const atualizar = async (id, usuario, cx = null) => {  // U
    let localCx = cx; // Declara a variável de conexão

    try {
        // Obtém uma conexão do pool
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }

        let atributos = [];
        let values = [];

        // Adiciona os atributos que foram fornecidos no objeto usuario

        for (const chave in usuario) {
            if (usuario.hasOwnProperty(chave) && usuario[chave] !== undefined) {
                if (chave === "senha") {
                    // Criptografa a senha antes de salvar no banco
                    const hashSenha = await bcrypt.hash(usuario[chave], 10);
                    atributos.push('senha = ?');
                    values.push(hashSenha);
                }
                else {
                    atributos.push(`${chave} = ?`);
                    values.push(usuario[chave]);
                }
            }
        }

        if (atributos.length === 0) {
            throw new Error("Nenhum campo para atualizar");
        }

        // Adiciona o ID ao final do array de valores para o WHERE
        values.push(id);

        // Monta a query SQL dinamicamente
        const query = `UPDATE Usuarios SET ${atributos.join(", ")} WHERE id = ?`;
       
        // Executa a query e captura o resultado
        const [result] = await localCx.execute(query, values);

        // Verifica se alguma linha foi afetada (se o update funcionou)
        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar usuário");
        }

        // Retorna o usuário atualizado, buscando por ID
        const usuarioAtualizado = await buscarPorId(id, localCx);
        delete usuarioAtualizado.senha; // Remove a senha do objeto antes de retornar
        return usuarioAtualizado;

    } catch (error) {
        // Lança um erro para ser capturado pelo controller
        throw new Error("Erro ao atualizar usuário: " + error.message);
    } finally {
        // Garante que a conexão será liberada, se ela existir
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Deleta um usuário do banco de dados.
 *
 * @param {number} id - ID do usuário a ser removido
 * @returns {Promise<boolean>} Retorna true se o usuário foi deletado, false se não foi encontrado
 * @throws {Error} Caso ocorra erro na exclusão
 */
export const deletar = async (id, cx = null) => {
    let localCx = cx; // Declara a variável de conexão

    try {
        // Obtém uma conexão do pool
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }

        // Query SQL para deletar um usuário por ID
        const query = "DELETE FROM Usuarios WHERE id = ?";

        // Executa a query e captura o resultado
        const [result] = await localCx.execute(query, [id]);

        return (result.affectedRows > 0); //se a quantidade de linha afetadas é maior que zero => true senão => false

    } catch (error) {
        // Lança um erro para ser capturado pelo controller
        throw new Error("Erro ao deletar usuário: " + error.message);
    } finally {
        // Garante que a conexão será liberada, se ela existir
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};
