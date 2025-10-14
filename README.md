# Personal Habit Tracker & Streak Management System

## 1. Project Overview

This project is a backend-only REST API for a personal habit tracker. It allows users to register, log in, create habits, track their progress, and manage streaks. The API is built with Node.js, Express, and MongoDB.

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
    "name": "John Doe",
    "email": "john@example.com",
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
    "email": "john@example.com",
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

**GET** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`

**PUT** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`

**DELETE** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`

**POST** `/api/habits/:id/track`

- **Headers:** `Authorization: Bearer <token>`

**GET** `/api/habits/:id/history`

- **Headers:** `Authorization: Bearer <token>`

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
    MONGO_URI=mongodb://localhost:27017/habitdb
    JWT_SECRET=your_jwt_secret
    PORT=5000
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

    The API will be accessible at `http://localhost:5000/api`.

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
