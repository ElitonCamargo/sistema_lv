import * as sessoesModel from '../models/SessoesModel.js';
import * as sessoesCache from '../utils/sessoesCache.js';
import * as responses from '../utils/responses.js'

export default async function autenticar(req, res, next) {
    try {        
        const authorizationHeader = req.headers['authorization'];
        
        if (!authorizationHeader) {
            return responses.error(res,{statusCode: 498, message:"Token de autenticação não fornecido"});            
        }
        
        const [bearer, token] = authorizationHeader.split(' ');
        
        if (bearer !== 'Bearer' || !token) {
            return responses.error(res,{statusCode: 498, message:"Formato de token inválido"});            
        }

        const [loginId] = token.split('.');
        const chave_token = token.replace(`${loginId}.`, "");
        
        let sessao_usuario = sessoesCache.buscarSessao(loginId,chave_token);

        if(sessao_usuario){
            req.loginId = loginId;
            next();
            return;
        }
        
        // Buscar a sessão no banco de dados ************************************************************

        sessao_usuario = await sessoesModel.buscarSessao(loginId,chave_token);
        
        if(!sessao_usuario){
            return responses.error(res,{statusCode:498, message:'Token de autenticação inválido'});
        }

        if(sessao_usuario.validade < new Date()){
            return responses.error(res,{statusCode:498, message:'Token de autenticação expirou'});
        }

        const horaAtual = new Date();
        const tempoParaExpirar = (sessao_usuario.validade.getTime() - horaAtual.getTime())/60000;
        if(tempoParaExpirar < 60){
            const t_ex = await sessoesModel.extender(loginId,24);
            if(t_ex) console.log("Token Extendico por mais 24 para o ID"+loginId);
        }

        sessoesCache.addSessao(loginId,chave_token);
        req.loginId = loginId;
        next();
        return;
               
    } catch (error) {
        return responses.error(res,{statusCode:500,message:`Erro interno do servidor: ${error}`})        
    }
};