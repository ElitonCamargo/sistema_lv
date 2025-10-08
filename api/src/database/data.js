
import mysql from 'mysql2/promise';
import { db_config } from "../config/config.js";

const pool = mysql.createPool({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    database: db_config.database,
    password: db_config.password,
    waitForConnections: db_config.waitForConnections, //Se deve ou não esperar por uma conexão disponível quando o limite de conexões for atingido.
    connectionLimit: db_config.connectionLimit, //O número máximo de conexões simultâneas permitidas no pool.
    queueLimit: db_config.queueLimit, //O número máximo de consultas que podem ficar na fila de espera quando todas as conexões estão ocupadas.
    connectTimeout: db_config.connectTimeout // Tempo máximo para estabelecer a conexão
});

export default pool;
