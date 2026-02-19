# Intelligent Assignment Evaluation & Feedback Platform

A production-ready full-stack web application that leverages AI and machine learning to provide intelligent assignment evaluation, plagiarism detection, and automated feedback generation for educational institutions.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with role-based access (Student/Instructor)
- **Assignment Management**: Create, view, edit, and delete assignments
- **Submission System**: Submit assignments via text or PDF upload
- **AI-Powered Evaluation**: Automated feedback generation using OpenAI API
- **Plagiarism Detection**: TF-IDF + Cosine Similarity algorithms
- **Real-time Processing**: Asynchronous evaluation with status tracking
- **Role-based Dashboards**: Tailored interfaces for students and instructors

### Technical Features
- **Modern Tech Stack**: Next.js 14, Node.js, PostgreSQL, Prisma ORM
- **Responsive Design**: Mobile-first UI with TailwindCSS
- **Type Safety**: TypeScript throughout the application
- **File Handling**: PDF upload and text extraction
- **API Security**: Rate limiting, CORS, input validation
- **Database**: PostgreSQL with optimized queries and relationships

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key (for AI feedback generation)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd newthink
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/assignment_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Server
PORT=5000
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Run seed script for sample data
npm run db:seed
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
```

Configure your `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME="Assignment Evaluation Platform"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 5. Start the Applications

#### Backend Development Server
```bash
cd backend
npm run dev
```
The backend will be available at `http://localhost:5000`

#### Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

### Users
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: STUDENT | INSTRUCTOR)
- `createdAt` (DateTime)

### Assignments
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (String)
- `createdBy` (UUID, Foreign Key to Users)
- `createdAt` (DateTime)

### Submissions
- `id` (UUID, Primary Key)
- `content` (Text, Optional)
- `fileUrl` (String, Optional)
- `plagiarismRisk` (Float, Default: 0)
- `feedbackSummary` (Text, Optional)
- `score` (Integer, Optional)
- `status` (Enum: PENDING | EVALUATED)
- `assignmentId` (UUID, Foreign Key to Assignments)
- `studentId` (UUID, Foreign Key to Users)
- `createdAt` (DateTime)

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Assignment Endpoints
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Instructor only)
- `PUT /api/assignments/:id` - Update assignment (Instructor only)
- `DELETE /api/assignments/:id` - Delete assignment (Instructor only)
- `GET /api/assignments/my/assignments` - Get my created assignments (Instructor only)

### Submission Endpoints
- `POST /api/submissions` - Create submission (Student only)
- `GET /api/submissions/my` - Get my submissions (Student only)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for assignment
- `GET /api/submissions/:id` - Get single submission
- `PATCH /api/submissions/:id/score` - Update submission score (Instructor only)

## 🤖 AI/ML Features

### Plagiarism Detection
- **Algorithm**: TF-IDF vectorization with cosine similarity
- **Process**: Compares submission against all previous submissions for the same assignment
- **Output**: Plagiarism risk percentage (0-100%)
- **Threshold**: >70% similarity marked as high risk

### AI Feedback Generation
- **Provider**: OpenAI GPT-3.5-turbo
- **Features**:
  - Constructive feedback (3-5 lines)
  - Strengths and improvement areas
  - Numeric scoring (0-100)
  - Detailed analysis
- **Fallback**: Basic scoring system when OpenAI is unavailable

## 🚀 Deployment

### Frontend (Vercel)

1. **Prepare for Deployment**:
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Environment Variables for Vercel**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_APP_NAME="Assignment Evaluation Platform"
   NEXT_PUBLIC_APP_VERSION="1.0.0"
   ```

### Backend (Render/Railway)

#### Option 1: Render

1. **Prepare Repository**:
   - Ensure `package.json` has correct start script
   - Add `start: "node server.js"` if not present

2. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Select Node.js environment
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Environment Variables for Render**:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-key
   NODE_ENV=production
   PORT=5000
   ```

#### Option 2: Railway

1. **Deploy to Railway**:
   - Install Railway CLI: `npm install -g @railway/cli`
   - Login: `railway login`
   - Initialize: `railway init`
   - Deploy: `railway up`

2. **Set Environment Variables**:
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set JWT_SECRET=your-secret-key
   railway variables set OPENAI_API_KEY=your-openai-key
   railway variables set NODE_ENV=production
   ```

### Database Setup for Production

1. **PostgreSQL on Render/Railway**:
   - Create a PostgreSQL service
   - Get connection string
   - Update `DATABASE_URL` environment variable

2. **Run Migrations**:
   ```bash
   # Connect to your deployed service
   # Run: npm run db:push
   # Or: npm run db:migrate
   ```

## 📱 Usage

### For Students
1. **Register/Login**: Create account or sign in
2. **View Assignments**: Browse available assignments
3. **Submit Work**: Submit text or PDF files
4. **View Feedback**: Check plagiarism scores and AI feedback
5. **Track Progress**: Monitor submission history and scores

### For Instructors
1. **Register/Login**: Create instructor account
2. **Create Assignments**: Set up new assignments with descriptions
3. **Monitor Submissions**: View all student submissions
4. **Review AI Feedback**: Check automated evaluations
5. **Override Scores**: Adjust scores if needed (bonus feature)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Express-validator for API input sanitization
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured cross-origin resource sharing
- **File Upload Security**: Multer with file type and size restrictions
- **SQL Injection Prevention**: Prisma ORM parameterized queries

## 📊 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Async Processing**: Non-blocking evaluation pipeline
- **Caching**: Redis for session management (optional)
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Dynamic imports for better loading

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **OpenAI API Error**:
   - Verify API key is correct
   - Check API quota and billing
   - Ensure network connectivity

3. **File Upload Issues**:
   - Check upload directory permissions
   - Verify file size limits
   - Ensure PDF files are valid

4. **Frontend Build Errors**:
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify environment variables

### Logs and Monitoring

- **Backend Logs**: Check console output or use logging service
- **Frontend Errors**: Browser console and Next.js error reporting
- **Database Queries**: Prisma query logging (enable in development)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - User authentication
  - Assignment management
  - Submission system
  - AI-powered evaluation
  - Plagiarism detection

---

**Built with ❤️ for modern education**
