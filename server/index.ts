import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';

const PORT = parseInt(process.env.PORT || '1234');

// In-memory document store (MVP - no persistence yet)
// TODO: Add Redis persistence
const docs = new Map<string, Y.Doc>();

const wss = new WebSocketServer({ host: '0.0.0.0', port: PORT });

wss.on('connection', (ws, req) => {
  // Extract room code from URL path (e.g., /WDQG -> WDQG)
  const roomCode = req.url?.slice(1) || 'default';
  console.log(`Client connected to room: ${roomCode}`);

  setupWSConnection(ws, req, { docName: roomCode });
});

wss.on('listening', () => {
  console.log(`y-websocket server running on ws://localhost:${PORT}`);
});
