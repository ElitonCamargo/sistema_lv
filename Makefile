# Nome do container do MySQL no Docker
CONTAINER_NAME=lv_mysql_db
DB_USER=root
DB_PASS=root
DB_NAME=sistema_lv

# Caminho para os arquivos SQL
SCHEMA=./api/sql/schema.sql
SEED=./api/sql/seed.sql

# Apaga e recria apenas o schema
reset-schema:
	docker exec -i $(CONTAINER_NAME) mysql -u $(DB_USER) -p$(DB_PASS) < $(SCHEMA)

# Apaga e recria o schema e popula com dados iniciais
reset-db:
	docker exec -i $(CONTAINER_NAME) mysql -u $(DB_USER) -p$(DB_PASS) < $(SCHEMA)
	docker exec -i $(CONTAINER_NAME) mysql -u $(DB_USER) -p$(DB_PASS) $(DB_NAME) < $(SEED)

# Executa apenas o seed (dados iniciais)
seed:
	docker exec -i $(CONTAINER_NAME) mysql -u $(DB_USER) -p$(DB_PASS) $(DB_NAME) < $(SEED)

# Iniciando os containers
up:
	docker compose up db -d
	docker compose up api -d
	docker compose up app -d
# Parando os containers
down:
	docker compose down

# log dos containers
logs:
	docker compose logs -f

# Staus dos containers
status:
	docker compose ps -a

