# URL Shortener

A simple URL shortener application built with Node.js, Express, and PostgreSQL.

## Project Structure

project-root/
│
├── controllers/
│ ├── auth.js # Authentication controller
│ ├── health.js # Health check controller
│ ├── URL.js # URL management controller
│
├── database/
│ ├── connection.js # Database connection configuration
│
├── middleware/
│ ├── auth.js # Authentication and admin check middleware
│
├── models/
│ ├── url.js # URL model and table creation script
│ ├── user.js # User model and table creation script
│
├── routes/
│ ├── routes.js # Route definitions
│
├── .env # Environment variables file
├── index.js # Main application entry point
├── package.json # Project dependencies and scripts
├── README.md # Project documentation


## API Endpoints

### Authentication Routes
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user

### URL Management Routes
- `POST /api/create` - Create a new short URL (authenticated)
- `PUT /api/edit` - Edit an existing short URL (authenticated)
- `DELETE /api/delete` - Delete an existing short URL (authenticated)
- `GET /api/:short_url` - Redirect to the original URL

### Admin Routes
- `POST /api/admin/create` - Create a new short URL as admin
- `PUT /api/admin/edit` - Edit an existing short URL as admin
- `DELETE /api/admin/delete` - Delete an existing short URL as admin
- `GET /api/admin/report` - Generate a report of all URLs

### User-Specific Routes
- `GET /api/urls` - Get all URLs created by the authenticated user

### Health Check Routes
- `GET /` - Health check endpoint
- `POST /` - Another health check endpoint
