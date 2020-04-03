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
        // Set the interval at which the unused room shall be cleaned
        this._cleaningIntervalID = setInterval(this.cleanRooms, this.DEFAULT_INTERVAL);
    }

    /**
     * Add a new room to the list
     * @param {Room} room 
     */
    addRoom(room) {
        this._rooms.set(room.ident, room);
    }

    /**
     * Retrieve a room by it's ID
     * @param {string} id The room's ID
     */
    getRoom(id) {
        return this._rooms.get(id);
    }

    /**
     * Stop the automatic room cleaning
     */
    stopRoomCleaning() {
        clearInterval(this._cleaningIntervalID);
    }

    /**
     * Set a new interval between the cleaning of the rooms
     * @param {number} time The new cleaning intervarl in ms
     */
    setRoomCleaningInterval(time) {
        this.stopRoomCleaning();
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
}

/**
 * Create an instance of the RoomList and freeze it,
 * preventing further modification from external code,
 * making this a kind of singleton as you can't create another instance
 */
const instance = new RoomList();
Object.freeze(instance);
module.exports = instance;