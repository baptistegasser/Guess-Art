const Room = require('./model/room');
const RoomList = require('./roomList');

// Mock room, TODO: remove
const mock_room = new Room('mock_id', {
    max_player: 8,
    min_player_start: 4,
    round_duration: 45,
    round_count: 10,
});
RoomList.addRoom(mock_room);
// TODO Don't disable, it's for the mock time
RoomList.stopRoomCleaning();

function getUsername(socket) {
    return socket.request.session.user.username;
}

/**
 * Link a user to a specific room
 * @param {SocketIO.socket} socket
 * @param {string} room_id
 */
function join_room(socket, room_id) {
    const username = getUsername(socket);

    // Remove the user from the old room
    const old_room = RoomList.getRoomFromUser(username);
    if (old_room !== undefined) {
        leave_room(socket);
    }

    if (!RoomList.isAvailable(room_id)) {
        return socket.emit('game_error', 'The room is full or the id is not valid');
    }

    // Add the user to the room, the socket.io room and him the draw instr
    RoomList.addUserToRoom(username, room_id);
    socket.join(room_id);
    socket.to(room_id).emit('user_joined', username);
    socket.emit('draw_instr', RoomList.getDrawInstructions(room_id));
}

/**
 * @param {SocketIO.socket} socket
 */
function leave_room(socket) {
    const username = getUsername(socket);
    const room_id = RoomList.removeUserFromIsRoom(username);
    if (room_id !== undefined) {
        socket.to(room_id).emit('user_leaved', username);
    }
}

function check_guess(socket, word) {
    const username = getUsername(socket);
    const room = RoomList.getRoomFromUser(username);

    if (room === undefined) return;

    if (room.tryGuess(username, word)) {
        socket.emit('guess_success');
    } else {
        socket.to(room.id).emit('user_msg', word);
    }
}

function handle_draw_instr(socket, draw_instr) {
    const username = getUsername(socket);
    const room = RoomList.getRoomFromUser(username);

    if (room === undefined /* TODO put back when boss system in place || !room.isBoss(username)*/) return;

    for (let instr of draw_instr) {
        room.addDrawInstructions(instr);
    }
    socket.to(room.id).emit('draw_instr', draw_instr);
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
    socket.on('guess', word => check_guess(socket, word));
    socket.on('draw_instr', draw_instr => handle_draw_instr(socket, draw_instr))
}

module.exports = socketHandler;
