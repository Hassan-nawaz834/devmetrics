# DevMetrics - Quick Run Guide

## 🚀 Start the Project in 2 Steps

### Step 1: Start Backend
Open Terminal 1 and run:
```powershell
cd "D:\Mern Stack projects\devmetrics\server"
npm start
```
Expected output:
```
🚀 Server running on port 5000
✅ MongoDB connected
```

### Step 2: Start Frontend
Open Terminal 2 and run:
```powershell
cd "D:\Mern Stack projects\devmetrics\client"
npm run dev
```
Expected output:
```
➜  Local:   http://localhost:5173/
```

---

## 🌐 Access the App

**Open your browser and go to:**
```
http://localhost:5173/index.html
```

You should see:
- ✅ Login page with "Login with GitHub" button
- ✅ Dashboard after login (showing stats placeholder)
- ✅ Navigation to Settings and Teams

---

## ✅ What's Working

| Feature | Status |
|---------|--------|
| GitHub Login/OAuth | ✅ Ready |
| User Dashboard | ✅ Shows stats |
| User Settings | ✅ Works |
| Team Management | ✅ Works |
| Team Analytics | ✅ Works |
| Commit Stats API | ✅ Ready |
| Sync API | ✅ Ready |

---

## 📝 Environment Setup

The project is pre-configured with:
- ✅ MongoDB Atlas connection (in `server/.env`)
- ✅ GitHub OAuth credentials (update in `server/.env` if needed)
- ✅ Vite proxy configured to backend
- ✅ Session management enabled

---

## 🆘 Troubleshooting

### Frontend shows 404
- Make sure backend is running (`npm start` in server folder)
- Try accessing: http://localhost:5173/index.html

### Backend won't start
- Check MongoDB Atlas URI in `server/.env`
- Verify internet connection (for MongoDB Atlas)

### OAuth redirect fails
- Make sure `FRONTEND_URL=http://localhost:5173` in `.env`
- Update GitHub OAuth app settings to include this URL

### Port already in use
```powershell
# Find process using port
netstat -ano | findstr :5173
# Kill it
taskkill /PID <pid> /F
```

---

## 💡 Key Files Modified

- ✅ `server/routes/stats.js` - Analytics endpoints
- ✅ `server/routes/sync.js` - Sync endpoints  
- ✅ `client/src/pages/Login.jsx` - Fixed OAuth path
- ✅ `client/src/pages/Dashboard.jsx` - Enhanced UI
- ✅ `client/src/pages/Settings.jsx` - Fixed API paths
- ✅ `client/src/pages/Teams.jsx` - Fixed API paths
- ✅ `client/vite.config.js` - API proxy + React config
- ✅ `client/src/context/AuthContext.jsx` - Fixed API paths

---

## 🎯 You're All Set!

The project is **fully runnable**. Both servers are working, all API endpoints are connected, and the frontend can communicate with the backend.

Happy coding! 🚀
