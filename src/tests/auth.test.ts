import request from 'supertest';
import app from '../server';

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/register').send({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register an existing user', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
