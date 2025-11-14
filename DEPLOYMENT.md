# 🚀 Deployment Guide - Chess.io

This guide will help you deploy Chess.io to the internet using GitHub and free hosting services.

## 📋 Overview

- **Frontend (Client)**: Hosted on **GitHub Pages** (free, automatic)
- **Backend (Server)**: Hosted on **Render** or **Heroku** (free tier available)
- **CI/CD**: **GitHub Actions** (free)

---

## 🎯 Deployment Architecture

```
GitHub Repository
    ├── client/ → GitHub Pages (chess-io.github.io)
    └── server/ → Render/Heroku (chess-io-api.onrender.com)

GitHub Actions automatically:
1. Builds React app when you push to client/
2. Deploys to GitHub Pages
3. Creates server releases for manual deployment
```

---

## ⚙️ Setup Steps

### Step 1: Create GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

Add these secrets:

```
REACT_APP_SERVER_URL = https://your-server-url.onrender.com
```

(You'll set the server URL after deploying the server)

### Step 2: Enable GitHub Pages

1. Go to **Settings → Pages**
2. Select "Deploy from a branch"
3. Choose branch: `main` or `iteration-002-dev`
4. Select `/` (root) or `/client/build` folder
5. Click Save

Wait a few minutes. Your client will be at: `https://yourusername.github.io/chess.io`

### Step 3: Deploy the Server

#### Option A: Deploy to Render (Recommended ✅)

1. Go to **[render.com](https://render.com)**
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in:
   - **Name**: `chess-io-server`
   - **Region**: Choose nearest to you
   - **Branch**: `main` (or your dev branch)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under "Environment":
   - Add: `PORT` = `5000`
   - Add: `CORS_ORIGIN` = `https://yourusername.github.io/chess.io`
   - Add: `NODE_ENV` = `production`
6. Click "Deploy Web Service"

**Wait for deployment** (2-5 minutes)

Your server will be at: `https://chess-io-server.onrender.com`

#### Option B: Deploy to Heroku

1. Go to **[heroku.com](https://heroku.com)**
2. Create account and log in
3. Install Heroku CLI: `brew install heroku` (or download)
4. Run:
   ```bash
   heroku login
   heroku create chess-io-server
   heroku config:set CORS_ORIGIN=https://yourusername.github.io/chess.io
   git subtree push --prefix server heroku main
   ```

Your server will be at: `https://chess-io-server.herokuapp.com`

#### Option C: Deploy to Railway

1. Go to **[railway.app](https://railway.app)**
2. Create account and link GitHub
3. Create new project → GitHub repo
4. Select repository
5. In variables, add:
   - `PORT` = `5000`
   - `CORS_ORIGIN` = `https://yourusername.github.io/chess.io`
6. Deploy

---

## 🔄 Step 4: Update Secrets with Server URL

1. Go back to your GitHub repo
2. **Settings → Secrets and variables → Actions**
3. Update `REACT_APP_SERVER_URL`:
   - If Render: `https://chess-io-server.onrender.com`
   - If Heroku: `https://chess-io-server.herokuapp.com`
   - If Railway: `https://your-project.railway.app`

4. Commit a small change to `client/` to trigger redeploy:
   ```bash
   git commit --allow-empty -m "trigger redeploy with server URL"
   git push
   ```

---

## ✅ Verify Deployment

1. Visit your client: `https://yourusername.github.io/chess.io`
2. Open browser console (F12) → check for errors
3. Try creating a game
4. Check that it's connecting to the backend server

---

## 🔧 Environment Variables

### Client (`.env.local` or GitHub Secret)
```env
REACT_APP_SERVER_URL=https://chess-io-server.onrender.com
```

### Server (Render/Heroku/Railway Environment)
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourusername.github.io/chess.io
```

---

## 🚨 Troubleshooting

### Issue: CORS errors in browser console
**Solution**: 
- Check `CORS_ORIGIN` in server environment variables matches your GitHub Pages URL exactly
- Make sure `CORS_ORIGIN` includes the full path: `https://yourusername.github.io/chess.io`

### Issue: "Cannot connect to server"
**Solution**:
- Verify server is running on Render/Heroku/Railway dashboard
- Check `REACT_APP_SERVER_URL` is correct in GitHub Actions logs
- Wait 1-2 minutes for cold starts on free tier

### Issue: Moves not syncing
**Solution**:
- Check browser console for Socket.IO connection errors
- Verify both players are in same game room
- Check server logs on hosting platform

### Issue: GitHub Pages shows 404
**Solution**:
- Make sure `gh-pages` branch exists
- Check repo settings → Pages is enabled
- Verify build succeeded in Actions tab

---

## 📊 Free Tier Limitations

| Service | Limit | Notes |
|---------|-------|-------|
| GitHub Pages | Unlimited | 1GB per site, perfect for frontend |
| Render | 750 hours/month | Auto-spins down after 15 min inactivity |
| Heroku | Limited | May be deprecated soon |
| GitHub Actions | 2,000 min/month | Free for public repos |

---

## 🔄 Automatic Deployments

Once set up:

1. **Push to `client/`** → GitHub Actions builds → GitHub Pages updates (5-10 min)
2. **Push to `server/`** → GitHub Actions creates release → Manual deploy to Render/Heroku
3. **Always working**: Your live site updates automatically!

---

## 📱 Testing Multiplayer Online

1. Open your site on **Computer A**: `https://yourusername.github.io/chess.io`
2. Open the same site on **Computer B** (or phone on same WiFi)
3. Create a game on Computer A, share link with Computer B
4. Start playing!

---

## 🎯 Next Steps

- [ ] Create GitHub repo
- [ ] Push code with this deployment guide
- [ ] Add GitHub secrets
- [ ] Enable GitHub Pages
- [ ] Deploy server to Render/Heroku
- [ ] Update REACT_APP_SERVER_URL secret
- [ ] Test with two devices
- [ ] Share your live link! 🎉

---

## 📞 Still Have Issues?

1. Check GitHub Actions logs: Repo → Actions → Latest workflow
2. Check server logs: Render/Heroku dashboard
3. Check browser console: F12 → Console tab
4. Read error messages carefully - they usually tell you what's wrong!

---

## 🎊 Congratulations!

Your Chess.io is now live on the internet! Share it with friends and challenge them to a game! ♟️
