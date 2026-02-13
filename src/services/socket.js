import { io } from 'socket.io-client';

// socket client - handles realtime sync for code editor + canvas

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

let socket = null;
let currentRoomId = null;

const eventCallbacks = new Map();

export const initSocket = (token = null) => {
    if (socket?.connected) return socket;

    if (socket) socket.disconnect();

    console.log('connecting to socket server:', SOCKET_URL);

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    // re-register pending callbacks on new socket
    eventCallbacks.forEach((callbacks, event) => {
        callbacks.forEach(cb => socket.on(event, cb));
    });

    socket.on('connect', () => {
        console.log('socket connected:', socket.id);
        triggerCallback('connect', { socketId: socket.id });
    });

    socket.on('disconnect', (reason) => {
        console.log('socket disconnected:', reason);
        triggerCallback('disconnect', { reason });
    });

    socket.on('connect_error', (err) => {
        console.error('socket connection error:', err.message);
        triggerCallback('error', { error: err.message });
    });

    socket.on('error', (data) => {
        console.error('socket error:', data);
        triggerCallback('error', data);
    });

    socket.on('room-state', (data) => {
        console.log('got room state:', data.roomId);
        triggerCallback('room-state', data);
    });

    return socket;
};

export const getSocket = () => socket;
export const isConnected = () => socket?.connected || false;

export const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentRoomId = null;
    }
};

export const getSocketId = () => socket?.id || null;

// canvas sync (used by Canvas component)
export const syncCanvas = (canvasData) => {
    if (!socket?.connected || !currentRoomId) return;

    socket.emit('canvas-full-sync', {
        canvasId: 'main',
        ...canvasData
    });
};

export const onCanvasUpdate = (callback) => on('canvas-full-sync', callback);

// --- room management ---

export const joinRoom = (roomId) => {
    if (!socket?.connected) {
        console.error('cant join room - socket not connected');
        return false;
    }

    const displayName = localStorage.getItem('displayName') ||
        localStorage.getItem('username') || null;

    currentRoomId = roomId;
    socket.emit('join-room', { roomId, displayName });
    console.log('joining room:', roomId);
    return true;
};

export const leaveRoom = () => {
    if (socket?.connected && currentRoomId) {
        socket.emit('leave-room');
        currentRoomId = null;
    }
};

export const getCurrentRoomId = () => currentRoomId;

// --- code sync ---

export const sendCodeChange = (fileId, content, cursorPosition = null) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('code-change', { fileId, content, cursorPosition });
};

export const sendCursorPosition = (fileId, position, selection = null) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('cursor-position', { fileId, position, selection });
};

export const sendFileCreate = (file) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('file-create', { file });
};

export const sendFileDelete = (fileId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('file-delete', { fileId });
};

export const sendFileRename = (fileId, newName) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('file-rename', { fileId, newName });
};

export const sendActiveFileChange = (fileId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('active-file-change', { fileId });
};

// tab groups
export const sendTabGroupCreate = (group) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('tab-group-create', { group });
};

export const sendTabGroupUpdate = (groupId, updates) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('tab-group-update', { groupId, updates });
};

export const sendTabGroupDelete = (groupId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('tab-group-delete', { groupId });
};

// --- canvas ---

export const sendCanvasObjectAdd = (canvasId, object, objectId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-object-add', { canvasId, object, objectId });
};

export const sendCanvasObjectModify = (canvasId, objectId, changes) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-object-modify', { canvasId, objectId, changes });
};

export const sendCanvasObjectDelete = (canvasId, objectId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-object-delete', { canvasId, objectId });
};

export const sendCanvasPathCreate = (canvasId, pathData) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-path-create', { canvasId, pathData });
};

export const sendCanvasFullSync = (canvasId, fabricJSON) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-full-sync', { canvasId, fabricJSON });
};

export const sendCanvasFileCreate = (file) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-file-create', { file });
};

export const sendCanvasFileSwitch = (canvasId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-file-switch', { canvasId });
};

// --- chat ---

export const sendChatMessage = (message) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('chat-message', { message });
};

// --- terminal ---

export const sendTerminalOutput = (entry) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('terminal-output', { entry });
};

// canvas full sync (alternate interface)
export const emitCanvasFullSync = (fabricJSON) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('canvas-full-sync', {
        roomId: currentRoomId,
        fabricJSON,
        canvasId: 'main'
    });
};

export const offCanvasFullSync = (callback) => {
    if (socket) socket.off('canvas-full-sync', callback);
};

// --- cursor positions (multi-cursor) ---

export const emitCursorPosition = (position) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('cursor-position', {
        roomId: currentRoomId,
        position
    });
};

export const onCursorPosition = (callback) => {
    if (socket) socket.on('cursor-position', callback);
    if (!eventCallbacks.has('cursor-position')) {
        eventCallbacks.set('cursor-position', new Set());
    }
    eventCallbacks.get('cursor-position').add(callback);
};

export const offCursorPosition = (callback) => {
    if (socket) socket.off('cursor-position', callback);
    if (eventCallbacks.has('cursor-position')) {
        eventCallbacks.get('cursor-position').delete(callback);
    }
};

export const requestCursors = () => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('request-cursors');
};

// --- host controls ---

export const kickUser = (targetSocketId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('host-kick-user', { targetSocketId });
};

export const muteUser = (targetSocketId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('host-mute-user', { targetSocketId });
};

export const transferHost = (targetSocketId) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('host-transfer', { targetSocketId });
};

export const toggleChat = (disabled) => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('host-toggle-chat', { disabled });
};

export const endSession = () => {
    if (!socket?.connected || !currentRoomId) return;
    socket.emit('host-end-session');
};

// --- event system ---

export const on = (event, callback) => {
    if (!eventCallbacks.has(event)) {
        eventCallbacks.set(event, new Set());
    }
    eventCallbacks.get(event).add(callback);

    if (socket) socket.on(event, callback);

    return () => off(event, callback);
};

export const off = (event, callback) => {
    if (eventCallbacks.has(event)) {
        eventCallbacks.get(event).delete(callback);
    }
    if (socket) socket.off(event, callback);
};

const triggerCallback = (event, data) => {
    if (eventCallbacks.has(event)) {
        eventCallbacks.get(event).forEach(cb => cb(data));
    }
};

// convenience listeners
export const onRoomState = (cb) => on('room-state', cb);
export const onUserJoined = (cb) => on('user-joined', cb);
export const onUserLeft = (cb) => on('user-left', cb);

export const onCodeChange = (cb) => on('code-change', cb);
export const onFileCreate = (cb) => on('file-create', cb);
export const onFileDelete = (cb) => on('file-delete', cb);
export const onFileRename = (cb) => on('file-rename', cb);
export const onActiveFileChange = (cb) => on('active-file-change', cb);

export const onTabGroupCreate = (cb) => on('tab-group-create', cb);
export const onTabGroupUpdate = (cb) => on('tab-group-update', cb);
export const onTabGroupDelete = (cb) => on('tab-group-delete', cb);

export const onCanvasObjectAdd = (cb) => on('canvas-object-add', cb);
export const onCanvasObjectModify = (cb) => on('canvas-object-modify', cb);
export const onCanvasObjectDelete = (cb) => on('canvas-object-delete', cb);
export const onCanvasPathCreate = (cb) => on('canvas-path-create', cb);
export const onCanvasFullSync = (cb) => on('canvas-full-sync', cb);
export const onCanvasFileCreate = (cb) => on('canvas-file-create', cb);
export const onCanvasFileSwitch = (cb) => on('canvas-file-switch', cb);

export const onChatMessage = (cb) => on('chat-message', cb);
export const onTerminalOutput = (cb) => on('terminal-output', cb);
export const onConnect = (cb) => on('connect', cb);
export const onDisconnect = (cb) => on('disconnect', cb);

export const onHostChanged = (cb) => on('host-changed', cb);
export const onChatToggled = (cb) => on('chat-toggled', cb);
export const onYouWereKicked = (cb) => on('you-were-kicked', cb);
export const onYouWereMuted = (cb) => on('you-were-muted', cb);
export const onSessionEnded = (cb) => on('session-ended', cb);
export const onHostError = (cb) => on('host-error', cb);

// intent collaboration
export const sendIntentUpdate = (intent) => {
    if (!socket?.connected) return;
    socket.emit('intent-update', { intent });
};
export const onIntentUpdate = (cb) => on('intent-update', cb);

export default {
    initSocket, getSocket, isConnected, disconnect,
    joinRoom, leaveRoom, getCurrentRoomId,
    sendCodeChange, sendCursorPosition,
    sendFileCreate, sendFileDelete, sendFileRename, sendActiveFileChange,
    sendTabGroupCreate, sendTabGroupUpdate, sendTabGroupDelete,
    sendCanvasObjectAdd, sendCanvasObjectModify, sendCanvasObjectDelete,
    sendCanvasPathCreate, sendCanvasFullSync,
    sendCanvasFileCreate, sendCanvasFileSwitch,
    syncCanvas, onCanvasUpdate, getSocketId,
    sendChatMessage, sendTerminalOutput,
    kickUser, muteUser, transferHost, toggleChat, endSession,
    on, off,
    onRoomState, onUserJoined, onUserLeft,
    onCodeChange, onCursorPosition,
    onConnect, onDisconnect,
    onHostChanged, onChatToggled, onYouWereKicked, onYouWereMuted,
    onSessionEnded, onHostError,
    sendIntentUpdate, onIntentUpdate
};
