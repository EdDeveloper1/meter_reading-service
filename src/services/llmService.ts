import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

class LLMService {
    private genAI: GoogleGenerativeAI;
    private fileManager: GoogleAIFileManager;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
    }

    async uploadImage(imageBase64: string, displayName: string, mimeType: string): Promise<string> {
        try {
            // Converter a string base64 para um buffer
            const imageBuffer = Buffer.from(imageBase64, 'base64');
            const tempImagePath = path.join(__dirname, '..', '..', 'temp', `${displayName}.${mimeType.split('/')[1]}`);
    
            // Verificar se o diretório temporário existe, caso contrário, criar
            const tempDir = path.dirname(tempImagePath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
    
            // Escrever o arquivo temporário no sistema de arquivos
            fs.writeFileSync(tempImagePath, imageBuffer);
    
            
            // Fazer o upload do arquivo usando fileManager
            const uploadResponse = await this.fileManager.uploadFile(tempImagePath, {
                mimeType: mimeType,
                displayName: displayName,
              });

            // Exibe a resposta
            console.log(`Arquivo enviado: ${uploadResponse.file.displayName}`);
            console.log(`URI do arquivo: ${uploadResponse.file.uri}`);
    
            // Apagar o arquivo temporário após o upload
            fs.unlinkSync(tempImagePath);
    
            // Retornar a URI do arquivo após o upload
            return uploadResponse.file.uri;
        } catch (error) {
            // Tratar erro com checagem de tipo
            if (error instanceof Error) {
                console.error('Erro ao fazer a solicitação:', error.message);
            } else {
                console.error('Erro desconhecido:', error);
            }
    
            // Lançar erro com uma mensagem personalizada
            throw new Error('Falha no upload da imagem.');
        }
    }
    
    async extractMeterValue(imageUri: string, mimeType: string): Promise<number> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType,
                    fileUri: imageUri,
                },
            },
            { text: "Extract the meter reading value from this image." },
        ]);
    
        // Extrair o número da resposta de texto usando expressão regular
        const meterValueMatch = result.response.text().match(/\d+/);
    
        if (!meterValueMatch) {
            throw new Error("Failed to extract a valid meter reading value from the image.");
        }
    
        const meterValue = parseInt(meterValueMatch[0], 10);
    
        return meterValue;
    }
    
}

export default LLMService;
