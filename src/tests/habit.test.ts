import request from 'supertest';
import app from '../server';
import mongoose from 'mongoose';
import { token } from './setup';

describe('Habit Routes', () => {
  beforeEach(async () => {
    // Clear the habits collection before each test
    await mongoose.connection.collection('habits').deleteMany({});
    await mongoose.connection.collection('tracklogs').deleteMany({});
  });

  it('should create a new habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Read a book',
        description: 'Read 10 pages of a book daily',
        frequency: 'daily',
        tags: ['reading', 'self-improvement'],
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Read a book');
  });

  it('should get all habits', async () => {
    await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Habit', frequency: 'daily' });

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.habits.length).toBe(1);
  });

  it('should filter habits by tag', async () => {
    await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Reading Habit', frequency: 'daily', tags: ['reading'] });

    const res = await request(app)
      .get('/api/habits?tag=reading')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.habits.length).toBe(1);
    expect(res.body.habits[0].tags).toContain('reading');
  });

  it('should paginate habits', async () => {
    await request(app).post('/api/habits').set('Authorization', `Bearer ${token}`).send({ title: 'Habit 1', frequency: 'daily' });
    await request(app).post('/api/habits').set('Authorization', `Bearer ${token}`).send({ title: 'Habit 2', frequency: 'daily' });

    const res = await request(app)
      .get('/api/habits?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.habits.length).toBe(1);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('should track a habit and update streak', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Trackable Habit', frequency: 'daily' });
    const habitId = createRes.body._id;

    const trackRes = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(trackRes.statusCode).toEqual(201);
    expect(trackRes.body.currentStreak).toBe(1);
    expect(trackRes.body.longestStreak).toBe(1);
  });

  it('should not track a habit twice on the same day', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Trackable Habit', frequency: 'daily' });
    const habitId = createRes.body._id;

    await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    const res = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
      
    expect(res.statusCode).toEqual(400);
  });

  it('should get habit history', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'History Habit', frequency: 'daily' });
    const habitId = createRes.body._id;

    // Track habit for 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await request(app)
        .post(`/api/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${token}`)
        .send({ date: date.toISOString().split('T')[0] });
    }

    const res = await request(app)
      .get(`/api/habits/${habitId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalLogs).toBe(7);
    expect(res.body.last7Days.length).toBe(7);
  });

  it('should return an error for insufficient history', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'History Habit', frequency: 'daily' });
    const habitId = createRes.body._id;

    const res = await request(app)
      .get(`/api/habits/${habitId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Not sufficient history (need 7 or more logs)');
  });
});

describe("GET /api/habits pagination", () => {
  let token: string;

  beforeAll(async () => {
    await request(app).post("/api/register").send({
      name: "Test User",
      email: "pagination@example.com",
      password: "123456",
    });

    const login = await request(app)
      .post("/api/login")
      .send({ email: "pagination@example.com", password: "123456" });

    token = login.body.token;

    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post("/api/habits")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: `Habit ${i}` });
    }
  });

  it("should return first 10 habits by default", async () => {
    const res = await request(app)
      .get("/api/habits")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.habits.length).toBeLessThanOrEqual(10);
  });

  it("should return correct pagination metadata", async () => {
    const res = await request(app)
      .get("/api/habits?page=2&limit=5")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.pagination.currentPage).toBe(2);
    expect(res.body.pagination.limitPerPage).toBe(5);
  });

  it("should handle out-of-range pages", async () => {
    const res = await request(app)
      .get("/api/habits?page=99")
      .set("Authorization", `Bearer ${token}`);
    if (res.body.message) {
      expect(res.body.message).toMatch(/out of range/i);
    }
  });
});