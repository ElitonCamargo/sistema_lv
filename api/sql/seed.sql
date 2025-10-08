USE sistema_lv;

-- Usuários
INSERT INTO Usuarios (nome, email, senha, cargo) VALUES
('Admin',       'admin@gmail.com',  '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Administrador'),
('Maria Silva', 'maria@gmail.com',  '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Professor'),
('Joao Souza',  'joao@gmail.com',   '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Aluno');
-- Senha para todos os usuários acima: "senha123"