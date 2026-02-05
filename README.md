# MySQL + Express + React + Node.js Boilerplate

A full-stack boilerplate with MySQL database, Express.js backend, and React frontend.

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── App.js
│       └── index.js
├── server/                 # Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── database/           # SQL schema files
│   ├── routes/             # API routes
│   └── index.js
└── package.json            # Root package.json
```

## Prerequisites

- Node.js (v16+)
- MySQL (XAMPP, MySQL Server, etc.)

## Setup

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Configure Database

1. Copy `.env.example` to `.env` in the server folder:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_PORT=3306
   PORT=5000
   ```

3. Create the database and tables by running the SQL in `server/database/schema.sql`

### 3. Run the Application

**Development mode (both client and server):**
```bash
npm run dev
```

**Run server only:**
```bash
npm run server
```

**Run client only:**
```bash
npm run client
```

## API Endpoints

| Method | Endpoint       | Description      |
|--------|----------------|------------------|
| GET    | /api/users     | Get all users    |
| GET    | /api/users/:id | Get user by ID   |
| POST   | /api/users     | Create new user  |
| PUT    | /api/users/:id | Update user      |
| DELETE | /api/users/:id | Delete user      |

## Ports

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
