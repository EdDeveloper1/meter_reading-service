import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import LLMService from '../services/llmService';
import Measure from '../models/Measure';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();


// Inicialize o serviço LLM
const apiKey = process.env.GEMINI_API_KEY || 'sua-api-key-aqui';
console.log('Api key: ', apiKey)
const llmService = new LLMService(apiKey);

// Função para upload de imagem e extração da leitura
export const uploadMeasure = async (req: Request, res: Response) => {
    const {imageBase64, customer_code, measure_datetime, measure_type } = req.body;
    console.log('Imagem: ', imageBase64,'customer_code: ', customer_code, 'measure_datetime: ', measure_datetime, 'measure_type: ', measure_type)
    // Verificação de campos obrigatórios
    if (!imageBase64 || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Todos os campos são obrigatórios.',
        });
    }

    const validMeasureTypes = ['WATER', 'GAS'];
    const upperMeasureType = measure_type.toUpperCase();


    if (!validMeasureTypes.includes(upperMeasureType)) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Tipo de medida inválido. Deve ser WATER ou GAS.',
        });
    }

    // Lê a imagem da pasta e converte para buffer
        // const imagePath = path.join(__dirname, '..', '..', 'images', 'image.jpg');
        // const imageBuffer = fs.readFileSync(imagePath);
        // const imageBase64 = imageBuffer.toString('base64');

        const validateBase64 = (base64String: string) => {
            // Remove prefixo se estiver presente
            const base64Data = base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        
            // Verifica se a string base64 é válida
            const validBase64Regex = /^[A-Za-z0-9+/=]+$/;
        
            // Checa se a string contém apenas caracteres válidos e é múltiplo de 4
            return validBase64Regex.test(base64Data) && (base64Data.length % 4 === 0);
        };
        
        if (!validateBase64(imageBase64)) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Imagem em base64 inválida.',
            });
        }
        

    try {
        // Verifica se já existe uma leitura para o mesmo mês e tipo de leitura
        const existingMeasure = await Measure.findOne({
            where: {
                customer_code,
                measure_type,
                measure_datetime: {
                    [Op.between]: [
                        new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth(), 1),
                        new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth() + 1, 0),
                    ],
                },
            },
        });

        if (existingMeasure) {
            return res.status(409).json({
                error_code: 'DOUBLE_REPORT',
                error_description: 'Leitura do mês já realizada.',
            });
        }

        // Faz o upload da imagem e extrai o valor da leitura via LLM Service
        console.log('Iniciando o upload da imagem');
        const imageUrl = await llmService.uploadImage(imageBase64,'Imagem_para_Leitura', 'image/jpeg');
        console.log('Imagem carregada com sucesso:', imageUrl);
        const measureValue = await llmService.extractMeterValue(imageUrl, 'image/jpeg');

        // Gera um UUID para a nova medida
        const measureUuid = uuidv4();

        // Cria o novo registro da medida no banco de dados
        const newMeasure = await Measure.create({
            measure_uuid: measureUuid,
            customer_code,
            measure_datetime: new Date(measure_datetime),
            measure_type,
            measure_value: measureValue,
            image_url: imageUrl,
            has_confirmed: false,
        });

        return res.status(200).json({
            image_url: newMeasure.image_url,
            measure_value: newMeasure.measure_value,
            measure_uuid: newMeasure.measure_uuid,
        });
    } catch (error) {
        console.error('Erro no uploadMeasure:', error); // Logar o erro
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao processar a leitura.',
        });
    }
};

// Função para confirmar a leitura
export const confirmMeasure = async (req: Request, res: Response) => {
    const { measure_uuid } = req.body;
    console.log('Measure_uuid: ', measure_uuid)
    // Verificação de campos obrigatórios
    if (!measure_uuid) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'UUID da leitura é obrigatório.',
        });
    }

    try {
        // Busca a medida pelo UUID
        const measure = await Measure.findOne({
            where: { measure_uuid },
        });

        if (!measure) {
            return res.status(404).json({
                error_code: 'NOT_FOUND',
                error_description: 'Leitura não encontrada.',
            });
        }

        // Atualiza o campo de confirmação da leitura
        await Measure.update(
            { has_confirmed: true },
            { where: { measure_uuid } }
        );

        return res.status(200).json({ message: 'Leitura confirmada com sucesso.' });
    } catch (error) {
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao confirmar a leitura.',
        });
    }
};

// Função para listar as leituras de um cliente
export const listMeasures = async (req: Request, res: Response) => {
    const { customer_code } = req.params;

    // Verificação de campos obrigatórios
    if (!customer_code) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Código do cliente é obrigatório.',
        });
    }

    try {
        // Busca todas as medidas do cliente, ordenadas pela data
        const measures = await Measure.findAll({
            where: { customer_code },
            order: [['measure_datetime', 'DESC']],
        });

        if (measures.length === 0) {
            return res.status(404).json({
                error_code: 'NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada para o cliente.',
            });
        }

        // Retorna a lista de leituras
        return res.status(200).json(measures);
    } catch (error) {
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao listar as leituras.',
        });
    }
};
