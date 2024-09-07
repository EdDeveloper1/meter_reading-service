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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let measureUuid;
describe('POST /upload with Gemini API', () => {
    it('deve fazer upload de uma imagem, chamar a API do Gemini e retornar o valor da leitura', () => __awaiter(void 0, void 0, void 0, function* () {
        // Lê a string base64 de um arquivo externo
        const imageBuffer = fs_1.default.readFileSync(path_1.default.join(__dirname, 'imageBase64.txt'));
        const imageBase64 = imageBuffer.toString(); // Não precisa converter para base64, pois já está no arquivo
        // Envia o corpo da requisição com a imagem em base64 e os outros campos
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/upload')
            .send({
            imageBase64: imageBase64, // A string base64 da imagem
            customer_code: '123456',
            measure_datetime: '2024-09-01T12:00:00Z',
            measure_type: 'water'
        })
            .set('Content-Type', 'application/json'); // Garante que o conteúdo está sendo enviado como JSON
        console.log('Response body:', response.body);
        console.log('Response status:', response.status);
        // Verificações no retorno
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('image_url');
        expect(response.body).toHaveProperty('measure_value');
        expect(response.body.measure_value).toBeGreaterThan(0);
        // Captura o UUID da leitura
        measureUuid = response.body.measure_uuid; // Supondo que o UUID esteja na resposta
    }));
});
describe('PATCH /confirm with real data', () => {
    it('deve confirmar a leitura de um UUID existente após a extração real', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(60000);
        const response = yield (0, supertest_1.default)(app_1.default)
            .patch('/api/confirm')
            .send({
            measure_uuid: measureUuid,
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Leitura confirmada com sucesso.');
    }));
});
describe('GET /:customer_code/list with real data', () => {
    it('deve listar as leituras confirmadas para um código de cliente real', () => __awaiter(void 0, void 0, void 0, function* () {
        const customerCode = '123456';
        const response = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/${customerCode}/list`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach((measure) => {
            expect(measure).toHaveProperty('measure_uuid');
            expect(measure).toHaveProperty('measure_value');
            expect(measure.measure_value).toBeGreaterThan(0);
        });
    }));
});
