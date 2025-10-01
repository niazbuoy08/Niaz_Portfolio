# Niaz Personal Website - Backend API

A production-ready Node.js backend API for a personal portfolio website with authentication, file uploads, and comprehensive CRUD operations.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📁 **File Upload** - Image and PDF upload with validation
- 🗄️ **MongoDB Integration** - Mongoose ODM with data validation
- 🔍 **Advanced Search** - Full-text search with filtering and pagination
- 🛡️ **Security** - Rate limiting, CORS, helmet, input validation
- 📊 **Logging** - Winston logger with different levels
- 🐳 **Docker Support** - Production and development containers
- ⚡ **Performance** - Compression, caching headers
- 🧪 **Testing Ready** - Jest and Supertest configuration

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Docker (optional)

### Local Development

1. **Clone and install dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

5. **API will be available at**: `http://localhost:5000`

### Docker Development

1. **Start with Docker Compose**
   ```bash
   # Development environment
   docker-compose -f docker-compose.dev.yml up

   # Production environment
   docker-compose up
   ```

2. **Access services**:
   - API: `http://localhost:5000`
   - MongoDB Express: `http://localhost:8081` (admin/admin123)

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| POST | `/auth/logout` | Logout (client-side) | Yes |

### Projects Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/projects` | Get all projects | No |
| GET | `/projects/:id` | Get single project | No |
| POST | `/projects` | Create project | Yes |
| PUT | `/projects/:id` | Update project | Yes |
| PATCH | `/projects/:id` | Partial update | Yes |
| DELETE | `/projects/:id` | Delete project | Yes |
| GET | `/projects/stats/overview` | Project statistics | No |

### Achievements Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/achievements` | Get all achievements | No |
| GET | `/achievements/:id` | Get single achievement | No |
| POST | `/achievements` | Create achievement | Yes |
| PUT | `/achievements/:id` | Update achievement | Yes |
| PATCH | `/achievements/:id` | Partial update | Yes |
| DELETE | `/achievements/:id` | Delete achievement | Yes |
| GET | `/achievements/stats/overview` | Achievement statistics | No |
| GET | `/achievements/category/:category` | Get by category | No |

### Research Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/research` | Get all research | No |
| GET | `/research/:id` | Get single research | No |
| POST | `/research` | Create research | Yes |
| PUT | `/research/:id` | Update research | Yes |
| PATCH | `/research/:id` | Partial update | Yes |
| DELETE | `/research/:id` | Delete research | Yes |
| GET | `/research/stats/overview` | Research statistics | No |
| GET | `/research/status/:status` | Get by status | No |
| GET | `/research/author/:author` | Get by author | No |

### File Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload/image` | Upload single image | Yes |
| POST | `/upload/images` | Upload multiple images | Yes |
| POST | `/upload/pdf` | Upload PDF | Yes |
| POST | `/upload/mixed` | Upload mixed files | Yes |
| DELETE | `/upload/:filename` | Delete file | Yes |
| GET | `/upload/info/:filename` | Get file info | No |
| GET | `/upload/list` | List uploaded files | Yes |

### Query Parameters

All list endpoints support these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field and direction (e.g., `-createdAt`, `title`)
- `q` - Search query (full-text search)
- `tags` - Filter by tags (comma-separated)
- `status` - Filter by status
- `fields` - Select specific fields (comma-separated)

**Example:**
```
GET /api/projects?page=1&limit=10&sort=-createdAt&q=react&tags=web,frontend&fields=title,description
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `MAX_FILE_SIZE` | Max upload file size (bytes) | `10485760` |
| `UPLOAD_PATH` | Upload directory path | `./uploads` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── logger.js        # Winston logger setup
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Error handling
│   │   ├── upload.js        # File upload middleware
│   │   └── validation.js    # Request validation
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Project.js       # Project model
│   │   ├── Achievement.js   # Achievement model
│   │   └── Research.js      # Research model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── projects.js      # Project routes
│   │   ├── achievements.js  # Achievement routes
│   │   ├── research.js      # Research routes
│   │   └── upload.js        # File upload routes
│   ├── utils/
│   │   └── queryHelpers.js  # Query utility functions
│   └── server.js            # Main server file
├── uploads/                 # File upload directory
├── logs/                    # Log files
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── Dockerfile              # Production container
├── Dockerfile.dev          # Development container
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── healthcheck.js          # Docker health check
├── mongo-init.js           # MongoDB initialization
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  tags: [String],
  status: String (planning/development/completed/archived),
  repositoryUrl: String,
  liveUrl: String,
  images: [String],
  startDate: Date,
  endDate: Date,
  contributors: [String],
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Achievement Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  organization: String,
  evidenceUrl: String,
  category: String,
  tags: [String],
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Research Model
```javascript
{
  title: String,
  abstract: String,
  authors: [String],
  publishedDate: Date,
  venue: String,
  doi: String,
  pdfUrl: String,
  tags: [String],
  status: String (draft/submitted/published),
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Helmet** for security headers
- **Input Validation** using Joi schemas
- **File Upload Validation** with type and size limits
- **Error Handling** without sensitive data exposure

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker Production

1. **Build and run**:
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f api
   ```

3. **Scale services**:
   ```bash
   docker-compose up -d --scale api=3
   ```

### Manual Deployment

1. **Install dependencies**:
   ```bash
   npm ci --only=production
   ```

2. **Set environment variables**
3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "portfolio-api"
   ```

## Monitoring

- **Health Check**: `GET /api/health`
- **Logs**: Check `logs/` directory
- **MongoDB**: Use MongoDB Compass or Mongo Express
- **Docker**: Use `docker stats` and `docker logs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint`
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email your.email@example.com or create an issue in the repository.