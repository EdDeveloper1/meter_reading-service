import express from 'express';
import bodyParser from 'body-parser';
import measureRoutes from './routes/measureRoutes';
import sequelize from './database/sequelize'; // Importando Sequelize diretamente
require('dotenv').config();

const app = express();

// Configurar o limite máximo para requisições JSON e URL-encoded
app.use(bodyParser.json({ limit: '100000mb' }));
app.use(bodyParser.urlencoded({ limit: '100000mb', extended: true }));

// Rotas
app.use('/api', measureRoutes);

// Conexão com o banco de dados usando Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch((err: Error) => {
    console.error('Erro ao conectar-se ao banco de dados:', err);
  });

export default app;
