# Test Suite Fixes Log

This document records the changes made to the codebase to resolve failures in the test suite.

---

### 1. Missing `ts-jest` Dependency

- **Error:** `Preset ts-jest not found relative to rootDir`
- **Analysis:** The `ts-jest` package, required for Jest to process TypeScript files, was not installed.
- **Fix:** Installed the package as a development dependency.
  ```bash
  npm install -D ts-jest
  ```

---

### 2. TypeScript Error in Test Setup

- **Error:** `error TS18048: 'mongoose.connection.db' is possibly 'undefined'`
- **Analysis:** A TypeScript type-safety check flagged that `mongoose.connection.db` could be undefined when accessed.
- **File Changed:** `src/tests/setup.ts`

#### Before:
```typescript
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
```

#### After:
```typescript
beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

---

### 3. Mongoose Multiple Connection Error

- **Error:** `MongooseError: Can't call openUri() on an active connection with different connection strings.`
- **Analysis:** The application (`server.ts`) and the test setup (`setup.ts`) were both trying to connect to a database simultaneously.
- **File Changed:** `src/server.ts`
- **Fix:** Wrapped the database connection and server listening logic in a conditional to prevent it from running in the 'test' environment.

*Note: This first fix was flawed and led to the next error. The final, correct code is shown in the next step.*

---

### 4. TypeScript Scope Error

- **Error:** `error TS2304: Cannot find name 'app'`
- **Analysis:** The previous fix was implemented incorrectly, moving the `const app = express()` declaration into a conditional block, which broke the module scope.
- **File Changed:** `src/server.ts`

#### Before (Flawed Code):
```typescript
// ... imports
dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // 'app' is not defined here
}

export default app; // 'app' is not defined here
```

#### After (Corrected Code):
```typescript
// ... imports
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// ... other middleware and routes

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
```

---

### 5. Habit Test Isolation Failures

- **Error:** Multiple failures in `habit.test.ts`, including `Expected: 1, Received: 0` and `Expected: 201, Received: 404`.
- **Analysis:** Tests were not isolated. The database was cleared before each test, but the tests depended on state (like a created habit's ID) from previous tests.
- **File Changed:** `src/tests/habit.test.ts`
- **Fix:** The entire test file was rewritten to ensure each test case creates its own necessary data, making them independent and self-contained.

#### Before (Example Snippet):
```typescript
describe('Habit Routes', () => {
  let token: string;
  let habitId: string; // Shared state

  beforeAll(async () => { /* ... */ });

  it('should create a new habit', async () => {
    // ... creates a habit and sets habitId
  });

  it('should track a habit', async () => {
    // This test would fail if the DB was cleared after the previous test
    const res = await request(app)
      .post(`/api/habits/${habitId}/track`) // Uses shared habitId
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(201);
  });
});
```

#### After (Example Snippet):
```typescript
describe('Habit Routes', () => {
  let token: string;

  beforeAll(async () => { /* ... */ });

  it('should create a new habit', async () => {
    // ... (this test is self-contained)
  });

  it('should track a habit and update streak', async () => {
    // 1. Create the habit needed for this specific test
    const createRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Trackable Habit', frequency: 'daily' });
    const habitId = createRes.body._id; // Use local-scoped ID

    // 2. Track the habit
    const trackRes = await request(app)
      .post(`/api/habits/${habitId}/track`)
      .set('Authorization', `Bearer ${token}`);

    // 3. Assert the result
    expect(trackRes.statusCode).toEqual(201);
    expect(trackRes.body.currentStreak).toBe(1);
  });
});
```
