import * as instituicaoUsuarioController from "../controllers/InstituicaoUsuarioController.js";
import autenticar from "../middlewares/autenticacao.js";
import express from "express";

const router = express.Router();

//Solicitar vinculo com uma instituicao (estar logado)
router.post("/instituicao-usuario/solicitar",       autenticar, instituicaoUsuarioController.solicitarCadastro);
//Listar instituicoes do usuario logado (estar logado)
router.get("/instituicoes-usuario/logado",          autenticar, instituicaoUsuarioController.listarInstituicoesPorUsuario);
//Sair do vinculo com uma instituicao (estar logado fornecer o vinculo_id)
router.delete("/instituicao-usuario/sair",          autenticar, instituicaoUsuarioController.sairDoVinculo);
//Vincula um usuario a instituição diretamente (estar logado e ser admin da instituicao)
router.post("/instituicao-usuario",                 autenticar, instituicaoUsuarioController.cadastrar);
//Buscar vinculo por id (estar logado e ser admin da instituicao ou o proprio usuario)
router.get("/instituicao-usuario/:id",              autenticar, instituicaoUsuarioController.buscarPorId);
//Atualizar vinculo por id (estar logado e ser admin da instituicao ou o proprio usuario)
router.patch("/instituicao-usuario/:id",            autenticar, instituicaoUsuarioController.atualizar);
//Deletar vinculo por id (estar logado e ser admin da instituicao ou o proprio usuario)
router.delete("/instituicao-usuario/:id",           autenticar, instituicaoUsuarioController.deletar);
//Listar usuarios de uma instituicao (estar logado e ser admin da instituicao)
router.get("/usuarios-instituicao/:instituicao_id", autenticar, instituicaoUsuarioController.listarUsuariosPorInstituicao);

export default router;
