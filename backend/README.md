# SplitEasy Backend API

A production-ready Node.js + Express backend for the SplitEasy expense sharing application with Firebase Authentication and MongoDB.

## 🚀 Features

- **Firebase Authentication** (Google Login + Phone OTP)
- **MongoDB + Mongoose** for data persistence
- **Secure API** with Firebase Admin SDK token verification
- **Expense Management** with equal/custom splitting
- **Group Management** with member permissions
- **Settlement Calculation** with optimized debt simplification
- **Rate Limiting** and security middleware
- **Comprehensive Error Handling**
- **Seed Script** for demo data

## 📋 Prerequisites

- Node.js 18.0 or higher
- MongoDB 4.4 or higher
- Firebase Project with Authentication enabled

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spliteasy-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/spliteasy
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
   
   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

## 🔥 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Google and Phone providers

3. **Generate Service Account Key**
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Download the JSON file

4. **Update Environment Variables**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[Copy key from JSON]\n-----END PRIVATE KEY-----\n"
   ```

## 🗄️ Database Setup

### MongoDB Local Installation

1. **Install MongoDB**
   ```bash
   # macOS
   brew install mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB**
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

### MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Seed Database (Optional)

```bash
npm run seed
```

This creates sample users, groups, and expenses for testing.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All routes (except `/health`) require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register/create user profile |
| GET | `/auth/profile` | Get user profile |
| PUT | `/auth/profile` | Update user profile |
| DELETE | `/auth/account` | Delete user account |

#### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create new group |
| GET | `/groups` | Get user's groups |
| GET | `/groups/:groupId` | Get group details |
| PUT | `/groups/:groupId/members` | Add members to group |
| DELETE | `/groups/:groupId/members/:userId` | Remove member from group |
| DELETE | `/groups/:groupId` | Delete group (creator only) |

#### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups/:groupId/expenses` | Add expense to group |
| GET | `/groups/:groupId/expenses` | Get group expenses |
| GET | `/expenses/:expenseId` | Get expense details |
| PUT | `/expenses/:expenseId` | Update expense (creator only) |
| DELETE | `/expenses/:expenseId` | Delete expense (creator only) |

#### Settlements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups/:groupId/settlements` | Get group settlement calculations |
| POST | `/groups/:groupId/settlements` | Record settlement |
| GET | `/groups/:groupId/settlements/history` | Get settlement history |

#### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## 📝 Request/Response Examples

### Create Group

**Request:**
```bash
POST /api/groups
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "name": "Goa Trip 2024",
  "description": "Beach vacation with friends",
  "members": [
    {
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "phone": "+1234567890"
    }
  ],
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Goa Trip 2024",
    "description": "Beach vacation with friends",
    "createdBy": "64a1b2c3d4e5f6789012346",
    "members": [...],
    "currency": "INR",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Add Expense

**Request:**
```bash
POST /api/groups/64a1b2c3d4e5f6789012345/expenses
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "description": "Beach dinner",
  "amount": 4500,
  "paidBy": "64a1b2c3d4e5f6789012347",
  "splitType": "equal",
  "splitBetween": [
    { "user": "64a1b2c3d4e5f6789012346" },
    { "user": "64a1b2c3d4e5f6789012347" },
    { "user": "64a1b2c3d4e5f6789012348" }
  ],
  "category": "food",
  "notes": "Great seafood restaurant"
}
```

### Get Settlements

**Request:**
```bash
GET /api/groups/64a1b2c3d4e5f6789012345/settlements
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 3,
    "totalAmount": 46500,
    "currency": "INR",
    "memberCount": 4,
    "settlements": [
      {
        "from": {
          "_id": "64a1b2c3d4e5f6789012347",
          "name": "Mike Brown",
          "email": "mike@example.com"
        },
        "to": {
          "_id": "64a1b2c3d4e5f6789012346",
          "name": "Sarah Chen",
          "email": "sarah@example.com"
        },
        "amount": 1500.00
      }
    ],
    "memberBalances": [...]
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/spliteasy` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Required |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Required |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Required |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Test Authentication

```bash
# Get Firebase ID token from your frontend app
# Then test with curl:
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/auth/profile
```

## 🚀 Deployment

### Environment Setup

1. **Set Production Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="..."
   FRONTEND_URL=https://your-frontend.com
   ```

2. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

3. **Start Application**
   ```bash
   pm2 start server.js --name "spliteasy-api"
   pm2 save
   pm2 startup
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t spliteasy-api .
docker run -p 5000:5000 --env-file .env spliteasy-api
```

## 🛡️ Security Features

- **Firebase Token Verification** for all protected routes
- **Rate Limiting** (100 requests per 15 minutes)
- **Helmet.js** for security headers
- **CORS** configuration
- **Input Validation** with Mongoose
- **Error Sanitization** in production

## 📊 Monitoring

### Logs

The application uses Morgan for HTTP request logging:
- Development: Console output
- Production: Structured logging

### Health Check

Monitor application health:
```bash
curl http://localhost:5000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify network connectivity

2. **Firebase Authentication Error**
   - Verify Firebase project configuration
   - Check service account key format
   - Ensure private key is properly escaped

3. **CORS Error**
   - Update FRONTEND_URL in .env
   - Check frontend URL matches exactly

4. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review API documentation above

---

**Built with ❤️ using Node.js, Express, Firebase, and MongoDB**
