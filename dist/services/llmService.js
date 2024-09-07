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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class LLMService {
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.fileManager = new server_1.GoogleAIFileManager(apiKey);
    }
    uploadImage(imageBase64, displayName, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const uploadResponse = yield this.fileManager.uploadFile(tempImagePath, {
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
            }
            catch (error) {
                // Tratar erro com checagem de tipo
                if (error instanceof Error) {
                    console.error('Erro ao fazer a solicitação:', error.message);
                }
                else {
                    console.error('Erro desconhecido:', error);
                }
                // Lançar erro com uma mensagem personalizada
                throw new Error('Falha no upload da imagem.');
            }
        });
    }
    extractMeterValue(imageUri, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const result = yield model.generateContent([
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
        });
    }
}
exports.default = LLMService;
