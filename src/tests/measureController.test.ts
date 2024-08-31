import request from 'supertest';
import app from '../app';
import { describe, it, jest } from '@jest/globals';

// Aumentar o tempo limite do teste, se necessário
jest.setTimeout(30000); // 30 segundos

describe('Measure Controller', () => {
  it('should return 200 and the correct response body on valid POST /upload', async () => {
    console.log('Sending request...');
    
    // Substitua '' por uma imagem base64 válida se necessário
    const response = await request(app)
      .post('/api/upload')
      .send({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZ...', // Substitua por uma imagem base64 válida
        customer_code: 'customer123',
        measure_datetime: '2024-08-28T10:00:00Z',
        measure_type: 'WATER',
      });
      
    console.log('Response received:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image_url');
    expect(response.body).toHaveProperty('measure_value');
    expect(response.body).toHaveProperty('measure_uuid');

    // Validar que os valores dos campos são do tipo correto ou seguem o formato esperado
    expect(typeof response.body.image_url).toBe('string');
    expect(typeof response.body.measure_value).toBe('number');
    expect(typeof response.body.measure_uuid).toBe('string');
  });

  it('should return 400 on invalid POST /upload', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({
        image: '', // Imagem inválida
        customer_code: '', // Código do cliente inválido
        measure_datetime: 'invalid-date', // Data/hora inválida
        measure_type: 'UNKNOWN_TYPE', // Tipo inválido
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid input data');
  });

  it('should return 400 if image is missing', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({
        customer_code: 'customer123',
        measure_datetime: '2024-08-28T10:00:00Z',
        measure_type: 'WATER',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Image is required');
  });

  it('should return 400 if customer_code is missing', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({
        image: 'data:image/jpeg;base64,/9j/4AAQSkZ...',
        measure_datetime: '2024-08-28T10:00:00Z',
        measure_type: 'WATER',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Customer code is required');
  });

  // Adicione outros testes conforme necessário para validar todos os cenários relevantes
});
