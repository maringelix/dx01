import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock do app para testes
const createTestApp = () => {
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: { connected: true }
    });
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      service: 'dx01-api',
      version: '1.0.0'
    });
  });

  return app;
};

describe('Health Check Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should return 200 on /health endpoint', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should include database status in health check', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).toHaveProperty('database');
    expect(response.body.database).toHaveProperty('connected');
    expect(typeof response.body.database.connected).toBe('boolean');
  });

  it('should return valid timestamp format', async () => {
    const response = await request(app).get('/health');
    const timestamp = new Date(response.body.timestamp);
    
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it('should return 200 on /api/status endpoint', async () => {
    const response = await request(app).get('/api/status');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('dx01-api');
  });

  it('should return uptime as a number', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThan(0);
  });
});
