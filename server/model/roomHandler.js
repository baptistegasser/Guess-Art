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
            socket.on('join_room',  (...args) => this.connectSocketToRoom(socket, ...args));
            socket.on('leave_room', (...args) => this.disconnectSocketRooms(socket, ...args));
            socket.on('disconnect', (...args) => this.disconnectSocketRooms(socket, ...args));
        }
    }

    /**
     * Connect a client to a room
     * @param {SocketIO.socket} socket
     * @param {string} id
     */
    connectSocketToRoom(socket, id) {
        try {
            // Remove the user from any room he was connected
            this.disconnectSocketRooms(socket);

            // Add the user to the room
            const room = this._rooms.get(id);
            if (room !== undefined) {
                room.addClient(socket);
                this._socketToRoomMap.set(socket, id);
            } else {
                throw new Error('Attempting to join a room that does not exist !');
            }
        } catch (e) {
            console.error(e.message);
            socket.emit('game_error', e.message);
        }
    }

    /**
     * Disconnect a socket from the connected sockets
     * @param {SocketIO.Socket} socket
     */
    disconnectSocketRooms(socket) {
        try {
            const room = this._rooms.get(this._socketToRoomMap.get(socket));
            if (room !== undefined) {
                room.removeClient(socket);
                this._socketToRoomMap.delete(socket);
            }
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

    /**
     * Return all available rooms
     * @returns {{ id: string, playerCount: number, maxPlayerCount: number}}
     */
    getAvailableRooms() {
        let availableRooms = [];

        for (let room of this._rooms.values()) {
            if (room.isFull()) return;
            availableRooms.push({
                id: room.getID(),
                playerCount: room.getPlayerCount(),
                maxPlayerCount: room.getMaxPlayerCount(),
            });
        }

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
