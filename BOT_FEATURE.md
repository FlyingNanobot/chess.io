# Chess.io Bot Feature

This document describes the "Play Against Bots" feature implementation.

## File Structure

```
client/
  src/
    pages/
      Home.js          # Updated with bot button
      Bots.js          # NEW: Bot selection page
      BotGame.js       # NEW: Bot game page
    components/
      ChessBoard.js    # (existing - used by bot game)
    utils/
      BotEngine.js     # NEW: Bot move generation engine
public/
  stockfishWorker.js   # NEW: Stockfish web worker (placeholder)
```

## Routing

- `/` → Home (with "Play Against Player" and "Play Against Bot" buttons)
- `/bots` → Bot selection (choose bot type and player color)
- `/bot-game/:botType/:color` → Active game against bot

## Bot Types

### 1. Enpassanto
- **Strategy**: Random moves with heuristic preference for captures and checks
- **Difficulty**: Levels 1-10 (configurable in BotGame.js)
- **Performance**: Fast, instant responses
- **No external dependencies required**

### 2. Stockfish
- **Strategy**: Advanced engine-based move calculation
- **Difficulty**: Adjustable depth parameter
- **Performance**: Slower but more realistic
- **Current Status**: Placeholder implementation using Web Worker

## Game Flow

1. **Home Page**: User clicks "Play Against Bot"
2. **Bot Selection** (`/bots`):
   - Select bot opponent (Enpassanto or Stockfish)
   - Select player color (White or Black)
   - Click "Start Game"
3. **Game Page** (`/bot-game/:botType/:color`):
   - Board renders with player color orientation
   - If player is White: player moves first
   - If player is Black: bot moves first
   - After each player move, bot automatically generates a response
   - Continues until checkmate, stalemate, or resignation

## Key Features

✅ **Turn-Based Gameplay**
- Bot only moves when it's its turn
- Player can only move when it's their turn
- Board updates reflect whose turn it is

✅ **Move Validation**
- All moves validated by chess.js
- Illegal moves rejected with error message
- Bot only generates legal moves

✅ **Game End Detection**
- Detects checkmate, stalemate, insufficient material
- Shows game result and allows rematch

✅ **Difficulty Scaling**
- Enpassanto: Levels 1-10
- Stockfish: Adjustable depth (10 + level × 2)
- Higher difficulty = slower, stronger moves

✅ **Responsive UI**
- Visual feedback for bot thinking
- Status messages showing turn info
- Move history display

## Configuration

### Adjusting Bot Difficulty

In `BotGame.js`, line ~49:
```javascript
const move = await BotEngine.getMove(fen, botType, 6); // Change 6 to 1-10
```

### Adjusting Thinking Time

In `BotEngine.js`:
- Enpassanto: Line ~77 - adjust setTimeout delay
- Stockfish: Line ~95 - adjust timeout

## Stockfish Integration (Advanced)

To use real Stockfish:

1. Download from https://stockfishchess.org/download/
2. Extract `stockfish.wasm` and `stockfish.js` to `public/stockfish/`
3. Update `/public/stockfishWorker.js` to initialize Stockfish
4. Uncomment the production setup section

Example:
```javascript
importScripts('/stockfish/stockfish.js');

Stockfish.onReady = () => {
  isReady = true;
};

self.addEventListener('message', (event) => {
  const { id, fen, depth } = event.data;
  
  Stockfish.postMessage(`position fen ${fen}`);
  Stockfish.postMessage(`go depth ${depth}`);
  
  // Parse bestmove response and postMessage back
});
```

## Browser Compatibility

- **Web Workers**: Supported in all modern browsers
- **sessionStorage**: For session caching (optional)
- **localStorage**: For game history (optional)

## Performance Notes

- **Enpassanto**: ~500ms thinking time (configurable)
- **Stockfish**: ~1-3 seconds depending on depth
- **Memory**: ~50MB for Stockfish WASM (if loaded)

## Future Improvements

- [ ] Persistent game history
- [ ] ELO rating system
- [ ] Time controls (blitz, rapid, classical)
- [ ] Actual Stockfish WASM integration
- [ ] Chess openings database
- [ ] Position analysis / hint system
- [ ] Game replay and analysis

## Testing

1. Start the app: `npm start`
2. Click "Play Against Bot"
3. Select Enpassanto (white)
4. Play a few moves
5. Verify bot responds with legal moves
6. Test game end conditions

## Troubleshooting

**Bot doesn't move:**
- Check browser console for errors
- Verify game status is not "Game Over"
- Ensure it's bot's turn

**Illegal moves detected:**
- Check chess.js version compatibility
- Verify FEN string validity
- Review BotEngine move validation

**Web Worker not loading:**
- Verify `stockfishWorker.js` is in `public/` folder
- Check browser console for CORS errors
- Ensure correct path in BotEngine.js initialization
