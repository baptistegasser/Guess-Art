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
        /**
         * List of connected users and there score
         * @type {Map.<string, number>}
         */
        this.users = new Map();

        // The current boss, the one who draw
        this.boss = undefined;
        // The word to guesss
        this.guess_word = undefined;
        // The history of draw instruction made by the boss
        this.draw_instr_history = [];
        // List of users who guessed the word
        this.users_guessed = new Set();
        // Old the state of the current round
        this.round_started = false;
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

    isConnected(username) {
        return this.users.has(username);
    }

    addUser(username) {
        // Ensure room not full and user not already connected
        if (!this.hasEmptySlot() || this.isConnected(username)) {
            return false;
        }

        this.users.set(username, 0);
        return true;
    }

    hasEmptySlot() {
        return this.users.size < this.max_player;
    }

    isEmpty() {
        return this.users.size < 1;
    }

    playerCount() {
        return this.users.size;
    }

    removeUser(username) {
        // If the user was the boss reset the boss
        if (this.isBoss(username)) {
            this.boss = undefined;
        }
        return this.users.delete(username);
    }

    /**
     * Test a user guess against the solution
     * @param {string} username
     * @param {string} word
     */
    tryGuess(username, word) {
        // If already guessed return true
        if (this.users_guessed.has(username)) {
            return true;
        }

        // Boss shoul not guess !
        if (this.isBoss(username)) {
            return false;
        }

        let valid_guess = (word === this.guess_word);
        // If the user guessed right, save his username
        if (valid_guess) {
            this.users_guessed.push(username);
        }

        return valid_guess;
    }

    isBoss(username) {
        return this.boss === username;
    }

    setBoss(username) {
        if (!this.isConnected(username)) {
            return false;
        }

        this.boss = username;
        return true;
    }

    getDrawInstructions() {
        return this.draw_instr_history;
    }

    addDrawInstructions(instr) {
        /*
        TODO: when the draw instr struct will be defined: clear history when
        The instruction is to clear/fill the whole canvas
        **/
        this.draw_instr_history.push(instr);
    }

    /**
     * Start a new round with fresh values
     */
    startNewRound() {
        // Ensure the round is not started
        if (this.round_started) {
            return;
        } else {
            this.round_started = true;
        }

        // Get a new random wor different from the last one
        let index = Math.random() * words_list.length;
        while (words_list[index] === this.guess_word) {
            index = Math.random() * words_list.length;
        }
        this.guess_word = words_list[index];

        // Get a new boss which is different from the last one
        let new_boss = this.boss;
        while (new_boss === this.boss) {
            let items = Array.from(this.users.keys());
            new_boss = items[Math.random() * items.length]
        }
        this.boss = new_boss;

        // Reset the drawing history
        this.draw_instr_history = [];
        // Reset the users who found the word
        this.users_guessed = new Set();
    }

    /**
     * End the current round
     */
    endRound() {
        // Ensure the round is started
        if (!this.round_started) {
            return;
        } else {
            this.round_started = false;
        }

        // Each user who guessed see is score being increased
        // The chart in a decrease order: first get 100, second get 80, etc
        // and the rest will get the last score in the chart
        const chart = [100, 80, 60, 50];
        const max_i = chart.length-1;
        let i = 0;
        for (let username of this.users_guessed) {
            let score = this.users.get(username);
            this.users.set(username, score + chart[i]);
            if (i < max_i) ++i;
        }

        // The boss will win 10 points per user who guessed
        const point_per_guess = 10;
        let boss_score = this.users.get(this.boss) + this.users_guessed.length * point_per_guess;
        this.users.set(this.boss, boss_score);
    }
}

module.exports = Room;
