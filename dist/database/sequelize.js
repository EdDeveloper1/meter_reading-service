"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Configurando a conexão com o banco de dados
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'meter_reading_service', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'password', {
    host: process.env.DB_HOST || 'mysql', // Nome do serviço 'mysql' definido no docker-compose.yml
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306, // Garantir que a porta seja um número
    logging: console.log, // Adiciona logs SQL no console
    benchmark: true, // Mostra o tempo de execução de cada query
});
exports.default = sequelize;
