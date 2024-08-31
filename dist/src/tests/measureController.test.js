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
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Measure Controller', () => {
    (0, globals_1.it)('should return 200 and the correct response body on valid POST /upload', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/upload')
            .send({
            image: 'valid_base64_string',
            customer_code: 'customer123',
            measure_datetime: '2024-08-28T10:00:00Z',
            measure_type: 'WATER',
        });
        //expect(response.status).toBe(200);
        //expect(response.body).toHaveProperty('image_url');
        //expect(response.body).toHaveProperty('measure_value');
        //expect(response.body).toHaveProperty('measure_uuid');
    }));
    // Adicione mais testes aqui
});
