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

## 4. Project Structure: `index.ts` vs. `server.ts`

This project separates the Express application's configuration from its execution for better organization and testability.

- **`server.ts`**: This file is responsible for **creating and configuring the Express application**. It sets up all the middleware (like `cors`, `express.json`, and `rateLimitMiddleware`) and defines all the API routes by linking them to their respective handlers. It then **exports the configured `app` object** without actually starting the server.

- **`index.ts`**: This file serves as the **main entry point of the application**. It imports the `app` object from `server.ts`, connects to the MongoDB database, and then starts the server by making it listen for incoming requests on a specific port.

This separation allows for:

- **Clean Architecture**: Clearly separates server configuration from execution logic.
- **Enhanced Testability**: The configured `app` can be easily imported into test files (e.g., `auth.test.ts`, `habit.test.ts`) for direct API testing without needing a live server instance.
- **Flexibility**: Supports more complex startup procedures and potential reuse of the `app` object in different contexts.

## 5. API Documentation

### Authentication

**POST** `/api/register`

- **Body:**
  ```json
  {
    "name": "Nishant Gupta",
    "email": "nishantgupta2253@gmail.com",
    "password": "karma.123"
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
    "email": "nishantgupta2253@gmail.com",
    "password": "karma.123"
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
    "title": "Evening Run",
    "description": "Run 5km daily",
    "frequency": "daily",
    "tags": ["health", "fitness", "cardio"],
    "reminderTime": "18:00"
  }
  ```

**GET** `/api/habits`

Retrieve paginated habits for the logged-in user.

- **Headers:** `Authorization: Bearer <token>`

- **Query Parameters:**

| Name    | Default | Description     |
| :------ | :------ | :-------------- |
| `page`  | `1`     | Page number     |
| `limit` | `10`    | Habits per page |

- **Example Request:**

  `GET /api/habits?page=2&limit=5`

- **Example Response:**

  ```json
  {
    "habits": [{ "title": "Morning Run" }, { "title": "Read Book" }],
    "pagination": {
      "totalHabits": 12,
      "totalPages": 3,
      "currentPage": 2,
      "limitPerPage": 5
    }
  }
  ```

**GET** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`
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

**PUT** `/api/habits/:id`

- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Evening Walk",
    "description": "Walk 5km daily",
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
    "title": "Evening Walk",
    "description": "Walk 5km daily",
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

### Custom Date Tracking & Sliding Streak Logic

This section details the advanced features for tracking habits and viewing their history.

#### Custom Date Habit Tracking

You can mark a habit as completed for a specific day—past, present, or future—by sending a `date` in the request body. If no date is provided, it defaults to the current day.

**POST** `/api/habits/:id/track`

- **Headers:** `Authorization: Bearer <token>`
- **Body (Optional):**

  To track for a specific date:

  ```json
  {
    "date": "2025-10-17"
  }
  ```

  To track for today, send an empty body:

  ```json
  {}
  ```

- **Success Response (201):**

  ```json
  {
    "message": "Habit tracked successfully",
    "date": "2025-10-17",
    "currentStreak": 5,
    "longestStreak": 7
  }
  ```

- **Error Response (400 - Duplicate):**

  If the habit has already been tracked for the specified date:

  ```json
  {
    "message": "Habit already tracked for this date"
  }
  ```

#### Sliding Window Streak Calculation

The app now calculates streaks using a **sliding window** approach. This means streaks are dynamically computed based on consecutive days, even if you backfill older records. The `currentStreak` is the number of consecutive days of tracking leading up to today, while the `longestStreak` is the all-time maximum.

#### History Validation

The `GET /api/habits/:id/history` endpoint now requires a minimum of 7 tracking logs to return a history. This ensures that clients can build a consistent 7-day view.

**GET** `/api/habits/:id/history`

- **Headers:** `Authorization: Bearer <token>`

- **Success Response (200):**

  Returns the 7 most recent tracking dates if at least 7 logs exist.

  ```json
  {
    "totalLogs": 7,
    "last7Days": [
      "2025-10-17",
      "2025-10-16",
      "2025-10-15",
      "2025-10-14",
      "2025-10-13",
      "2025-10-12",
      "2025-10-11"
    ]
  }
  ```

- **Error Response (400 - Insufficient History):**

  If fewer than 7 tracking entries exist for the habit:

  ```json
  {
    "message": "Not sufficient history (need 7 or more logs)"
  }
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
    Create a `.env` file in the **root directory** of the project with the following content:

    ```
    # Local MongoDB Connection String
    # The 'habit_tracker' is the default database name. You can change it if needed.
    MONGO_URI=mongodb://127.0.0.1:27017/habit_tracker

    # Or, for MongoDB Atlas (cloud database), uncomment and replace placeholders:
    # MONGO_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER_NAME>.mongodb.net/habit_tracker

    PORT=5000
    JWT_SECRET=your_jwt_secret
    ```

4.  **Database Seeding:**

    To populate the database with initial data, run the following command:

    ```bash
    npm run seed
    ```

5.  **Running the Server**

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

6.  **Stopping the Server**

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

## 7. Schema Design

### User Schema

| Field      | Type   | Description                             |
| :--------- | :----- | :-------------------------------------- |
| `name`     | String | The name of the user.                   |
| `email`    | String | The email address of the user (unique). |
| `password` | String | The hashed password of the user.        |

### Habit Schema

| Field           | Type     | Description                                  |
| :-------------- | :------- | :------------------------------------------- |
| `user`          | ObjectId | The user who created the habit.              |
| `title`         | String   | The title of the habit.                      |
| `description`   | String   | A description of the habit.                  |
| `frequency`     | String   | The frequency of the habit (daily, weekly).  |
| `tags`          | [String] | An array of tags for the habit.              |
| `reminderTime`  | String   | The time of day to be reminded of the habit. |
| `currentStreak` | Number   | The current streak for the habit.            |
| `longestStreak` | Number   | The longest streak for the habit.            |

### TrackLog Schema

| Field   | Type     | Description                     |
| :------ | :------- | :------------------------------ |
| `habit` | ObjectId | The habit that was tracked.     |
| `date`  | Date     | The date the habit was tracked. |

## 8. Tools Used

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

## 9. Bonus (Optional)

### Streak Calculation

- **`streakUtils.ts`**: This file contains the core logic for calculating the current and longest streaks.
- **`habitController.ts`**: The `getHabitById` and `trackHabit` functions use `streakUtils` to update and display streak information.

### Tags

- **`Habit.ts`**: The Habit model includes a `tags` field (an array of strings).
- **`habitController.ts`**: The `getHabits` function supports filtering by a single tag using a query parameter (e.g., `GET /api/habits?tag=health`).

### Habit Reminder Time

- **`Habit.ts`**: The Habit model includes a `reminderTime` field (String).
- This is a simple storage implementation. No actual notification logic is included.

### Pagination

- **`habitController.ts`**: The `getHabits` function implements pagination using `page` and `limit` query parameters.

### Rate Limiting

- **`rateLimitMiddleware.ts`**: This middleware uses `express-rate-limit` to limit each user to 100 requests per hour.
- It is applied to all habit-related routes in `habitRoutes.ts`.

## Viewing Data in MongoDB Compass

Once your backend is running and data has been created (for example, after registering users or creating habits), you can visualize your data using MongoDB Compass.

### Step-by-Step Guide

**1 Open MongoDB Compass**

Launch MongoDB Compass. You should see an interface like this:

```
Connections
 ├── cluster0.xxxxx.mongodb.net
 ├── clusterproofchain.xxxxx.mongodb.net
 └── localhost:27017
```

**2 Connect to Your Local Database**

If using local MongoDB, click on the connection:
`localhost:27017`

Or if using MongoDB Atlas, click on your cluster connection (e.g. cluster0.xxxxxx.mongodb.net) and log in with your credentials.

**3 Access Your Project Database**

Once connected:

- Find your database named `habit_tracker` (created automatically by Mongoose).
- Click it to open collections.

You should now see:

- `users` — all registered user documents
- `habits` — all user-created habits with fields like title, frequency, tags, streak info
- `tracklogs` — each habit completion entry (per day)

**4 Verify Data**

You can open each collection to view JSON documents, inspect fields, and confirm that your API is writing data correctly.

**5 Example Documents**

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

**6 Switching Between Local and Atlas**

To use MongoDB Atlas instead of local, update your `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/habit_tracker
```

Save and restart your server:

```bash
npm run dev
```

Now Compass will show data from your Atlas cluster.
