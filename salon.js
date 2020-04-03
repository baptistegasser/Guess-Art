const Room = require('./room');

/**
 * @type {Map.<string, Room>}
 */
const rooms = new Map();
/**
 * @type {Map.<string, string>}
 */
const userToRoomMap = new Map();

rooms.set('my_id', new Room('my_id', 4));

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
    if (userToRoomMap.get(username) !== undefined) {
        leave_room(socket, userToRoomMap.get(username));
    }

    const room = rooms.get(room_id);
    if (room === undefined || !room.hasEmptySlot()) {
        return socket.emit('game_error', 'The room is full or the id is not valid');
    }

    // Add the user to the room, the socket.io room and him the draw instr
    room.addUser(username);
    userToRoomMap.set(username, room_id);
    socket.join(room_id);
    socket.to(room_id).emit('user_joined', username);
    socket.emit('draw_instr', room.getDrawInstructions());
}

/**
 * @param {SocketIO.socket} socket 
 */
function leave(socket) {
    const username = getUsername(socket);
    const room_id = userToRoomMap.get(username);
    if (room_id !== undefined) {
        leave_room(socket, room_id);
    }
}

function leave_room(socket, room_id) {
    const username = getUsername(socket);
    rooms.get(room_id).removeUser(username);
    userToRoomMap.delete(username);
    socket.to(room_id).emit('user_leaved', username);
    socket.leave(room_id);
}

function check_guess(socket, word) {
    const username = getUsername(socket);
    const room_id = userToRoomMap.get(username);
    if (room_id === undefined) return;

    const room = rooms.get(room_id);
    if (room.tryGuess(username, word)) {
        socket.emit('guess_success');
    } else {
        socket.to(room_id).emit('user_msg', word);
    }
}

function handle_draw_instr(socket, draw_instr) {
    const username = getUsername(socket);
    const room_id = userToRoomMap.get(username);
    if (room_id === undefined) return;

    const room = rooms.get(room_id);
    if (!room.isBoss(username)) return;

    room.addDrawInstructions(draw_instr);
    socket.to(room_id).emit('draw_instr', draw_instr);
}

/**
 * Handle a client socket
 * @param {SocketIO.socket} socket 
 */
const handleConnection = (socket) => {
    console.log('A client connected');

    socket.on('disconnect', () => leave(socket));
    socket.on('join_room', room_id => join_room(socket, room_id));
    socket.on('leave_room', room_id => leave_room(socket, room_id));
    socket.on('guess', word => check_guess(socket, word));
    socket.on('draw_instr', draw_instr => handle_draw_instr(socket, draw_instr))
}

module.exports = handleConnection;