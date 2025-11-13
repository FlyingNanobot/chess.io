# ♟️ Instant Chess — Multiplayer Chess Website

A minimalist chess platform where users can instantly start a game and share a link with a friend to play in real-time.

## 🚀 Features
- ✨ One-click game creation
- 🔗 Shareable game links (`/game/:id`)
- ⚡ Real-time multiplayer via WebSockets (Socket.IO)
- ♞ Interactive chessboard with move validation (chess.js)
- 📱 Responsive design with minimal styling
- 🎮 Automatic player assignment (white/black)
- 📝 Move history tracking

---

## 🛠️ Tech Stack

| Layer       | Tools                         |
|-------------|-------------------------------|
| Frontend    | React 18 + Chessboard.jsx     |
| Backend     | Node.js + Express.js          |
| Real-time   | Socket.IO                     |
| Logic       | chess.js (move validation)    |
| Utilities   | UUID (game IDs)               |
| Styling     | CSS (minimal, utility-first)  |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/chess.io.git
cd chess.io
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.client
cp .env.example .env.server
```

Edit `.env.client` and `.env.server` as needed (defaults are provided).

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 5. Run the Application

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Start Frontend Client:**
```bash
cd client
npm start
# Client running on http://localhost:3000
```

Open `http://localhost:3000` in your browser and start playing!

---

## 📁 Project Structure

```
chess.io/
├── client/
│   ├── public/
│   │   └── index.html          # React entry point
│   ├── src/
│   │   ├── components/
│   │   │   └── ChessBoard.js   # Chessboard component
│   │   ├── pages/
│   │   │   ├── Home.js         # Start game page
│   │   │   └── Game.js         # Game board & multiplayer
│   │   ├── App.js              # Main app with routing
│   │   ├── App.css             # Styling
│   │   ├── index.js            # React DOM render
│   │   └── index.css           # Global styles
│   └── package.json            # Frontend dependencies
│
├── server/
│   ├── index.js                # Express + Socket.IO setup
│   ├── gameManager.js          # Game session logic
│   ├── socketHandlers.js       # WebSocket event handlers
│   └── package.json            # Backend dependencies
│
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🎮 How It Works

### Frontend Flow
1. User lands on **Home** page
2. Clicks **"Start Game"** → generates unique UUID
3. Redirected to **Game** page (`/game/:id`)
4. Socket connection established → player assigned color
5. Game link is shared with opponent
6. When opponent joins → game becomes active
7. Players make moves via chessboard → validated server-side → synced in real-time

### Backend Flow
1. Express server listens on port 5000
2. Socket.IO handles client connections
3. `GameManager` tracks all active games
4. When move received → validated with chess.js → broadcast to opponent
5. Game state maintained on server

---

## 🔌 Socket.IO Events

### Client → Server
- `joinGame`: Player joins a game
- `makeMove`: Player makes a chess move
- `resign`: Player resigns from the game
- `sendMessage`: Optional chat message

### Server → Client
- `playerAssigned`: Assign color to player
- `opponentJoined`: Opponent has joined
- `moveReceived`: Opponent's move received
- `gameError`: Error occurred during game
- `disconnect`: Opponent disconnected

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the 'build' folder
```

### Backend (Render/Heroku/Railway)
```bash
cd server
npm start
```

Set environment variables in your hosting platform's dashboard.

---

## 📝 Environment Variables

### Client (`.env.local`)
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

### Server (`.env`)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🛠️ Development Notes

### Adding Features
- **Chat**: Already has `sendMessage` socket event (uncomment in Game.js)
- **Timers**: Add time tracking in `gameManager.js` 
- **Database**: Integrate MongoDB/Firebase for persistent game history
- **Authentication**: Add user login for game history

### Move Validation
All moves are validated server-side using `chess.js` to prevent cheating.

### Game Session Management
- Games are stored in-memory (lost on server restart)
- For production, integrate a database
- Implement game cleanup for abandoned sessions

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

### Development Tips
- Use `nodemon` for auto-restart during backend development
- Check Socket.IO connection in browser DevTools
- Test with two browser windows/tabs on same machine

---

## 📄 License
MIT

---

## 🐛 Troubleshooting

**Frontend can't connect to backend?**
- Check `REACT_APP_SERVER_URL` in client `.env`
- Ensure server is running on port 5000
- Check CORS settings in `server/index.js`

**Moves not syncing?**
- Verify Socket.IO connection in browser console
- Check server logs for move validation errors
- Ensure both players are in same game room

**Chessboard not displaying?**
- Verify `chessboardjsx` is installed
- Check for CSS conflicts

---

## 📚 Resources
- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Socket.IO Docs](https://socket.io/docs/)
- [React Router](https://reactrouter.com/)
- [Chessboard.jsx](https://github.com/Clariity/chessboardjsx)
