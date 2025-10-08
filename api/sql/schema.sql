CREATE DATABASE IF NOT EXISTS sistema_lv;
USE sistema_lv;
-- Remove as tabelas se já existirem (ordem importa por causa das FKs)

DROP TABLE IF EXISTS Sessoes;
DROP TABLE IF EXISTS Usuarios;

-- Criação da tabela de usuários
CREATE TABLE Usuarios (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    avatar VARCHAR(50),
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Criação da tabela de Sessoes
CREATE TABLE Sessoes (
  usuario BIGINT unsigned NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  validade datetime DEFAULT NULL,
  PRIMARY KEY (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE Sessoes ADD CONSTRAINT FK_Sessoes_Usuarios
    FOREIGN KEY (usuario)
    REFERENCES Usuarios (id) ON DELETE CASCADE; 
