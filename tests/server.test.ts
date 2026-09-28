import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/server.js';

describe('Express Server API Endpoints (TypeScript)', () => {
  it('GET / should return hello message and 200 status', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, 'Hello we are learning Docker & CI/CD Pipeline V2');
    assert.strictEqual(res.body.status, 'running');
    assert.strictEqual(res.body.code, 200);
  });

  it('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.ok(res.body.timestamp);
  });

  it('GET /unknown-route should return 404', async () => {
    const res = await request(app).get('/unknown-route');
    assert.strictEqual(res.status, 404);
  });
});
