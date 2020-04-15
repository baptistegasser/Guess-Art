/**
 * A container used to store the current game room.
 * Feature an autocleaning method called on a regular interval
 * to remove empty rooms to be less memory heavy.
 */
class RoomHandler {
    /**
     * Default cleaning interval set to be every 30min
     */
    DEFAULT_INTERVAL = 30 * 60 * 1000;

    constructor() {
        /**
         * Map of active room, identified by there ids
         * @type {Map.<string, Room>}
         */
        this._rooms = new Map();
        /**
         * Map a user to a room id
         * @type {Map.<SocketIO.Socket, string>}
         */
        this._socketToRoomMap = new Map();
    }

    /**
     *
     * @param {SocketIO.Server} io
     */
    getSocketHandler() {
        return (socket) => {
            socket.on('join_room',  (...args) => this.addSocket(socket, ...args));
            socket.on('leave_room', (...args) => this.removeSocket(socket, ...args));
            socket.on('disconnect', (...args) => this.removeSocket(socket, ...args));
        }
    }

    /**
     * Link a user to a specific room
     * @param {SocketIO.socket} socket
     * @param {string} id
     */
    addSocket(socket, id) {
        try {
            // Remove the user from the old room
            const old_room = this._rooms.get(this._socketToRoomMap.get(socket));
            if (old_room !== undefined) {
                this.removeSocket(socket);
            }

            // Add the user to the room, the socket.io room
            const room = this._rooms.get(id);
            if (room === undefined) return;
            room.addClient(socket);
            this._socketToRoomMap.set(socket, id);
        } catch (e) {
            console.error(e.message);
            socket.emit('game_error', e.message);
        }
    }

    /**
     * Remove a socket from the connected sockets
     * @param {SocketIO.Socket} socket
     */
    removeSocket(socket) {
        try {
            const room = this._rooms.get(this._socketToRoomMap.get(socket));
            if (room === undefined) return;

            room.removeClient(socket);
            this._socketToRoomMap.delete(socket);
        } catch (e) {
            console.error(e.message);
            socket.emit('game_error', e.message);
        }
    }

    /**
     * Add a new room to the list
     * @param {Room} room
     */
    addRoom(room) {
        if (this._rooms.get(room.getID()) !== undefined) {
            throw new Error(`A room with th id '${room.id}' already exist !`);
        }
        this._rooms.set(room.getID(), room);
    }

    getAvailableRooms() {
        let availableRooms = [];

        this._rooms.forEach((room, id, map) => {
            if (room.isFull()) return;
            availableRooms.push({ room_id: id, player_count: room.getPlayerCount() })
        });

        return availableRooms;
    }
}

/**
 * Create an instance of the RoomHandler and freeze it,
 * preventing further modification from external code,
 * making this a kind of singleton as you can't create another instance
 */
const instance = new RoomHandler();
Object.freeze(instance);
module.exports = instance;
