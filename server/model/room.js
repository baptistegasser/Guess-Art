const words_list = ['Box', 'Brush', 'Calendar', 'CD Player', 'Comb', 'Computer', 'Roll of Film', 'Folder', 'Lipstick', 'Mirror', 'Notebook', 'Notepad', 'Pencil', 'Perfume', 'Radio cassette player']

/**
 * Class representation of a game room
 */
class Room {
    /**
     * @param {string} id Room unique id
     * @param {object} settings Options of the room
     */
    constructor(id, settings) {
        // Unique id for the room
        this.id = id;

        // Set the options
        this.setSettings(settings);

        this.player_count = 0;
        /**
         * @type {Map.<SocketIO.Socket, string>}
         */
        this.socketToUser = new Map();
        /**
         * @type {Map.<SocketIO.Socket, number>}
         */
        this.socketToScore = new Map();

        // Set the var linked to a round to zero
        this.resetRoundDatas();
    }

    resetRoundDatas() {
        // The current boss, the one who draw
        this.boss = undefined;
        // The word to guesss
        this.guess_word = undefined;
        // The history of draw instruction made by the boss
        this.draw_instr_history = [];
        // List of users who guessed the word
        this.socketGuessed = new Set();
        // Old the state of the current round
        this.round_started = false;

        this.endRoundTimeout = undefined;
    }

    /**
     * Check and set the room's settings
     */
    setSettings(settings) {
        // Room options
        const max_player        = this.assertValidNumber(settings.max_player);
        const min_player_start  = this.assertValidNumber(settings.min_player_start);
        const round_duration    = this.assertValidNumber(settings.round_duration);
        const round_count       = this.assertValidNumber(settings.round_count);

        if (min_player_start < 2) {
            throw new Error('The minimum required player count to start a game should be 2.');
        }
        if (max_player < 2 || max_player > 10) {
            throw new Error('The max player count should be between 2 and 10.');
        }
        if (round_duration < 30 || round_duration > 180) {
            throw new Error('The round duration should be between 30 seconds and 3 minutes.');
        }
        if (round_count < 1 || round_count > 50) {
            throw new Error('The round count should be between 1 and 50 rounds.');
        }

        this.max_player         = max_player;
        this.min_player_start   = min_player_start;
        this.round_duration     = round_duration;
        this.round_count        = round_count;
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
     * @returns {number} The number of connected player
     */
    playerCount() {
        return this.player_count;
    }

    /**
     * @returns {boolean} True if the room is full
     */
    isFull() {
        return this.player_count >= this.max_player;
    }

    /**
     * @returns {boolean} True if the room is empty
     */
    isEmpty() {
        return this.player_count < 1;
    }

    /**
     * Connect a new client to the room
     * @param {SocketIO.Socket} socket The client socket
     */
    addUser(socket) {
        const username = this.getUsername(socket);

        // Ensure room not full and user not already connected
        if (this.isFull() || this.isConnected(socket)) {
            return false;
        }

        this.player_count += 1;
        this.socketToUser.set(socket, username);
        this.socketToScore.set(socket, 0);

        socket.join(this.id);
        socket.emit('draw_instr', this.getDrawInstructions());

        socket.on('guess', message => this.submitGuess(socket, message));
        socket.on('draw_instr', draw_intr => this.addDrawInstr(socket, draw_intr));

        if (this.player_count >= this.min_player_start) {
            this.startNewRound();
        }
    }

    /**
     * Disconnect a client to the room
     * @param {SocketIO.Socket} socket The client socket
     */
    removeUser(socket) {
        // If the user was the boss reset the boss
        if (this.isBoss(socket)) {
            this.boss = undefined;
        }

        this.playerCount -= 1;
        this.socketToUser.delete(socket);
        this.socketToScore.delete(socket);
        this.socketGuessed.delete(socket);
        if (this.socketGuessed.size >= this.socketToScore.size) {
            this.prematureEndRound();
        }
    }

    isConnected(socket) {
        return this.socketToUser.has(socket);
    }

    getUsername(socket) {
        return socket.request.session.user.username;;
    }

    /**
     * Test a user guess against the solution
     * @param {SocketIO.Socket} socket
     * @param {string} message
     */
    submitGuess(socket, message) {
        console.log(`${this.getUsername(socket)} proposed: ${message}`);

        // If already guessed ignore
        if (this.socketGuessed.has(socket)) {
            return;
        }

        // Boss shoul not guess !
        if (this.isBoss(socket)) {
            return;
        }

        // If the user guessed right return success else broadcast as message
        console.log(`'${message}' ?== '${this.guess_word}'`);

        if (message === this.guess_word) {
            this.socketGuessed.add(socket);
            socket.emit('guess_succes');
            const data = {
                username: '',
                message: `${this.getUsername(socket)} guessed the word !`
            }
            this.sendFrom(socket, 'user_msg', data);
            // if last one to guess, end the round
            if (this.socketGuessed.size >= this.socketToScore.size-1) {
                this.prematureEndRound();
            }
        } else {
            const data = {
                username: this.getUsername(socket),
                message: message
            }
            this.broadcast('user_msg', data);
        }
    }

    addDrawInstr(socket, draw_instr) {
        if (!this.isBoss(socket)) return;
        /*
        TODO: when the draw instr struct will be defined: clear history when
        The instruction is to clear/fill the whole canvas
        **/
        this.draw_instr_history.push(draw_instr);
    }

    /**
     * @returns {[]} All the draw instructions of the current round
     */
    getDrawInstructions() {
        return this.draw_instr_history;
    }

    isBoss(socket) {
        return this.boss === socket;
    }
}

/**
 * Static instance of a socket.io server used for communication.
 * @type {SocketIO.Server}
 */
Room._io = undefined;

module.exports = Room;
