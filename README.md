# Personal Habit Tracker & Streak Management System

## 1. Project Overview

This project is a backend-only REST API for a personal habit tracker. It allows users to register, log in, create habits, track their progress, and manage streaks. The API is built with Node.js, Express, and MongoDB.

The backend automatically connects to MongoDB when started.
You can test the API via Postman and immediately visualize stored data in MongoDB Compass under the habit_tracker database.

## 2. Architecture Diagram

```
Client (Postman / Frontend)
↓
[ Express Server ]
↓
[ Routes ] → [ Middleware (JWT, Rate Limit) ]
↓
[ Controllers (Auth / Habit) ]
↓
[ Mongoose Models (User, Habit, TrackLog) ]
↓
[ MongoDB Database ]
```

## 3. Folder-by-Folder Explanation

- **`src/config/`**: Contains the database connection configuration.
- **`src/models/`**: Defines the Mongoose schemas for Users, Habits, and TrackLogs.
- **`src/routes/`**: Defines the API endpoints for authentication and habit management.
- **`src/controllers/`**: Contains the business logic for handling requests.
- **`src/middleware/`**: Contains custom middleware for authentication (JWT) and rate limiting.
- **`src/utils/`**: Contains helper functions, such as the streak calculation logic.
- **`src/tests/`**: Contains API tests written with Jest and Supertest.

## 4. API Documentation

### Authentication

**POST** `/api/register`

- **Body:**
  ```json
  {
    "name": "Himanshu Sharma",
    "email": "himanshu@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully"
  }
  ```

**POST** `/api/login`

- **Body:**
  ```json
  {
    "email": "himanshu@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "your_jwt_token"
  }
  ```

### Habits

**POST** `/api/habits`

- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Read a book",
    "description": "Read 10 pages of a book daily",
    "frequency": "daily",
    "tags": ["reading", "self-improvement"],
    "reminderTime": "08:00"
  }
  ```

**GET** `/api/habits`

- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `tag`, `page`, `limit`
- **Response:**
  ```json
  {
    "habits": [
      {
        "_id": "6711fab7ef8b8c1ac7b45622",
        "user": "6711f9a45f3bca32dc4ff3e2",
        "title": "Morning Run",
        "description": "Run 3km daily",
        "frequency": "daily",
        "tags": ["health", "fitness"],
        "reminderTime": "07:00",
        "currentStreak": 3,
        "longestStreak": 5
      }
    ],
    "totalPages": 1,
    "currentPage": 1
  }
  ```

**GET** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "_id": "6711fab7ef8b8c1ac7b45622",
    "user": "6711f9a45f3bca32dc4ff3e2",
    "title": "Morning Run",
    "description": "Run 3km daily",
    "frequency": "daily",
    "tags": ["health", "fitness"],
    "reminderTime": "07:00",
    "currentStreak": 3,
    "longestStreak": 5
  }
  ```

**PUT** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Evening Run",
    "description": "Run 5km daily",
    "frequency": "daily",
    "tags": ["health", "fitness", "cardio"],
    "reminderTime": "18:00"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "6711fab7ef8b8c1ac7b45622",
    "user": "6711f9a45f3bca32dc4ff3e2",
    "title": "Evening Run",
    "description": "Run 5km daily",
    "frequency": "daily",
    "tags": ["health", "fitness", "cardio"],
    "reminderTime": "18:00",
    "currentStreak": 3,
    "longestStreak": 5
  }
  ```

**DELETE** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Habit deleted"
  }
  ```

**POST** `/api/habits/:id/track`

- **Headers:** `Authorization: Bearer <token>`
- **Body:** (empty)
- **Response:**
  ```json
  {
    "_id": "6711fab7ef8b8c1ac7b45622",
    "user": "6711f9a45f3bca32dc4ff3e2",
    "title": "Morning Run",
    "description": "Run 3km daily",
    "frequency": "daily",
    "tags": ["health", "fitness"],
    "reminderTime": "07:00",
    "currentStreak": 4,
    "longestStreak": 5
  }
  ```

**GET** `/api/habits/:id/history`

- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [
    {
      "_id": "6711fae8a4bba1c8c634c099",
      "habit": "6711fab7ef8b8c1ac7b45622",
      "date": "2025-10-15T00:00:00.000Z"
    },
    {
      "_id": "6711fae8a4bba1c8c634c098",
      "habit": "6711fab7ef8b8c1ac7b45622",
      "date": "2025-10-14T00:00:00.000Z"
    }
  ]
  ```

## 5. How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd habit-tracker-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up `.env` file:**
    Create a `.env` file in the root directory with the following content:
    ```
    # Local MongoDB
    MONGO_URI=mongodb://127.0.0.1:27017/habit_tracker

    # or for MongoDB Atlas
    # MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/habit_tracker

    PORT=5000
    JWT_SECRET=your_jwt_secret
    ```

4.  **Running the Server**

    You can run the server in two modes:

    **A) Development Mode**

    This mode uses `nodemon` to automatically restart the server when you make changes to the code.
    ```bash
    npm run dev
    ```

    **B) Production Mode**

    This mode requires you to build the JavaScript files from the TypeScript source first.
    ```bash
    # 1. Build the project
    npm run build

    # 2. Start the server
    npm start
    ```

    The API will be accessible at `http://localhost:5000`.

5.  **Stopping the Server**

    If you started the server in the foreground (using `npm run dev` or `npm start`), you can stop it by pressing `Ctrl+C` in the terminal.

    If you started the server in the background, you can find the process using the port number and stop it.
    ```bash
    # Find the process ID (PID) using the port (e.g., 5000)
    lsof -i :5000

    # Stop the process using its PID
    kill <PID>
    ```


## 6. Testing

To run the tests, use the following command:

```bash
npm test
```

## 7. Tools Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **JSON Web Tokens (JWT)**: For authentication.
- **bcrypt**: For password hashing.
- **day.js**: For date manipulation.
- **express-rate-limit**: For rate limiting.
- **Jest**: Testing framework.
- **Supertest**: For testing HTTP assertions.
- **TypeScript**: Superset of JavaScript that adds static typing.

## 🧩 Viewing Data in MongoDB Compass

Once your backend is running and data has been created (for example, after registering users or creating habits), you can visualize your data using MongoDB Compass.

### 🧭 Step-by-Step Guide

**1️⃣ Open MongoDB Compass**

Launch MongoDB Compass. You should see an interface like this:

```
Connections
 ├── cluster0.xxxxx.mongodb.net
 ├── clusterproofchain.xxxxx.mongodb.net
 └── localhost:27017
```

**2️⃣ Connect to Your Local Database**

If using local MongoDB, click on the connection:
`localhost:27017`

Or if using MongoDB Atlas, click on your cluster connection (e.g. cluster0.xxxxxx.mongodb.net) and log in with your credentials.

**3️⃣ Access Your Project Database**

Once connected:

- Find your database named `habit_tracker` (created automatically by Mongoose).
- Click it to open collections.

You should now see:

- `users` — all registered user documents
- `habits` — all user-created habits with fields like title, frequency, tags, streak info
- `tracklogs` — each habit completion entry (per day)

**4️⃣ Verify Data**

You can open each collection to view JSON documents, inspect fields, and confirm that your API is writing data correctly.

**5️⃣ Example Documents**

**users collection**

```json
{
  "_id": "6711f9a45f3bca32dc4ff3e2",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$hashedstring"
}
```

**habits collection**

```json
{
  "_id": "6711fab7ef8b8c1ac7b45622",
  "user": "6711f9a45f3bca32dc4ff3e2",
  "title": "Morning Run",
  "description": "Run 3km daily",
  "frequency": "daily",
  "tags": ["health", "fitness"],
  "reminderTime": "07:00",
  "currentStreak": 3,
  "longestStreak": 5
}
```

**tracklogs collection**

```json
{
  "_id": "6711fae8a4bba1c8c634c099",
  "habit": "6711fab7ef8b8c1ac7b45622",
  "date": "2025-10-14T00:00:00.000Z"
}
```

**6️⃣ Switching Between Local and Atlas**

To use MongoDB Atlas instead of local, update your `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/habit_tracker
```

Save and restart your server:

```bash
npm run dev
```

Now Compass will show data from your Atlas cluster.
