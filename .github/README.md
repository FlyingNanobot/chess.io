# GitHub Deployment Setup

This project is configured for automatic deployment to GitHub Pages (client) with separate backend deployment options.

## 📁 Project Structure

```
chess.io/
├── .github/
│   ├── workflows/
│   │   ├── deploy-client.yml     # Auto-deploys client to GitHub Pages
│   │   └── deploy-server.yml     # Creates server releases
│   └── dependabot.yml            # Auto-dependency updates
├── client/                        # React frontend
├── server/                        # Node.js backend
├── DEPLOYMENT.md                  # Detailed deployment guide
└── README.md                      # Main documentation
```

## 🔄 CI/CD Workflows

### deploy-client.yml (Automatic)
- **Trigger**: Push to `client/` folder
- **Action**: Builds React app → Deploys to GitHub Pages
- **Time**: ~5-10 minutes
- **Result**: Live at `https://yourusername.github.io/chess.io`

### deploy-server.yml (Manual)
- **Trigger**: Push to `server/` folder
- **Action**: Creates GitHub release with deployment instructions
- **Next Step**: You manually deploy to Render/Heroku/Railway
- **Time**: Deployment depends on chosen platform

## 🚀 Quick Start

1. **Push code to GitHub**
   ```bash
   git push origin iteration-002-dev
   ```

2. **Go to Settings → Pages**
   - Enable GitHub Pages
   - Select your branch

3. **Deploy server** (choose one)
   - Render: [render.com](https://render.com)
   - Heroku: [heroku.com](https://heroku.com)
   - Railway: [railway.app](https://railway.app)

4. **Add GitHub Secret**
   - `REACT_APP_SERVER_URL` = your server URL

5. **Trigger client redeploy**
   ```bash
   git commit --allow-empty -m "redeploy"
   git push
   ```

Done! ✅

## 📊 Secrets Configuration

Go to: **Settings → Secrets and variables → Actions**

| Secret Name | Value | Example |
|-------------|-------|---------|
| `REACT_APP_SERVER_URL` | Your backend URL | `https://chess-io-server.onrender.com` |

## 🔗 Deployment Links

After setup:

| Component | URL |
|-----------|-----|
| Frontend | `https://yourusername.github.io/chess.io` |
| Backend | `https://chess-io-server.onrender.com` (or your choice) |
| API Docs | Check server logs for connection info |

## 🆘 Troubleshooting

**Client not deploying?**
- Check Actions tab for build errors
- Verify GitHub Pages is enabled
- Check that `homepage` field in client/package.json is set to `"./"`

**Server not connecting?**
- Verify `REACT_APP_SERVER_URL` secret matches your server URL
- Check CORS_ORIGIN on server matches client URL
- Test server URL in browser (should show error, not timeout)

**CORS errors?**
- Check server's CORS_ORIGIN env var
- Should be: `https://yourusername.github.io/chess.io`
- Server logs show CORS rejections

## 📝 For Local Development

No special setup needed! Just:
```bash
npm install
npm start
```

Local dev uses `http://localhost:5000` automatically.

## 🔒 Security Notes

- GitHub Pages is public by default (whole repo is public)
- Server API should have CORS properly configured
- No sensitive data in code or .env files
- Use GitHub secrets for all environment variables

## 📞 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps
2. Read GitHub Actions logs in your repo
3. Check server hosting platform's documentation
4. Review error messages - they're usually helpful!

---

**Good to go! 🎉 Your chess.io is ready to deploy!**
