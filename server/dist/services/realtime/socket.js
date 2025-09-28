"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIo = getIo;
let io = null;
const presenceByRoom = new Map();
const chatLogByRoom = new Map();
function canEdit(role) {
    return role === 'owner' || role === 'editor' || role === 'reviewer';
}
function roomKey(projectId) {
    return `project:${projectId}`;
}
function broadcastPresence(room) {
    const presence = Object.values(presenceByRoom.get(room) || {});
    io?.to(room).emit('presence:update', presence.map((p) => ({ userId: p.userId, role: p.role, typing: p.typing })));
}
function pushChat(room, msg) {
    const list = chatLogByRoom.get(room) || [];
    list.push(msg);
    if (list.length > 200)
        list.splice(0, list.length - 200);
    chatLogByRoom.set(room, list);
}
function initSocket(server) {
    let SocketIO = null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        SocketIO = require('socket.io');
    }
    catch (err) {
        console.warn('socket.io not installed, realtime features disabled');
        io = null;
        return io;
    }
    if (!SocketIO) {
        return io;
    }
    io = new SocketIO.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        const userId = (socket.handshake?.auth?.userId || socket.handshake?.query?.userId || `u_${socket.id}`);
        let joinedRoom = null;
        let role = 'viewer';
        socket.on('collab:join', (payload) => {
            const { projectId } = payload;
            role = payload.role || 'viewer';
            const room = roomKey(projectId);
            socket.join(room);
            joinedRoom = room;
            const map = presenceByRoom.get(room) || {};
            map[userId] = { userId, role, socketId: socket.id, typing: false };
            presenceByRoom.set(room, map);
            const recent = chatLogByRoom.get(room) || [];
            socket.emit('chat:history', recent);
            broadcastPresence(room);
        });
        socket.on('collab:leave', () => {
            if (!joinedRoom)
                return;
            const map = presenceByRoom.get(joinedRoom) || {};
            delete map[userId];
            presenceByRoom.set(joinedRoom, map);
            socket.leave(joinedRoom);
            broadcastPresence(joinedRoom);
            joinedRoom = null;
        });
        socket.on('typing:start', () => {
            if (!joinedRoom)
                return;
            const map = presenceByRoom.get(joinedRoom) || {};
            if (map[userId])
                map[userId].typing = true;
            presenceByRoom.set(joinedRoom, map);
            broadcastPresence(joinedRoom);
        });
        socket.on('typing:stop', () => {
            if (!joinedRoom)
                return;
            const map = presenceByRoom.get(joinedRoom) || {};
            if (map[userId])
                map[userId].typing = false;
            presenceByRoom.set(joinedRoom, map);
            broadcastPresence(joinedRoom);
        });
        socket.on('editor:update', (payload) => {
            if (!joinedRoom)
                return;
            if (!canEdit(role))
                return;
            socket.to(joinedRoom).emit('editor:patch', { from: userId, ...payload });
        });
        socket.on('chat:send', (payload) => {
            if (!joinedRoom)
                return;
            const msg = {
                id: Math.random().toString(36).slice(2),
                userId,
                ts: new Date().toISOString(),
                text: payload.text,
                context: payload.context || { type: 'generic' },
            };
            pushChat(joinedRoom, msg);
            io?.to(joinedRoom).emit('chat:new', msg);
        });
        socket.on('disconnect', () => {
            if (joinedRoom) {
                const map = presenceByRoom.get(joinedRoom) || {};
                delete map[userId];
                presenceByRoom.set(joinedRoom, map);
                broadcastPresence(joinedRoom);
            }
        });
    });
    return io;
}
function getIo() {
    return io;
}
//# sourceMappingURL=socket.js.map