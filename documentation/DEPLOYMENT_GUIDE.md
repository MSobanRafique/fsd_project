# BuildWise Deployment Guide

## Prerequisites

1. **Node.js**: Version 14 or higher
2. **MongoDB**: Installed and running locally
3. **npm** or **yarn**: Package manager

## Local Development Setup

### Step 1: Database Setup

1. Ensure MongoDB is installed and running:
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# or
mongod
```

2. Verify MongoDB is running:
```bash
mongo
# or
mongosh
```

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buildwise
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Backend will run on http://localhost:5000

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## Production Deployment

### Option 1: Separate Servers

#### Backend Deployment

1. Build the backend (if needed):
```bash
cd backend
npm install --production
```

2. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name buildwise-backend
pm2 save
pm2 startup
```

3. Configure environment variables:
- Create `.env` file with production values
- Use strong JWT_SECRET
- Configure MongoDB connection string

4. Set up reverse proxy (Nginx):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Copy build directory to web server:
```bash
# Build directory is created in frontend/build
# Copy contents to web server directory
```

3. Configure Nginx to serve static files:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 2: Combined Server (Simple Deployment)

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Copy build folder to backend:
```bash
# From project root
cp -r frontend/build backend/public
```

3. Serve static files from Express:
```javascript
// Add to backend/server.js
app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

4. Deploy backend only on single server.

## Environment Configuration

### Backend Environment Variables

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/buildwise

# Authentication
JWT_SECRET=your_very_strong_secret_key_here
JWT_EXPIRE=7d

# Optional: File upload
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## MongoDB Configuration

### Local MongoDB

Default connection: `mongodb://localhost:27017/buildwise`

### Remote MongoDB (MongoDB Atlas)

1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update MONGODB_URI in backend `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buildwise
```

## Security Considerations

1. **JWT Secret**: Use strong, random secret key in production
2. **HTTPS**: Use SSL certificates for production
3. **CORS**: Configure CORS properly for production domain
4. **Environment Variables**: Never commit `.env` files
5. **File Uploads**: Implement file type validation and size limits
6. **Rate Limiting**: Consider adding rate limiting middleware
7. **Input Validation**: Always validate user input

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or change PORT in .env
```

**MongoDB connection error:**
- Verify MongoDB is running
- Check connection string
- Verify database permissions

**Module not found:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**API connection error:**
- Verify backend is running
- Check REACT_APP_API_URL in .env
- Check CORS configuration

**Build errors:**
```bash
# Clear cache and rebuild
npm run build -- --no-cache
```

## Database Backup

### Backup MongoDB
```bash
mongodump --db buildwise --out /path/to/backup
```

### Restore MongoDB
```bash
mongorestore --db buildwise /path/to/backup/buildwise
```

## Monitoring

### Backend Monitoring

Use PM2 monitoring:
```bash
pm2 monit
pm2 logs buildwise-backend
```

### Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Logging service
- Performance monitoring
- Uptime monitoring

## Updates and Maintenance

1. **Backup database** before updates
2. **Test in staging** environment first
3. **Update dependencies** regularly
4. **Monitor logs** after deployment
5. **Keep MongoDB** updated
6. **Review security** patches

## Support

For issues:
1. Check logs (backend and frontend)
2. Verify environment variables
3. Check database connection
4. Review error messages
5. Check browser console for frontend errors

