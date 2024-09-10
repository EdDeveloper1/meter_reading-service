import express from 'express';
import bodyParser from 'body-parser';
import measureRoutes from './routes/measureRoutes';
import sequelize from './database/sequelize'; // Importando Sequelize diretamente
import Measure from './models/Measure'; // Importar o modelo Measure
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

    // Sincronizar os modelos e criar a tabela se ela não existir
    return sequelize.sync({ force: false }); // force: false garante que as tabelas não sejam recriadas
  })
  .then(() => {
    console.log('Tabelas sincronizadas com sucesso.');
  })
  .catch((err: Error) => {
    console.error('Erro ao conectar-se ao banco de dados ou ao sincronizar tabelas:', err);
  });

export default app;
