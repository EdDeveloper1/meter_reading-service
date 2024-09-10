import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

// Configurando a conexão com o banco de dados
const sequelize = new Sequelize(process.env.DB_NAME || 'meter_reading_service', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'password', {
    host: process.env.DB_HOST || 'mysql',  // Nome do serviço 'mysql' definido no docker-compose.yml
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,  // Garantir que a porta seja um número
    logging: console.log,  // Adiciona logs SQL no console
    benchmark: true,       // Mostra o tempo de execução de cada query
});

sequelize.sync({ force: false })  // force: true recria as tabelas
  .then(() => {
    console.log("Tabelas sincronizadas");
  })
  .catch((err) => {
    console.error("Erro ao sincronizar tabelas:", err);
  });

export default sequelize;
