const GameScheduler = require('./gameScheduler');

const words_list = ['Box', 'Brush', 'Calendar', 'CD Player', 'Comb', 'Computer', 'Roll of Film', 'Folder', 'Lipstick', 'Mirror', 'Notebook', 'Notepad', 'Pencil', 'Perfume', 'Radio cassette player']

class GameHandler {
    constructor(room) {
        /** @type {Room} */
        this._room = room;

        /** @type {Map.<SocketIO.socket, { username: string, score: number }>} */
        this._socketToUser = new Map();

        this._scheduler = new GameScheduler(this);

        this._boss = undefined;
        this._userWhoGuessed = [];
        this._mysteryWord = undefined;
        this._drawingInstrHistory = [];
        this._remainingRounds = this._room.roundCount;
        this._roundTimestamp = undefined;

        this.delayBetweenRound = 5;
        this.delayBetweenGames = 10;
        this.delayBeforeFirstRound = 3;
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
        if (this._scheduler.isRoundStarted()) {
            if (this.isBoss(socket)) {
                this.prematureEndRound(true);
            }

            // If the user guessed before leaving just remove him from the list of user who guessed
            if (this._userWhoGuessed.includes(socket)) {
                this._userWhoGuessed.splice(this._userWhoGuessed.indexOf(socket), 1);
            } else {
                // The user didn't guess, check if there is still users who didn't guessed
                if (this._userWhoGuessed.length >= this._room.playerCount - 1) {
                    this.prematureEndRound();
                }
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

        if (!this._scheduler.isGameStarted() && this._room.playerCount >= this._room.minPlayerToStart) {
            this._scheduler.startGameNow();
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
        if (this._scheduler.isRoundStarted() && message.toLowerCase() === this._mysteryWord) {
            this._userWhoGuessed.push(socket);
            socket.emit('guess_succes');

            data.username = '';
            data.message = `${this._socketToUser.get(socket).username} guessed the word !`;
            this._room.broadcastFrom(socket, 'user_msg', data);

            // If everybody guessed the word
            if (this._userWhoGuessed.length >= this._room.playerCount - 1) {
                this.prematureEndRound();
            }
        } else {
            // Send the message
            this._room.broadcast('user_msg', data);
        }
    }

    addDrawInstr(socket, draw_instr) {
        if (!this.isBoss(socket)) return;

        this._drawingInstrHistory.push(draw_instr);
        this._room.broadcastFrom(socket, 'draw_instr', [draw_instr]);
    }

    /**
     * Init the values for a new round
     */
    initRound() {
        // Get a new boss
        const candidat = Array.from(this._socketToUser.keys());
        if (candidat.length < this._room.minPlayerToStart) {
            throw new Error('Not enought player to start the round !')
        }

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

    startGame() {
        this._room.broadcast('game_start', {
            delay: this.delayBeforeFirstRound,
            roundDuration: this._room.roundDuration
        });

        this._scheduler.scheduleRoundStart(this.delayBeforeFirstRound);
        this.log('Starting game');
    }

    startRound() {
        this.initRound();

        const roundStartData = {
            boss: this._socketToUser.get(this._boss).username
        };

        this._remainingRounds -= 1;
        this._roundTimestamp = (new Date()).getTime();

        this._room.broadcastFrom(this._boss, 'round_start', roundStartData);
        this._boss.emit('round_start', { ...roundStartData, mysteryWord: this._mysteryWord });

        this._scheduler.scheduleRoundEnd(this._room.roundDuration);
        this.log(`Starting round ${this._remainingRounds}`);
    }

    prematureEndRound(bossLeft) {
        this.log('Ending round before timeout');

        // If the premature end is due to boss leaving handle it,
        // as this create a trouble for all players.
        if (bossLeft === true) {
            this._remainingRounds += 1; // don't count this round toward the player rounds
            this._userWhoGuessed = []; // consider it like nobody found the word and give 0 points
        }

        this._scheduler.cancelRoundEnd();
        this._scheduler.endRoundNow();
    }

    endRound() {
        this.log(`Round ${this._remainingRounds} ended`);

        this._roundTimestamp = undefined;

        let players = [];
        this._socketToUser.forEach((user, socket, map) => {
            const score_gained = this.calclScoreGain(socket);
            user.score += score_gained;
            players.push({ ...user, score_gained: score_gained });
            map.set(socket, user);
        });

        this._room.broadcast('round_end', {
            players: players
        });

        // Schedule next round
        if (this._remainingRounds > 0) {
            this._scheduler.scheduleRoundStart(this.delayBetweenRound);
        } else {
            this._scheduler.scheduleGameEnd(2);
        }
    }

    calclScoreGain(socket) {
        const chart = [100, 80, 60, 50];
        const chart_boss = 10;

        if (this.isBoss(socket)) {
            return chart_boss * this._userWhoGuessed.length;
        }
        if (!this._userWhoGuessed.includes(socket)) {
            return 0;
        }

        let index = this._userWhoGuessed.indexOf(socket);
        if (index >= chart.length) index = chart.length - 1;
        return chart[index];
    }

    endGame() {
        this.log('Game ended');

        const gameEndData = {
            players: this.getAllPlayers()
        }
        this._room.broadcast('game_end', gameEndData);

        this._scheduler.scheduleGameStart(this.delayBetweenGames);
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

    getGameInfo() {
        let infos = {
            draw_instr: this._drawingInstrHistory,
            players: this.getAllPlayers(),
            gameStarted: this._scheduler.isGameStarted(),
            roundStarted: this._scheduler.isRoundStarted(),
            roundDuration: this._room.roundDuration
        }

        // If round is still playing, send current boss
        if (this._scheduler.isRoundStarted()) {
            infos.boss = this._socketToUser.get(this._boss).username;
            infos.timeRemaining = ((new Date()).getTime() - this._roundTimestamp) * 1000;
        }

        return infos;
    }

    log(message) {
        this._room.log(message);
    }
}

module.exports = GameHandler;
