import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

// Configurando a conexão com o banco de dados
const sequelize = new Sequelize(process.env.DB_NAME || 'meter_reading_service', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'password', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql', // Ou 'postgres', 'sqlite', etc.
});

export default sequelize;