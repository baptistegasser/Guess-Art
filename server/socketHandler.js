const Room = require('./model/room');
const RoomList = require('./roomList');

// Mock room, TODO: remove
RoomList.addRoom(
    new Room('mock_id', {
        max_player: 8,
        min_player_start: 2,
        round_duration: 120,
        round_count: 10,
    })
);

/**
 * Link a user to a specific room
 * @param {SocketIO.socket} socket
 * @param {string} room_id
 */
function join_room(socket, room_id) {
    // Remove the user from the old room
    const old_room = RoomList.getRoomFromSocket(socket);
    if (old_room !== undefined) {
        RoomList.removeSocketFromIsRoom(socket);
    }

    // Add the user to the room, the socket.io room and him the draw instr
    RoomList.addSocketToRoom(socket, room_id);
}

/**
 * @param {SocketIO.socket} socket
 */
function leave_room(socket) {
    RoomList.removeSocketFromIsRoom(socket);
}

/**
 * Handle a client socket
 * @param {SocketIO.socket} socket
 */
const socketHandler = (socket) => {
    console.log('A client connected');

    socket.on('disconnect', () => leave_room(socket));
    socket.on('join_room', room_id => join_room(socket, room_id));
    socket.on('leave_room', () => leave_room(socket));
}

module.exports = socketHandler;
