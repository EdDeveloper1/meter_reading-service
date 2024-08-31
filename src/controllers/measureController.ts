import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import LLMService from '../services/llmService';
import { v4 as uuidv4 } from 'uuid';  

const prisma = new PrismaClient();
const llmService = new LLMService(process.env.API_KEY || '');

export const uploadMeasure = async (req: Request, res: Response) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (!image || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Todos os campos são obrigatórios.',
        });
    }

    try {
        // Verifica se já existe uma leitura no mês para este tipo de leitura
        const existingMeasure = await prisma.measure.findFirst({
            where: {
                customer_code: customer_code,  
                measure_type: measure_type,    
                measure_datetime: {
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
        const image_uri = await llmService.uploadImage(image, 'Measurement Image', 'image/jpeg');
        const measure_value = await llmService.extractMeterValue(image_uri, 'image/jpeg');

        // Gera um UUID para o novo registro
        const measure_uuid = uuidv4();

        // Salva a nova leitura no banco de dados
        const newMeasure = await prisma.measure.create({
            data: {
                measure_uuid: measure_uuid, 
                customer_code: customer_code,
                measure_datetime: new Date(measure_datetime),
                measure_type: measure_type,
                measure_value: measure_value,
                image_url: image_uri,
                has_confirmed: false,
            },
        });

        return res.status(200).json({
            image_url: newMeasure.image_url, 
            measure_value: newMeasure.measure_value, 
            measure_uuid: newMeasure.measure_uuid,  
        });
    } catch (error) {
        console.error('Erro ao processar a leitura:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao processar a leitura.',
        });
    }
};

export const confirmMeasure = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body;

    if (!measure_uuid || confirmed_value == null) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'measure_uuid e confirmed_value são obrigatórios.',
        });
    }

    try {
        const measure = await prisma.measure.findUnique({
            where: { measure_uuid: measure_uuid }, 
        });

        if (!measure) {
            return res.status(404).json({
                error_code: 'MEASURE_NOT_FOUND',
                error_description: 'Leitura não encontrada.',
            });
        }

        if (measure.has_confirmed) {
            return res.status(409).json({
                error_code: 'CONFIRMATION_DUPLICATE',
                error_description: 'Leitura já confirmada.',
            });
        }

        await prisma.measure.update({
            where: { measure_uuid: measure_uuid }, 
            data: { measure_value: confirmed_value, has_confirmed: true }, 
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao confirmar a leitura:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao confirmar a leitura.',
        });
    }
};

export const listMeasures = async (req: Request, res: Response) => {
    const { customer_code } = req.params;
    const { measure_type } = req.query;

    if (!customer_code) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'O código do cliente é obrigatório.',
        });
    }

    try {
        const filters: any = { customer_code }; 
        const queryMeasureType = req.query.measure_type?.toString().toUpperCase(); 
        if (queryMeasureType) {
            if (queryMeasureType !== 'WATER' && queryMeasureType !== 'GAS') {
                return res.status(400).json({
                    error_code: 'INVALID_TYPE',
                    error_description: 'Tipo de medição não permitida.',
                });
            }
            filters.measure_type = measure_type; 
        }

        const measures = await prisma.measure.findMany({
            where: filters,
            orderBy: { measure_datetime: 'desc' },  
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
                measure_uuid: measure.measure_uuid, 
                measure_datetime: measure.measure_datetime, 
                measure_type: measure.measure_type,    
                has_confirmed: measure.has_confirmed,  
                image_url: measure.image_url,          
            })),
        });
    } catch (error) {
        console.error('Erro ao listar as leituras:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao listar as leituras.',
        });
    }
};
