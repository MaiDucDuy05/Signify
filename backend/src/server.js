import http from 'http';
import { app } from './app.js';
import { initWebSocket } from './websocket.js';
import { initDB } from './postgres/index.js';

const server = http.createServer(app);

server.listen(4000, '0.0.0.0', async () => {
  console.log('✅ Server (HTTP + WS) running on port 4000');
  await initDB();
  initWebSocket(server);
});