# How to Start BuildWise Application

## Current Issue
You're seeing "connection refused" errors because the servers are not running yet.

## Step-by-Step Setup

### Step 1: Start MongoDB

**Option A: If MongoDB is installed as a Windows Service:**
```powershell
# Check if MongoDB service exists
Get-Service MongoDB

# Start MongoDB service
Start-Service MongoDB
```

**Option B: If MongoDB needs to be started manually:**
1. Open MongoDB Compass (you already have it open)
2. Click "+ Add new connection"
3. Use connection string: `mongodb://localhost:27017`
4. Click "Connect"

**Option C: Start MongoDB from command line:**
```powershell
# Navigate to MongoDB bin directory (usually something like):
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod
```

### Step 2: Start Backend Server

Open a **NEW** terminal/command prompt and run:
```powershell
cd "C:\Users\muham\Desktop\FSD Project\backend"
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost:27017
```

### Step 3: Start Frontend Server

Open **ANOTHER** terminal/command prompt and run:
```powershell
cd "C:\Users\muham\Desktop\FSD Project\frontend"
npm start
```

This will:
- Start the React development server
- Automatically open your browser at http://localhost:3000
- Show you the BuildWise login page

## Quick Summary

1. ✅ **MongoDB** - Make sure it's running (port 27017)
2. ✅ **Backend** - Run `npm run dev` in backend folder (port 5000)
3. ✅ **Frontend** - Run `npm start` in frontend folder (port 3000)

## Troubleshooting

### If MongoDB won't start:
- Check if port 27017 is already in use
- Make sure MongoDB data directory exists
- Try restarting your computer

### If backend won't start:
- Make sure `.env` file exists in backend folder
- Check if port 5000 is already in use
- Make sure MongoDB is running first

### If frontend won't start:
- Make sure backend is running first
- Check if port 3000 is already in use
- Try deleting `node_modules` and running `npm install` again

## Expected Result

Once everything is running:
- Backend API: http://localhost:5000/api
- Frontend App: http://localhost:3000
- MongoDB: localhost:27017

The frontend will automatically connect to the backend API!

