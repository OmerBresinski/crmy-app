# CRMY Server

A robust backend server for a Customer Relationship Management (CRM) system with user authentication, organization management, and role-based access control.

## Features

- **User Authentication**: Secure registration and login functionality
- **Organization Management**: Create and manage organizations
- **Role-Based Access Control**: Admin and user role distinction
- **JWT Authentication**: Secure API access with JSON Web Tokens

## Technologies Used

- **Node.js & Express**: Server framework
- **TypeScript**: Type-safe JavaScript
- **Prisma ORM**: Database management and queries
- **bcrypt**: Password hashing
- **JWT**: Authentication tokens
- **Error Handling**: Custom error classes

## Setup and Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd crmy-server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL="your-database-connection-string"
   JWT_SECRET="your-jwt-secret"
   PORT=3000
   ```

4. Run database migrations
   ```
   npx prisma migrate dev
   ```

5. Start the server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Register a new user and optionally create an organization
  - Body: `{ email, password, organizationName }`

- **POST /api/auth/login**
  - Authenticate a user
  - Body: `{ email, password }`

## Project Structure

```
src/
├── controllers/      # Request handlers
├── middlewares/      # Express middlewares
├── models/           # Prisma schema
├── routes/           # API routes
├── services/         # Business logic & database services
├── utils/            # Utility functions
└── server.ts         # Main application entry
```

## Error Handling

The application uses a custom `AppError` class for handling operational errors and a global error handler middleware.

## License

MIT
