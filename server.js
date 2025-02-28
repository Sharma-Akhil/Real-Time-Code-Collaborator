const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions'); // Import socket actions

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Store users and their code
const userSocketMap = {};
const roomCodeMap = {}; // Stores the latest code for each room

// Helper function to get all clients in a room
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => ({
            socketId,
            username: userSocketMap[socketId],
        })
    );
}

io.on('connection', (socket) => {
    console.log('⚡ New socket connected:', socket.id);

    // Handle user joining a room
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        console.log(`📢 ${username} joined room: ${roomId}`);
        
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        // Notify existing users about new user
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });

        // 🔥 Send existing code to new user if available
        if (roomCodeMap[roomId]) {
            io.to(socket.id).emit(ACTIONS.CODE_CHANGE, {
                code: roomCodeMap[roomId],
            });
        }
    });

    // Handle code changes
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        roomCodeMap[roomId] = code; // Save the latest code for the room
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code }); // Broadcast to others
    });

    // Handle code sync requests
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Handle user disconnection
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];

        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        console.log(`❌ ${userSocketMap[socket.id]} disconnected`);
        delete userSocketMap[socket.id];
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
