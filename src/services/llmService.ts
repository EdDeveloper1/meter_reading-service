import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

class LLMService {
    private genAI: GoogleGenerativeAI;
    private fileManager: GoogleAIFileManager;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
    }

    /**
     * Faz o upload da imagem para a API da Gemini e retorna a URI da imagem.
     * @param imageBase64 Base64 da imagem a ser enviada.
     * @param displayName Nome de exibição da imagem no sistema.
     * @param mimeType Tipo MIME da imagem (e.g., 'image/jpeg').
     * @returns URI da imagem armazenada.
     */
    async uploadImage(imageBase64: string, displayName: string, mimeType: string): Promise<string> {
        const uploadResponse = await this.fileManager.uploadFile(displayName, {
            mimeType,
            displayName,
        });
        return uploadResponse.file.uri;
    }

    /**
     * Processa a imagem enviada para extrair o valor do medidor usando a API Gemini.
     * @param imageUri URI da imagem armazenada no serviço Gemini.
     * @param mimeType Tipo MIME da imagem (e.g., 'image/jpeg').
     * @returns Valor extraído do medidor.
     */
    async extractMeterValue(imageUri: string, mimeType: string): Promise<number> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType,
                    fileUri: imageUri,
                },
            },
            { text: "Extract the meter reading value from this image." },
        ]);

        // Assume que o resultado seja um número no texto retornado
        const meterValue = parseInt(result.response.text(), 10);

        if (isNaN(meterValue)) {
            throw new Error("Failed to extract a valid meter reading value from the image.");
        }

        return meterValue;
    }
}

export default LLMService;
