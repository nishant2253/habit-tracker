import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../server';

let mongo: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  await request(app).post('/api/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  const res = await request(app).post('/api/login').send({
    email: 'test@example.com',
    password: 'password123',
  });
  token = res.body.token;
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    if (key === 'users') continue;
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

export { token };
