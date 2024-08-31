"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMeasures = exports.confirmMeasure = exports.uploadMeasure = void 0;
const client_1 = require("@prisma/client");
const llmService_1 = __importDefault(require("../services/llmService"));
const uuid_1 = require("uuid"); // Para gerar UUIDs
const prisma = new client_1.PrismaClient();
const llmService = new llmService_1.default(process.env.API_KEY || '');
const uploadMeasure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    if (!image || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Todos os campos são obrigatórios.',
        });
    }
    try {
        // Verifica se já existe uma leitura no mês para este tipo de leitura
        const existingMeasure = yield prisma.measure.findFirst({
            where: {
                customerCode: customer_code,
                measureType: measure_type,
                measureDatetime: {
                    gte: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth(), 1),
                    lt: new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth() + 1, 1),
                },
            },
        });
        if (existingMeasure) {
            return res.status(409).json({
                error_code: 'DOUBLE_REPORT',
                error_description: 'Leitura do mês já realizada.',
            });
        }
        // Upload da imagem e extração do valor do medidor
        const imageUri = yield llmService.uploadImage(image, 'Measurement Image', 'image/jpeg');
        const measureValue = yield llmService.extractMeterValue(imageUri, 'image/jpeg');
        // Gera um UUID para o novo registro
        const measureUUID = (0, uuid_1.v4)();
        // Salva a nova leitura no banco de dados
        const newMeasure = yield prisma.measure.create({
            data: {
                customerCode: customer_code,
                measureDatetime: new Date(measure_datetime),
                measureType: measure_type,
                measureValue: measureValue,
                imageUrl: imageUri,
                hasConfirmed: false,
                measureUUID, // Adicionado 'measureUUID'
            },
        });
        return res.status(200).json({
            image_url: newMeasure.imageUrl,
            measure_value: newMeasure.measureValue,
            measure_uuid: newMeasure.measureUUID, // Adicionado 'measureUUID'
        });
    }
    catch (error) {
        console.error('Erro ao processar a leitura:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao processar a leitura.',
        });
    }
});
exports.uploadMeasure = uploadMeasure;
const confirmMeasure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { measure_uuid, confirmed_value } = req.body;
    if (!measure_uuid || confirmed_value == null) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'measure_uuid e confirmed_value são obrigatórios.',
        });
    }
    try {
        const measure = yield prisma.measure.findUnique({
            where: { measureUUID: measure_uuid }, // Corrigido para 'measureUUID'
        });
        if (!measure) {
            return res.status(404).json({
                error_code: 'MEASURE_NOT_FOUND',
                error_description: 'Leitura não encontrada.',
            });
        }
        if (measure.hasConfirmed) {
            return res.status(409).json({
                error_code: 'CONFIRMATION_DUPLICATE',
                error_description: 'Leitura já confirmada.',
            });
        }
        yield prisma.measure.update({
            where: { measureUUID: measure_uuid },
            data: { measureValue: confirmed_value, hasConfirmed: true }, // Corrigido para 'measureValue' e 'hasConfirmed'
        });
        return res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Erro ao confirmar a leitura:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao confirmar a leitura.',
        });
    }
});
exports.confirmMeasure = confirmMeasure;
const listMeasures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_code } = req.params;
    const { measure_type } = req.query;
    if (!customer_code) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'O código do cliente é obrigatório.',
        });
    }
    try {
        const filters = { customerCode: customer_code }; // Corrigido para 'customerCode'
        if (measure_type) {
            const measureType = measure_type.toString().toUpperCase();
            if (measureType !== 'WATER' && measureType !== 'GAS') {
                return res.status(400).json({
                    error_code: 'INVALID_TYPE',
                    error_description: 'Tipo de medição não permitida.',
                });
            }
            filters.measureType = measureType; // Corrigido para 'measureType'
        }
        const measures = yield prisma.measure.findMany({
            where: filters,
            orderBy: { measureDatetime: 'desc' }, // Corrigido para 'measureDatetime'
        });
        if (!measures.length) {
            return res.status(404).json({
                error_code: 'MEASURES_NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada.',
            });
        }
        return res.status(200).json({
            customer_code,
            measures: measures.map(measure => ({
                measure_uuid: measure.measureUUID,
                measure_datetime: measure.measureDatetime,
                measure_type: measure.measureType,
                has_confirmed: measure.hasConfirmed,
                image_url: measure.imageUrl, // Corrigido para 'imageUrl'
            })),
        });
    }
    catch (error) {
        console.error('Erro ao listar as leituras:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao listar as leituras.',
        });
    }
});
exports.listMeasures = listMeasures;
