// *** Configuração do banco de dados ****
import dotenv from 'dotenv';
dotenv.config();

const developmentConfig = {
    host:               process.env.DEV_DB_HOST                         ,
    port:               parseInt(process.env.DEV_DB_PORT, 10)           ,
    user:               process.env.DEV_DB_USER                         ,
    database:           process.env.DEV_DB_NAME                         ,
    password:           process.env.DEV_DB_PASSWORD                     ,
    waitForConnections: process.env.DEV_DB_WAIT_CONNECTIONS === 'true'  , // Converte para boolean
    connectionLimit:    parseInt(process.env.DEV_DB_CONN_LIMIT,10)      ,
    queueLimit:         parseInt(process.env.DEV_DB_QUEUE_LIMIT,10)     ,
    connectTimeout:     parseInt(process.env.DEV_DB_CONN_TIMEOUT,10)
};

const productionConfig = {
    host:               process.env.DB_HOST                         ,
    port:               parseInt(process.env.DB_PORT, 10)           ,
    user:               process.env.DB_USER                         ,
    database:           process.env.DB_NAME                         ,
    password:           process.env.DB_PASSWORD                     ,
    waitForConnections: process.env.DB_WAIT_CONNECTIONS === 'true'  , // Converte para boolean   ,
    connectionLimit:    parseInt(process.env.DB_CONN_LIMIT,10)      ,
    queueLimit:         parseInt(process.env.DB_QUEUE_LIMIT,10)     ,
    connectTimeout:     parseInt(process.env.DB_CONN_TIMEOUT,10)
};

export const db_config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;