/**
 * A container used to store the current game room.
 * Feature an autocleaning method called on a regular interval
 * to remove empty rooms to be less memory heavy.
 */
class RoomList {
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
        // Set the interval at which the unused room shall be cleaned
        this._cleaningIntervalID = setInterval(this.cleanRooms, this.DEFAULT_INTERVAL);
    }

    /**
     * Set a new interval between the cleaning of the rooms
     * @param {number} time The new cleaning intervarl in ms
     */
    setRoomCleaningInterval(time) {
        clearInterval(this._cleaningIntervalID);
        this._cleaningIntervalID = setInterval(this.cleanRooms, time);
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
     * Add a new room to the list
     * @param {Room} room
     */
    addRoom(room) {
        this._rooms.set(room.id, room);
    }

    /**
     * Retrieve a room by it's ID
     * @param {string} id The room's ID
     * @return {Room}
     */
    getRoomFromID(id) {
        return this._rooms.get(id);
    }

    /**
     * Retrieve a room where the user is
     * @param {SocketIO.Socket} socket
     * @return {Room}
     */
    getRoomFromSocket(socket) {
        const id = this._socketToRoomMap.get(socket);
        if (id !== undefined) {
            return this.getRoomFromID(id);
        } else {
            return undefined;
        }
    }

    /**
     * Test if a room is available
     * @param {string} id The room's id
     * @return {boolean}
     */
    isAvailable(id) {
        const room = this.getRoomFromID(id);
        return room !== undefined && !room.isFull();
    }

    /**
     * Add a socket to the given room
     * @param {SocketIO.Socket} socket
     * @param {string} id The room's id
     */
    addSocketToRoom(socket, id) {
        const room = this.getRoomFromID(id);
        if (room === undefined) return;
        room.addUser(socket);
        this._socketToRoomMap.set(socket, id);
    }

    /**
     * Remove a socket from the room he is connected to
     * @param {SocketIO.Socket} socket
     * @return {string} The id of the ex user's room
     */
    removeSocketFromIsRoom(socket) {
        const room = this.getRoomFromSocket(socket)
        if (room === undefined) return undefined;

        this._socketToRoomMap.delete(socket);
        room.removeUser(socket);

        return room.id;
    }

    getDrawInstructions(id) {
        const room = this.getRoomFromID(id);
        if (room !== undefined) {
            return room.getDrawInstructions();
        } else {
            return [undefined];
        }
    }
    getAvailableRooms() {
        let availableRooms = [];

        this._rooms.forEach((room, id, map) => {
            if (room.isFull()) return;
            availableRooms.push({ room_id: id, player_count: room.playerCount() })
        });

        return availableRooms;
    }
}

/**
 * Create an instance of the RoomList and freeze it,
 * preventing further modification from external code,
 * making this a kind of singleton as you can't create another instance
 */
const instance = new RoomList();
Object.freeze(instance);
module.exports = instance;
