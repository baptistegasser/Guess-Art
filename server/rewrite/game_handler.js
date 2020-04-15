const Room = require('./room');
const words_list = ['Box', 'Brush', 'Calendar', 'CD Player', 'Comb', 'Computer', 'Roll of Film', 'Folder', 'Lipstick', 'Mirror', 'Notebook', 'Notepad', 'Pencil', 'Perfume', 'Radio cassette player']

class GameHandler {
    constructor(room) {
        /** @type {Room} */
        this._room = room;

        /** @type {Map.<SocketIO.socket, { username: string, score: number }>} */
        this._socketToUser = new Map();

        this._boss = undefined;
        this._userWhoGuessed = [];
        this._mysteryWord = undefined;
        this._drawingInstrHistory = [];
        this._remainingRounds = this._room.playerCount;
        this._roundInPlay = false;
        this._endRoundTimeout = undefined;
    }

    isBoss(socket) {
        return this._boss === socket;
    }

    setBoss(socket) {
        for (let client of this._socketToUser.keys()) {
            if (client === socket) {
                client.on('draw_instr', this.addDrawInstr)
            } else {
                client.on('draw_instr', () => {})
            }
        }

        this._room.broadcast('boss', this._socketToUser.get(socket).username)
    }

    removeUser(socket) {
        this._socketToUser.delete(socket);
        // TODO Was the user the boss ? -> End game, choose new boss, start new round (count round ?)
    }

    addUser(socket, username) {
        this._socketToUser.set(socket, {
            username : username,
            score: 0
        });

        socket.on('guess', message => this.submitGuess(socket, message));

        if (this._room.playerCount >= this._room.minPlayerToStart) {
            this.startGame();
        }
    }

    submitGuess(socket, message) {
        console.log(this._room.getUsername(socket), ':', message);

        // If already guessed or is boss: ignore
        if (this._userWhoGuessed.includes(socket) || this.isBoss(socket)) {
            return;
        }

        // Message to broadcast to other players
        let data = {
            username: this._room.getUsername(socket),
            message: message
        };

        // If the user guessed right tell him and adapt the message seen by other player
        if (this._roundInPlay && message === this.guess_word) {
            this._userWhoGuessed.push(socket);
            socket.emit('guess_succes');

            data.username = '';
            data.message = `${this.getUsername(socket)} guessed the word !`;
        }
        // Send the message
        this._room.broadcast('user_msg', data);

        // If everybody guessed the word
        if (this._userWhoGuessed.size >= this._room.playerCount - 1) {
            this.endRound();
        }
    }

    addDrawInstr(draw_intr) {
        this._drawingInstrHistory.push(draw_intr);
    }

    getDrawInstr() {
        return this._drawingInstrHistory;
    }

    /**
     * Start a new round
     */
    startRound() {
        if (this._remainingRounds <= 0) return;
        if (this._roundInPlay) return;

        this.initRound();
        this._roundInPlay = true;
        this._remainingRounds -= 1;

        setTimeout(() => {
            this._endRoundTimeout = undefined;
            this.endRound();
        }, this._room.roundDuration * 1000);

        this._room.broadcast('start_round', this._room.roundDuration);
    }

    /**
     * Init the values for a new round
     */
    initRound() {
        // Get a new boss
        let newBoss = this._boss;
        let candidat = Array.from(this.socketToUser.keys());
        while (newBoss === this._boss) {
            newBoss = candidat[Math.round(Math.random() * candidat.length)]
        }
        this.setBoss(newBoss);

        // Get a new word
        let index = Math.random() * words_list.length;
        while (words_list[index] === this.guess_word) {
            index = Math.round(Math.random() * words_list.length);
        }
        this._mysteryWord = words_list[index];

        this._userWhoGuessed = [];
        this._drawingInstrHistory = [];
    }

    /**
     * Handle a round end
     */
    endRound() {
        if (!this._roundInPlay) return;

        if (this._endRoundTimeout !== undefined) {
            clearTimeout(this._endRoundTimeout);
            this._endRoundTimeout = undefined;
        }

        this._roundInPlay = false;
        // Get the new scores
        const scores = this.calcAndSetScores();
        // Return the scores as end of round datas
        this._room.broadcast('end_round', scores);
    }

    /**
     * Calculate the score gained for each players
     * @returns {[Object]} A array of username and the points gained
     */
    calcAndSetScores() {
        // Each user who guessed see is score being increased
        // The chart in a decrease order: first get 100, second get 80, etc
        // and the rest will get the last score in the chart
        const chart = [100, 80, 60, 50];
        let guessed = 0;
        const max_guessed = chart.length-1;
        // The boss will win 10 points per user who guessed
        const bossScore = this._userWhoGuessed.length * 10;

        let i = 0;
        const scores = new Array(this._socketToUser.size);
        this._socketToUser.forEach((user, socket, map) => {
            if (this.isBoss(socket)) {
                user.score += bossScore;
                scores[i] = bossScore;
                map.set(socket, user);
            } else if (this._userWhoGuessed.includes(socket)) {
                user.score += chart[guessed];
                scores[i] = chart[guessed];
                map.set(socket, user);
                if (guessed < max_guessed) guessed += 1;
            } else {
                scores[i] = 0;
            }

            i += 1;
        });

        return Object.freeze(scores);
    }
}

module.exports = GameHandler;
