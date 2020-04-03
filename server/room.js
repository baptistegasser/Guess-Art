const words_list = ['Box', 'Brush', 'Calendar', 'CD Player', 'Comb', 'Computer', 'Roll of Film', 'Folder', 'Lipstick', 'Mirror', 'Notebook', 'Notepad', 'Pencil', 'Perfume', 'Radio cassette player']

/**
 * Class representation of a game room
 */
class Room {
    /**
     * @param {string} id Room unique id
     * @param {string} max_players Max number of players allowed
     */
    constructor(id, max_players) {
        // Unique id for the room
        this.id = id;
        // Maximum number of player allowed
        this.max_players = max_players;
        
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
        return this.users.size < this.max_players;
    }

    isEmpty() {
        return this.users.size < 1;
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