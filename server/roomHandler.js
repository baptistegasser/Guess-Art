/**
 * A container used to store the current game room.
 * Feature an autocleaning method called on a regular interval
 * to remove empty rooms to be less memory heavy.
 */
class RoomHandler {
    /**
     * Default cleaning interval set to be every 30min
     */
    DEFAULT_INTERVAL = 15 * 60 * 1000;

    constructor() {
        /**
         * Map of active room, identified by there ids
         * @type {Map.<string, Room>}
         */
        this._rooms = new Map();

        /**
         * Map a username to a socket
         * @type {Map.<string, SocketIO.Socket>}
         */
        this._userToSocket = new Map();
        /**
         * Map a username to a room id
         * @type {Map.<string, string>}
         */
        this._userToRoom = new Map();

        // Set the interval at which the unused room shall be cleaned
        this._cleaningIntervalID = undefined;
        this.setRoomCleaningInterval(this.DEFAULT_INTERVAL)
    }
    /**
     * Set a new interval between the cleaning of the rooms
     * @param {number} time The new cleaning intervarl in ms
     */
    setRoomCleaningInterval(time) {
        if (this._cleaningIntervalID !== undefined) {
            clearInterval(this._cleaningIntervalID);
        }
        this._cleaningIntervalID = setInterval(() => {this.cleanRooms()}, time);
    }

    /**
     * Clean unused rooms
     */
    cleanRooms() {
        const ids = this._rooms.keys();
        for (let id of ids) {
            if (this._rooms.get(id).isEmpty()) {
                this._rooms.delete(id);
            }
        }
    }

    /**
     *
     * @param {SocketIO.Server} io
     */
    getSocketHandler() {
        return (socket) => {
            socket.on('join_room',  (...args) => this.connectSocketToRoom(socket, ...args));
            socket.on('leave_room', (...args) => {console.log('disconnect due to leave_room'); this.disconnectSocketRooms(socket, ...args)});
            socket.on('disconnect', (...args) => {console.log('disconnect due to socket disconnect'); this.disconnectSocketRooms(socket, ...args)});
        }
    }

    /**
     * Connect a client to a room
     * @param {SocketIO.socket} socket
     * @param {string} id
     */
    connectSocketToRoom(socket, id) {
        try {
            // Retrieve the username, oldSocket (which is the old or current one) and the current room id
            const username = socket.request.session.user.username;
            const oldSocket = this._userToRoom.get(username);
            const oldRoomID = this._userToRoom.get(username);

            // Does the username is already existing but with a different socket ?
            if (oldSocket !== socket) {
                this._userToSocket.set(username, socket);
                // If the user is in a room, update the room
                if (oldRoomID !== undefined) {
                    this._rooms.get(this._userToRoom.get(username)).updateClient(oldSocket, socket);
                }
            }

            // Kick the user from the old room if any
            if (oldRoomID !== undefined || oldRoomID !== id) {
                this.disconnectSocketRooms(socket);
            }

            const room = this._rooms.get(id);
            if (room !== undefined) {
                room.addClient(socket);
                this._userToRoom.set(username, id);
                this._userToSocket.set(username, socket);
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
            const username = socket.request.session.user.username;
            if (this._userToSocket.get(username) !== socket) return;

            const room = this._rooms.get(this._userToRoom.get(username));
            if (room !== undefined) {
                room.removeClient(socket);
                this._userToSocket.delete(username);
                this._userToRoom.delete(username);
            }
        } catch (e) {
            console.error(e.message);
            console.log(e.stack)
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
