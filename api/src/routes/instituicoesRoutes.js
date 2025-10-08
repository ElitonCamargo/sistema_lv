import * as instituicoesController from "../controllers/instituicoesController.js";
import autenticar from "../middlewares/autenticacao.js";
import express from "express";

const router = express.Router();

router.post("/instituicao",             autenticar, instituicoesController.cadastrar);
router.get("/instituicao/:id",          autenticar, instituicoesController.buscarPorId);
router.get("/instituicao/nome/:nome",   autenticar, instituicoesController.buscarPorNome);
router.get("/instituicoes/organizador", autenticar, instituicoesController.listarPorOrganizador);
router.get("/instituicoes",             autenticar, instituicoesController.listar);
router.patch("/instituicao/:id",        autenticar, instituicoesController.atualizar);
router.put("/instituicao/:id",          autenticar, instituicoesController.atualizarTudo);
router.delete("/instituicao/:id",       autenticar, instituicoesController.deletar);

export default router;