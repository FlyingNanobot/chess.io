# ♟️ Instant Chess — Multiplayer Chess Website

A minimalist chess platform where users can instantly start a game and share a link with a friend to play in real-time.

## 🚀 Features
- One-click game creation
- Shareable game links
- Real-time multiplayer via WebSockets
- Interactive chessboard with move validation

---

## 🛠️ Tech Stack

| Layer       | Tools                         |
|-------------|-------------------------------|
| Frontend    | React + Chessboard.js         |
| Backend     | Node.js + Express             |
| Real-time   | Socket.IO                     |
| Database    | (Optional) MongoDB or Firebase |
| Hosting     | Vercel, Netlify, or Render    |

---

## 📦 Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/instant-chess.git
cd instant-chess

### 2. Install Dependencies
# For frontend
cd client
npm install

# For backend
cd ../server
npm install

### 3. Run App Locally
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start

### Environment Variables
PORT=5000

### 📁 Folder Structure
instant-chess/
├── client/        # React frontend
│   └── src/
├── server/        # Node.js backend
│   └── routes/
│   └── sockets/
└── README.md

### 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

### 📄 License
MIT
