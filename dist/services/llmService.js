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
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@google/generative-ai/server");
const generative_ai_1 = require("@google/generative-ai");
class LLMService {
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.fileManager = new server_1.GoogleAIFileManager(apiKey);
    }
    /**
     * Faz o upload da imagem para a API da Gemini e retorna a URI da imagem.
     * @param imageBase64 Base64 da imagem a ser enviada.
     * @param displayName Nome de exibição da imagem no sistema.
     * @param mimeType Tipo MIME da imagem (e.g., 'image/jpeg').
     * @returns URI da imagem armazenada.
     */
    uploadImage(imageBase64, displayName, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadResponse = yield this.fileManager.uploadFile(displayName, {
                mimeType,
                displayName,
            });
            return uploadResponse.file.uri;
        });
    }
    /**
     * Processa a imagem enviada para extrair o valor do medidor usando a API Gemini.
     * @param imageUri URI da imagem armazenada no serviço Gemini.
     * @param mimeType Tipo MIME da imagem (e.g., 'image/jpeg').
     * @returns Valor extraído do medidor.
     */
    extractMeterValue(imageUri, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = yield model.generateContent([
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
        });
    }
}
exports.default = LLMService;
