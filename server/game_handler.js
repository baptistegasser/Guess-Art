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
        this._remainingRounds = this._room.roundCount;
        this._gameStarted = false;
        this._roundStarted = false;
        this._roundTimeout = undefined;
    }

    isBoss(socket) {
        return this._boss === socket;
    }

    setBoss(socket) {
        this._boss = socket;
        this._room.broadcast('boss', this._socketToUser.get(socket).username)
        this.log(`${this._room.getUsername(socket)} is the new boss !`);
    }

    removeUser(socket) {
        this._socketToUser.delete(socket);

        // If the user was the boss handle it
        if (this.isBoss(socket) && this._roundStarted) {
            this.prematureEndRound(true);
        }

        // If the user guessed before leaving just remove him from the list of user who guessed
        if (this._userWhoGuessed.includes(socket)) {
            this._userWhoGuessed.splice(this._userWhoGuessed.indexOf(socket), 1);
        } else {
            // The user didn't guess, check if there is still users who didn't guessed
            if (this._userWhoGuessed.length >= this._room.playerCount - 1 && this._roundStarted) {
                this.prematureEndRound();
            }
        }
    }

    addUser(socket, username) {
        this._socketToUser.set(socket, {
            username : username,
            score: 0
        });

        socket.on('guess', message => this.submitGuess(socket, message));
        socket.on('draw_instr', (draw_instr) => {this.addDrawInstr(socket, draw_instr)});

        if (!this._gameStarted && this._room.playerCount >= this._room.minPlayerToStart) {
            this.startGame();
        }
    }

    submitGuess(socket, message) {
        // If already guessed or is boss: ignore
        if (this._userWhoGuessed.includes(socket) || this.isBoss(socket)) {
            return;
        }

        // Message to broadcast to other players
        let data = {
            username: this._socketToUser.get(socket).username,
            message: message
        };

        // If the user guessed right tell him and adapt the message seen by other player
        if (this._roundStarted && message.toLowerCase() === this._mysteryWord) {
            this._userWhoGuessed.push(socket);
            socket.emit('guess_succes');

            data.username = '';
            data.message = `${this._socketToUser.get(socket).username} guessed the word !`;
        }
        // Send the message
        this._room.broadcast('user_msg', data);

        // If everybody guessed the word
        if (this._userWhoGuessed.length >= this._room.playerCount - 1) {
            this.prematureEndRound();
        }
    }

    addDrawInstr(socket, draw_instr) {
        if (!this.isBoss(socket)) return;

        this._drawingInstrHistory.push(draw_instr);
        this._room.broadcastFrom(socket, 'draw_instr', [draw_instr]);
    }

    getDrawInstr() {
        return this._drawingInstrHistory;
    }

    /**
     * Init the values for a new round
     */
    initRound() {
        // Get a new boss
        const candidat = Array.from(this._socketToUser.keys());
        const l = candidat.length - 1;
        let i = Math.round(Math.random() * l);
        while (candidat[i] === this._boss) {
            i = Math.round(Math.random() * l);
        }
        this.setBoss(candidat[i]);

        // Get a new word
        const wl = words_list.length - 1;
        let index = Math.round(Math.random() * wl);
        while (words_list[index] === this._mysteryWord) {
            index = Math.round(Math.random() * wl);
        }
        this._mysteryWord = words_list[index].toLowerCase();
        this.log(`The mystery word is: '${this._mysteryWord}'`)

        this._userWhoGuessed = [];
        this._drawingInstrHistory = [];
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

    startGame() {
        if (this._gameStarted) return;

        this._gameStarted = true;
        this._room.broadcast('game_start', 3);
        setTimeout(() => { this.startRound() }, 3 * 1000);
        this.log('Starting game');
    }

    startRound() {
        if (this._roundStarted) return;

        this._roundStarted = true;
        this._remainingRounds -= 1;
        this.initRound();

        this._room.broadcast('round_start', this._room.roundDuration);
        setTimeout(() => { this.endRound() }, this._room.roundDuration * 1000);
        this.log(`Starting round ${this._remainingRounds}`);
    }

    prematureEndRound(bossLeft) {
        this.log('Ending round before timeout');
        if (this._roundTimeout !== undefined) {
            clearInterval(this._roundTimeout);
        }

        // If the premature end is due to boss leaving handle it,
        // as this create a trouble for all players.
        if (bossLeft === true) {
            this._remainingRounds += 1; // don't count this round toward the player rounds
            this._userWhoGuessed = []; // consider it like nobody found the word and give 0 points
        }

        this.endRound();
    }

    endRound() {
        this.log(`Round ${this._remainingRounds} ended`);

        this._roundStarted = false;
        this._roundTimeout = undefined;

        // Get the new scores
        const scores = this.calcAndSetScores();
        // Return the scores as end of round datas
        this._room.broadcast('end_round', scores);

        // Schedule next round
        if (this._remainingRounds > 0) {
            setTimeout(() => { this.startRound() }, 5 * 1000);
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.log('Game ended');

        this._gameStarted = false;
        let final_scores = [];
        this._socketToUser.forEach((user, socket, map) => {
            final_scores.push(user);
        });

        this._room.broadcast('game_end', final_scores);
        setTimeout(() => { this.startRound() }, 10 * 1000);
    }

    /**
     * Return the players and there score
     * @returns {{username: string, score: number}[]}
     */
    getAllPlayers() {
        return Array.from(this._socketToUser.values());
    }

    getPlayer(socket) {
        return this._socketToUser.get(socket);
    }

    log(message) {
        this._room.log(message);
    }
}

module.exports = GameHandler;
