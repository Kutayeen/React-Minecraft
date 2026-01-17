/**
 * NODE.JS BACKEND SERVER
 * 
 * To run this:
 * 1. Create a folder named 'server' outside of the frontend src
 * 2. Save this content as 'index.js'
 * 3. Run `npm init -y`
 * 4. Run `npm install express socket.io`
 * 5. Run `node index.js`
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from React app
    methods: ["GET", "POST"]
  }
});

// Game State
let players = {};
let worldChanges = {}; // Simple delta compression: "x,y,z" -> type

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Initialize Player
  players[socket.id] = {
    id: socket.id,
    position: { x: 0, y: 10, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  };

  // Send initial world delta
  socket.emit('world-init', worldChanges);

  // Send current players
  socket.emit('players-init', players);
  
  // Notify others
  socket.broadcast.emit('player-joined', players[socket.id]);

  // Handle Movement
  socket.on('player-move', (data) => {
    if (players[socket.id]) {
        players[socket.id].position = data.position;
        players[socket.id].rotation = data.rotation;
        // Broadcast to others (exclude sender for latency)
        socket.broadcast.emit('player-update', { id: socket.id, ...data });
    }
  });

  // Handle Block Updates
  socket.on('block-update', (data) => {
    const { x, y, z, type } = data;
    const key = `${x},${y},${z}`;
    
    // Update server state
    worldChanges[key] = type;
    
    // Broadcast to ALL clients including sender (authoritative confirm)
    io.emit('block-update', data);
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('player-left', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Voxel Server running on port ${PORT}`);
});
