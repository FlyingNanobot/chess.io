# ⚡ Quick Deployment Checklist

Use this checklist to deploy Chess.io to the internet in ~30 minutes.

## ✅ Pre-Deployment

- [ ] Code is committed to GitHub
- [ ] Repository is public
- [ ] You have GitHub account
- [ ] You have email for Render/Heroku/Railway

## 🚀 Step 1: Enable GitHub Pages (5 min)

1. Go to your repo on GitHub
2. **Settings → Pages**
3. Source: Select your branch (`iteration-002-dev` or `main`)
4. Click **Save**
5. Wait for initial build

✅ Your client URL: `https://yourusername.github.io/chess.io`

## 🔗 Step 2: Deploy Server (15 min)

**Choose ONE platform:**

### Option A: Render (Recommended) ⭐

1. Go to [render.com](https://render.com)
2. Sign up / Login
3. New → Web Service
4. Connect GitHub repo
5. Settings:
   - Root: `server`
   - Build: `npm install`
   - Start: `npm start`
6. Environment:
   - `PORT` = `5000`
   - `CORS_ORIGIN` = `https://yourusername.github.io/chess.io`
   - `NODE_ENV` = `production`
7. Click Deploy
8. Wait ~3-5 minutes

✅ Your server URL: `https://chess-io-server.onrender.com`

### Option B: Heroku

```bash
heroku login
heroku create chess-io-server
heroku config:set CORS_ORIGIN=https://yourusername.github.io/chess.io
git subtree push --prefix server heroku main
```

✅ Your server URL: `https://chess-io-server.herokuapp.com`

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → GitHub repo
3. Set env vars (same as Render)
4. Deploy

## 🔐 Step 3: Add GitHub Secret (2 min)

1. GitHub Repo → **Settings → Secrets and variables → Actions**
2. New repository secret
3. Name: `REACT_APP_SERVER_URL`
4. Value: (your server URL from Step 2)
5. Add secret

## 🔄 Step 4: Trigger Redeploy (3 min)

From your terminal:
```bash
git commit --allow-empty -m "trigger deploy"
git push origin iteration-002-dev
```

Wait 5-10 minutes for GitHub Actions to redeploy.

## ✅ Step 5: Test (5 min)

1. Open: `https://yourusername.github.io/chess.io`
2. Should load without errors
3. Create a game
4. Check browser console (F12) for errors
5. Test with another device/browser

---

## 🎯 Result

| Component | URL |
|-----------|-----|
| Game | `https://yourusername.github.io/chess.io` |
| API | `https://chess-io-server.onrender.com` |

Both are **live on the internet**! 🌍

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Wait for GitHub Actions build, check Actions tab |
| "Cannot connect" | Check CORS_ORIGIN on server matches client URL |
| CORS error | Restart server on Render/Heroku, wait 1 min |
| Server 503 | Wait 30s, try again (cold start) |

---

## 📞 Need More Help?

- **Detailed guide**: See `DEPLOYMENT.md`
- **GitHub workflows**: See `.github/README.md`
- **Local setup**: See `README.md`

---

## 🎉 Done!

Your chess.io is now live and playable on the internet!

Share your link: **`https://yourusername.github.io/chess.io`** 🎊
