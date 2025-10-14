import request from 'supertest';
import app from '../server';

describe('Habit Routes', () => {
  let token: string;

  beforeAll(async () => {
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
    expect(res.body.totalPages).toBe(2);
  });

  it('should track a habit and update streak', async () => {
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Trackable Habit', frequency: 'daily' });
    const habitId = createRes.body._id;

    const trackRes = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

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
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(400);
  });
});