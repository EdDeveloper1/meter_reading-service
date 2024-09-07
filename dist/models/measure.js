"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class Measure extends sequelize_1.Model {
}
Measure.init({
    measure_uuid: {
        type: sequelize_1.DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    customer_code: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    measure_datetime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    measure_type: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    measure_value: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    has_confirmed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'Measure',
    tableName: 'Measure',
    timestamps: true,
});
exports.default = Measure;
