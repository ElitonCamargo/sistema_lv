# HoragaV2 — Sistema de Agendamento de Salas e Laboratórios

## Título e Descrição
HoragaV2 é um sistema de agendamento para controle de espaços (salas, laboratórios, auditórios) em instituições educacionais ou empresas. O sistema permite:
- cadastro de organizações/instituições;
- cadastro e gerenciamento de salas, laboratórios e auditórios;
- criação e gestão de horários e reservas;
- vinculação de usuários às organizações (organizador / membros);
- controle de conflitos para evitar agendamentos sobrepostos.

A aplicação está dividida em backend (API RESTful) e frontend (interface em Vue + Vuetify), orquestrada com Docker Compose.

---

## Funcionalidades (detalhado)
- Cadastrar organizações (instituições)
  - Endpoints e lógica relacionada: consulte [`cadastrarInstituicao`](api/src/models/InstituicaoModel.js) e o arquivo [api/src/models/InstituicaoModel.js](api/src/models/InstituicaoModel.js).

- Cadastrar e gerenciar salas, laboratórios e auditórios
  - CRUD de salas disponível em [`SalasModel`](api/src/models/SalasModel.js) — veja as funções (`cadastrarSala`, `listarSala`, `atualizarSala`, `deletarSala`) em [api/src/models/SalasModel.js](api/src/models/SalasModel.js).

- Criar e gerenciar horários de utilização
  - Estrutura de horários como JSON nas salas e agendamentos (veja [api/sql/schema.sql](api/sql/schema.sql) e [`SalasModel`](api/src/models/SalasModel.js)).
  - Validações no servidor para evitar conflitos: [`AgendamentoModel.validarDisponibilidade`](api/src/models/AgendamentoModel.js) — [api/src/models/AgendamentoModel.js](api/src/models/AgendamentoModel.js).

- Organizador vincular usuários à sua organização
  - Relação muitos-para-muitos entre usuários e instituições: tabela `inst_user` (schema: [api/sql/schema.sql](api/sql/schema.sql)).

- Reservas de horários, evitando agendamentos conflitantes
  - Lógica de agendamento: [`AgendamentoModel.agendarSala`](api/src/models/AgendamentoModel.js) — [api/src/models/AgendamentoModel.js](api/src/models/AgendamentoModel.js).
  - A validação de horários evita sobreposição usando [`AgendamentoModel.validarDisponibilidade`](api/src/models/AgendamentoModel.js).

- Gestão de usuários
  - Cadastro com hash de senha, verificação por email e recuperação do usuário cadastrado: [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js) — [api/src/models/UsuarioModel.js](api/src/models/UsuarioModel.js).
  - Funções auxiliares: [`UsuarioModel.buscarUsuarioPorEmail`](api/src/models/UsuarioModel.js), [`UsuarioModel.buscarUsuarioPorId`](api/src/models/UsuarioModel.js) — links: [api/src/models/UsuarioModel.js](api/src/models/UsuarioModel.js).
  - Endpoint de exemplo para cadastro: rota em [api/src/routes/usuarioRoutes.js](api/src/routes/usuarioRoutes.js) e controller [`cadastrarUsuario`](api/src/controllers/usuarioController.js) — [api/src/controllers/usuarioController.js](api/src/controllers/usuarioController.js).

---

## Arquitetura do Sistema
O sistema é composto por duas partes principais:

1. API RESTful (back-end)
   - Implementada em Node.js + Express.
   - Arquivo principal: [api/src/app.js](api/src/app.js).
   - Dependências: express, mysql2, bcryptjs, cors, dotenv, jsonwebtoken (veja [api/package.json](api/package.json)).
   - Conexão com banco via pool [`pool`](api/src/database/data.js) e configuração em [`db`](api/src/config/config.js) — [api/src/database/data.js](api/src/database/data.js), [api/src/config/config.js](api/src/config/config.js).

2. Front-end
   - Projeto front (Vue + Vuetify recomendado) — entry point atualmente em [front/app.js](front/app.js) e dependências em [front/package.json](front/package.json).
   - Serve a interface ao usuário via navegador (responsivo para dispositivos móveis).

---

## Banco de Dados
- SGBD: MySQL 8.0.
- Modelagem: entidade-relacionamento com tabelas principais:
  - Instituições: [api/sql/schema.sql](api/sql/schema.sql) — CREATE TABLE `Instituicoes`.
  - Usuários: tabela `Usuarios` (hash de senha armazenado).
  - Salas: tabela `Salas` (campo `horario` em JSON).
  - Agendamentos: tabela `Agendamentos` (campo `horarios` em JSON).
  - Relação `inst_user` para vincular usuários e instituições.
- Scripts SQL:
  - Esquema: [api/sql/schema.sql](api/sql/schema.sql)
  - Seed (dados iniciais): [api/sql/seed.sql](api/sql/seed.sql)

---

## Infraestrutura com Docker
A aplicação é executada via Docker Compose e contém três containers principais:
- api — Node.js 18 (container: `api`) — fonte: [docker-compose.yml](docker-compose.yml) e [api/src/app.js](api/src/app.js).
- mysql_db — MySQL 8.0 (container: `mysql_db`) — banco de dados configurado no [docker-compose.yml](docker-compose.yml).
- front (front_end) — Node.js 18 (container: `front`) — fonte: [front/app.js](front/app.js).

Arquivo de orquestração: [docker-compose.yml](docker-compose.yml)  
Makefile para operações com banco: [Makefile](Makefile)

---

## Pré-requisitos
- Docker (>= 20.10)
- Docker Compose (ou suporte via Docker CLI)
- Make (opcional, para tarefas com o banco)
- (Opcional) Node.js + npm se desejar rodar sem Docker

---

## Instalação e Uso
1. Clonar o repositório
```sh
git clone [<repo-url>](https://github.com/santinigabriel1/HoragaV2.git)
cd HoragaV2
```

2. Ajustar variáveis de ambiente (opcional)
- API: usa variáveis via dotenv e [api/src/config/config.js](api/src/config/config.js). Em produção ajuste:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT
- Front: variáveis em [front/package.json](front/package.json) / [front/app.js](front/app.js) se necessário.

3. Subir containers (modo detach)
```sh
docker compose up -d
```

4. Acessar serviços
- API: http://localhost:3000 — entry: [api/src/app.js](api/src/app.js)
- Front: http://localhost:8081 — entry: [front/app.js](front/app.js)

5. Comandos de banco via Make (rodando com o container do MySQL em execução)
- Apagar e recriar schema:
```sh
make reset-schema
```
- Apagar, recriar schema e popular banco:
```sh
make reset-db
```
- Popular banco com seed:
```sh
make seed
```

Importante: o container do MySQL no compose se chama `mysql_db` (ver [docker-compose.yml](docker-compose.yml)) e o Makefile assume esse nome.

---

## Comandos Importantes
- Executar servidor: docker compose up -d
- Parar servidor: docker compose down
- Apagar e recriar schema: make reset-schema
- Apagar, recriar schema e popular banco: make reset-db
- Popular banco com dados iniciais: make seed

---

## Exemplos de Uso da API
- Cadastro de usuário (rota registrada em [api/src/routes/usuarioRoutes.js](api/src/routes/usuarioRoutes.js); controller: [`cadastrarUsuario`](api/src/controllers/usuarioController.js)):
```http
POST /usuarios
Content-Type: application/json

{
  "nome": "Fulano",
  "email": "fulano@teste.com",
  "senha": "senha123",
  "cargo": "Professor"
}
```
- Observações:
  - Cadastro chama [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js) que faz hash da senha com bcrypt e verifica duplicidade por email — [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js).

- Validação de disponibilidade antes de agendar:
  - [`AgendamentoModel.validarDisponibilidade`](api/src/models/AgendamentoModel.js) — [api/src/models/AgendamentoModel.js](api/src/models/AgendamentoModel.js)

---

## Estrutura do Projeto
Árvore dos principais arquivos:
```
.
├─ docker-compose.yml
├─ Makefile
├─ README.md
├─ api/
│  ├─ package.json
│  ├─ sql/
│  │  ├─ schema.sql
│  │  └─ seed.sql
│  └─ src/
│     ├─ app.js
│     ├─ config/
│     │  └─ config.js
│     ├─ controllers/
│     │  └─ usuarioController.js
│     ├─ database/
│     │  └─ data.js
│     ├─ models/
│     │  ├─ UsuarioModel.js
│     │  ├─ InstituicaoModel.js
│     │  ├─ SalasModel.js
│     │  └─ AgendamentoModel.js
│     └─ routes/
│        └─ usuarioRoutes.js
└─ front/
   ├─ app.js
   └─ package.json
```

Arquivos principais (links):
- [docker-compose.yml](docker-compose.yml)
- [Makefile](Makefile)
- API entry: [api/src/app.js](api/src/app.js)
- Front entry: [front/app.js](front/app.js)
- Pool MySQL: [`pool`](api/src/database/data.js) — [api/src/database/data.js](api/src/database/data.js)
- DB config: [`db`](api/src/config/config.js) — [api/src/config/config.js](api/src/config/config.js)
- Schema SQL: [api/sql/schema.sql](api/sql/schema.sql)
- Seed SQL: [api/sql/seed.sql](api/sql/seed.sql)

Modelos e funções relevantes:
- Usuário: [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js), [`UsuarioModel.buscarUsuarioPorEmail`](api/src/models/UsuarioModel.js), [`UsuarioModel.buscarUsuarioPorId`](api/src/models/UsuarioModel.js) — [api/src/models/UsuarioModel.js](api/src/models/UsuarioModel.js)
- Instituição: [`cadastrarInstituicao`](api/src/models/InstituicaoModel.js) — [api/src/models/InstituicaoModel.js](api/src/models/InstituicaoModel.js)
- Sala: [`SalasModel.cadastrarSala`](api/src/models/SalasModel.js) — [api/src/models/SalasModel.js](api/src/models/SalasModel.js)
- Agendamento: [`AgendamentoModel.validarDisponibilidade`](api/src/models/AgendamentoModel.js), [`AgendamentoModel.agendarSala`](api/src/models/AgendamentoModel.js) — [api/src/models/AgendamentoModel.js](api/src/models/AgendamentoModel.js)

---

## Boas práticas e observações
- Senhas: armazenadas com hash (`bcryptjs`) — ver [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js).
- Use transações quando múltiplos inserts/updates dependem uns dos outros (por exemplo: cadastro de instituição + vínculo organizador).
- Validações críticas (horários) devem ficar no servidor — ver [`AgendamentoModel.validarDisponibilidade`](api/src/models/AgendamentoModel.js).
- Em produção, configure variáveis de ambiente e limite de conexões do pool em [`api/src/database/data.js`](api/src/database/data.js).

---

## Contribuição
Contribuições são bem-vindas. Fluxo recomendado:
1. Fork do repositório.
2. Criar branch feature/<nome> ou fix/<id>.
3. Implementar alterações, adicionar/atualizar testes.
4. Abrir Pull Request descrevendo mudanças.

Antes de enviar PR:
- Rode a aplicação localmente via Docker Compose.
- Atualize [api/sql/schema.sql](api/sql/schema.sql) e [api/sql/seed.sql](api/sql/seed.sql) quando alterar o modelo.
- Documente endpoints novos/alterados.

---

## Licença
Defina aqui a licença do projeto (ex.: MIT, Apache-2.0). Atualmente é um placeholder.

---

## Referências rápidas (arquivos e símbolos)
- [api/src/app.js](api/src/app.js)
- [front/app.js](front/app.js)
- [docker-compose.yml](docker-compose.yml)
- [Makefile](Makefile)
- SQL: [api/sql/schema.sql](api/sql/schema.sql), [api/sql/seed.sql](api/sql/seed.sql)
- Pool: [`pool`](api/src/database/data.js) — [api/src/database/data.js](api/src/database/data.js)
- DB config: [`db`](api/src/config/config.js) — [api/src/config/config.js](api/src/config/config.js)
- Usuário: [`UsuarioModel.cadastrar`](api/src/models/UsuarioModel.js) — [api/src/models/UsuarioModel.js](api/src/models/UsuarioModel.js)
- Controller de usuário: [`cadastrarUsuario`](api/src/controllers/usuarioController.js) — [api/src/controllers/usuarioController.js](api/src/controllers/usuarioController.js)
- Rotas: [api/src/routes/usuarioRoutes.js](api/src/routes/usuarioRoutes.js)
- Salas: [api/src/models/SalasModel.js](api/src/models/SalasModel.js)
- Agendamentos: [api/src/models/AgendamentoModel.js](api/src/models/AgendamentoModel.js)