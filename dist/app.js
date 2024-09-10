"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const measureRoutes_1 = __importDefault(require("./routes/measureRoutes"));
const sequelize_1 = __importDefault(require("./database/sequelize")); // Importando Sequelize diretamente
require('dotenv').config();
const app = (0, express_1.default)();
// Configurar o limite máximo para requisições JSON e URL-encoded
app.use(body_parser_1.default.json({ limit: '100000mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '100000mb', extended: true }));
// Rotas
app.use('/api', measureRoutes_1.default);
// Conexão com o banco de dados usando Sequelize
sequelize_1.default.authenticate()
    .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    // Sincronizar os modelos e criar a tabela se ela não existir
    return sequelize_1.default.sync({ force: false }); // force: false garante que as tabelas não sejam recriadas
})
    .then(() => {
    console.log('Tabelas sincronizadas com sucesso.');
})
    .catch((err) => {
    console.error('Erro ao conectar-se ao banco de dados ou ao sincronizar tabelas:', err);
});
exports.default = app;
