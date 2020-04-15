const GameHandler = require('./game_handler');

class Room {
    constructor(id, settings) {
        // Ensure the io server is set
        if (Room._io === undefined) {
            throw new Error('Room: IO server is not correctly configured.');
        }

        this._id = id;
        this.setSettings(settings);

        /**
         * @type {SocketIO.Socket[]}
         */
        this._connectedClient = new Array(this.max_player);
        this.playerCount = 0;

        this._gameHandler = new GameHandler(this);
    }

    getID() {
        return this._id;
    }

    /**
     * Check and set the room's settings
     */
    setSettings(settings) {
        this.maxPlayerCount     = this.assertValidNumber(settings.max_player);
        this.minPlayerToStart   = this.assertValidNumber(settings.min_player_start);
        this.roundDuration      = this.assertValidNumber(settings.round_duration);
        this.roundCount         = this.assertValidNumber(settings.round_count);

        if (this.minPlayerToStart < 2 || this.minPlayerToStart > this.maxPlayerCount) {
            throw new Error('The minimum required player count to start a game should be 2 and not exced the max player count.');
        }
        if (this.maxPlayerCount < 2 || this.maxPlayerCount > 10) {
            throw new Error('The max player count should be between 2 and 10.');
        }
        if (this.roundDuration < 30 || this.roundDuration > 180) {
            throw new Error('The round duration should be between 30 seconds and 3 minutes.');
        }
        if (this.roundCount < 1 || this.roundCount > 50) {
            throw new Error('The round count should be between 1 and 50 rounds.');
        }
    }

    /**
     * Assert the setting is a valid number
     * @param {object} setting The setting to check
     */
    assertValidNumber(setting) {
        if (setting === undefined
            || setting === null
            || isNaN(setting)
        ) {
            throw new Error('Invalid setting format/type.');
        }

        return parseInt(setting);
    }

    /**
     * Send a message to all the client in the room
     * @param {string} msg_type The 'protocol' defined by in the api
     * @param {*} datas Datas as defined in the api
     */
    broadcast(msg_type, datas) {
        Room._io.to(this._id).emit(msg_type, datas);
    }

    /**
     * Send a message to all the client in the room except the sender
     * @param {SocketIO.Socket} socket The client who don't want to get the msg
     * @param {string} msg_type The 'protocol' defined by in the api
     * @param {*} datas Datas as defined in the api
     */
    broadcastFrom(socket, msg_type, datas) {
        socket.to(this._id).emit(msg_type, datas);
    }

    isEmpty() {
        return this.playerCount === 0;
    }

    isFull() {
        return this.playerCount >= this.maxPlayerCount;
    }

    isConnected(socket) {
        return this._connectedClient.includes(socket);
    }

    getUsername(socket) {
        return socket.request.session.user.username;;
    }

    getPlayerCount() {
        return this.playerCount;
    }

    getMaxPlayerCount() {
        return this.maxPlayerCount;
    }

    addClient(socket) {
        if (this.isFull()) throw new Error('Too much clients !');
        if (this.isConnected(socket)) throw new Error('Client already connected !');

        for (let i = 0, l = this._connectedClient.length; i < l; ++i) {
            if (this._connectedClient[i] === undefined) {
                this._connectedClient[i] = socket;
            }
        }

        this.playerCount += 1;
        socket.join(this._id);
        socket.emit('draw_instr', this._gameHandler._drawingInstrHistory);
        this.broadcastFrom(socket, 'user_joined', this.getUsername(socket));
        this._gameHandler.addUser(socket);
        this.log(`${this.getUsername(socket)} connected`)
    }

    removeClient(socket) {
        if (!this.isConnected(socket)) throw new Error('Client not connected !');

        this.playerCount -= 1;
        delete this._connectedClient[this._connectedClient.indexOf(socket)];
        this._gameHandler.removeUser(socket);
        this.log(`${this.getUsername(socket)} disconnected`)
    }

    getDrawInstr() {
        return this._gameHandler.getDrawInstr();
    }

    log(message) {
        console.log(`[${this._id}]: ${message}`);
    }

    static setIO(io) {
        Room._io = io;
    }
}

/**@type {SocketIO.Server} */
Room._io = undefined;

module.exports = Room;
