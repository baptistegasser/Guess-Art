const GameScheduler = require('./gameScheduler');

const words_list = ['diary', 'bottle', 'water', 'packet', 'chewing gum', 'tissue', 'glasses', 'watch', 'sweet', 'photo', 'camera', 'stamp', 'postcard', 'dictionary', 'coin', 'brush', 'credit card', 'identity card', 'key', 'mobile phone', 'phone', 'card', 'wallet', 'button', 'umbrella', 'pen', 'pencil', 'lighter', 'cigarette', 'match', 'lipstick', 'purse', 'case', 'clip', 'scissors', 'rubber', 'file', 'banknote', 'passport', 'driving licence', 'comb', 'notebook', 'laptop', 'rubbish', 'mirror', 'painkiller', 'sunscreen', 'toothbrush', 'headphone', 'player', 'battery', 'light bulb', 'bin', 'newspaper', 'magazine', 'alarm clock'];

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

        // First, is there enought player to keep playing ?
        if ((this._scheduler.isGameStarted() || this._scheduler.isGameStarting()) && !this._scheduler.isGameEnding() && this._room.playerCount < this._room.minPlayerToStart) {
            this._scheduler.endGameNow();
            this._room.broadcastFrom(socket, 'game_info', this.getGameInfo());
            return
        }

        // Handling is important when a round started
        if (this._scheduler.isRoundStarted()) {

            // If the user was the boss handle it
            if (this.isBoss(socket)) {
                return this.prematureEndRound(true);
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

    updateUser(oldSocket, newSocket) {
        if (this._boss === oldSocket) {
            this._boss = oldSocket;
        }
        const user = this._socketToUser.get(oldSocket);
        this._socketToUser.set(newSocket, user);
        this._socketToUser.delete(oldSocket);
        if (this._userWhoGuessed.includes(oldSocket)) {
            this._userWhoGuessed[this._userWhoGuessed.indexOf(oldSocket)] = newSocket;
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
            this._room.broadcast('guess_success',{username:this._socketToUser.get(socket).username})

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
        if (draw_instr._flagged === true) {
            this._room.broadcast('draw_instr', [draw_instr]);
        } else {
            this._room.broadcastFrom(socket, 'draw_instr', [draw_instr]);
        }
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

    startGame() {
        this._room.broadcast('game_start', {
            delay: this.delayBeforeFirstRound,
            roundDuration: this._room.roundDuration
        });
        this._socketToUser.forEach((user, socket, map) => {
            user.score = 0;
            map.set(socket, user);
        });
        this._remainingRounds = this._room.roundCount;

        this._scheduler.scheduleRoundStart(this.delayBeforeFirstRound);
        this.log('Starting game');
    }

    startRound() {
        this.initRound();

        const roundStartData = {
            boss: this._socketToUser.get(this._boss).username,
            mysteryWord: this._mysteryWord.replace(/[^\ ]/g,'-')
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
            players: players,
            word : this._mysteryWord,
            numberRound : this._room.roundCount - this._remainingRounds
        });

        // Schedule next round
        if (this._remainingRounds > 0) {
            this._scheduler.scheduleRoundStart(this.delayBetweenRound);
        } else {
            this._scheduler.scheduleGameEnd(2);
        }
    }

    calclScoreGain(socket) {
        const chart = [50, 35, 20, 10];
        const chart_boss = Math.floor(50/this._room.playerCount);

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

    endGame(launchAnotherGame) {
        this.log('Game ended');

        const gameEndData = {
            players: this.getAllPlayers()
        }
        this._room.broadcast('game_end', gameEndData);

        if (launchAnotherGame !== false) {
            this._scheduler.scheduleGameStart(this.delayBetweenGames);
        }
    }

    /**
     * Return the players and there score
     * @returns {{username: string, score: number}[]}
     */
    getAllPlayers() {
        return Array.from(this._socketToUser.values()).filter(v => v !== undefined);
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
            infos.timeRemaining = ((new Date()).getTime() - this._roundTimestamp) / 1000;
        }

        return infos;
    }

    log(message) {
        this._room.log(message);
    }
}

module.exports = GameHandler;
