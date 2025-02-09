# Real Estate Document Management System

A full-stack JavaScript application for managing real estate documents with role-based access control.

## Features

- Document upload and management
- Role-based access control (Buyers, Sellers, Agents, etc.)
- Document status tracking
- Secure file storage
- Multi-format document support (PDF, Word, Images)

## Prerequisites

- Node.js (v18 or later)
- MongoDB (v4.4 or later)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-dms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running locally
   - Default connection string: `mongodb://localhost:27017/realestate-dms`

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/                # Backend Express server
│   ├── models/           # MongoDB models
│   ├── routes.js         # API routes
│   ├── auth.js           # Authentication logic
│   └── storage.js        # Database operations
└── shared/               # Shared code between frontend and backend
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run check`: Run type checks

## API Routes

- `POST /api/register`: Register new user
- `POST /api/login`: User login
- `POST /api/logout`: User logout
- `GET /api/documents`: Get user's documents
- `POST /api/documents`: Upload new document
- `PATCH /api/documents/:id/status`: Update document status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/realestate-dms |
| PORT | Server port | 5000 |
| SESSION_SECRET | Session encryption key | - |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
