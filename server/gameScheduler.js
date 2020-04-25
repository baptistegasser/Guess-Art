class GameScheduler {
    /**
     * @param {GameHandler} gameHandler The game handler using this scheduler
     */
    constructor(gameHandler) {
        this._gameHandler = gameHandler;

        this._gameStarted = false;
        this._roundStarted = false;

        this._game = {
            started: false,
            startScheduled: false,
            startTimeout: undefined,
            endScheduled: false,
            endTimeout: undefined,
        }
        this._round = {
            started: false,
            startScheduled: false,
            startTimeout: undefined,
            endScheduled: false,
            endTimeout: undefined,
        }
    }

    scheduleGameStart(delay) {
        if (this._game.started || this._game.startScheduled) {
            throw new Error("Can't schedule a game start multiple times");
        }

        this._game.startScheduled = true;
        const callback = () => {
            this._game.started        = true;
            this._game.startScheduled = false;
            this._game.startTimeout   = undefined;
            this._gameHandler.startGame();
        };
        if (delay <= 0) {
            callback();
        } else {
            this._game.startTimeout = setTimeout(callback, delay * 1000);
        }
    }

    startGameNow() {
        this.scheduleGameStart(-1);
    }

    scheduleGameEnd(delay, launchAnotherGame) {
        if (!this._game.started || this._game.endScheduled) {
            throw new Error("Can't schedule a game end multiple times");
        }

        this._game.endScheduled = true;
        const callback = () => {
            this._game.started      = false;
            this._game.endScheduled = false;
            this._game.endTimeout   = undefined;
            this._gameHandler.endGame(launchAnotherGame);
        };
        if (delay <= 0) {
            callback();
        } else {
            this._game.endTimeout = setTimeout(callback, delay * 1000);
        }
    }

    /**
     * Special function to force a game end, will cancel all timeout
     */
    endGameNow() {
        const old_gameStarted = this._game.started;

        if (this._game.startScheduled)  this.cancelGameStart();
        if (this._round.startScheduled) this.cancelRoundStart();
        if (this._round.endScheduled)   this.cancelRoundEnd();
        if (this._game.endScheduled)    this.cancelGameEnd();

        // Manual round ending
        this._round.started = false;
        if (old_gameStarted)  this.scheduleGameEnd(-1, false);
    }

    scheduleRoundStart(delay) {
        if (this._round.started || this._round.startScheduled) {
            throw new Error("Can't schedule a round start multiple times");
        } else if (!this._game.started) {
            throw new Error("Can't schedule a round start if the game is not started !");
        }

        this._round.startScheduled = true;
        const callback = () => {
            this._round.started        = true;
            this._round.startScheduled = false;
            this._round.startTimeout   = undefined;
            this._gameHandler.startRound();
        };
        if (delay <= 0) {
            callback();
        } else {
            this._round.startTimeout = setTimeout(callback, delay * 1000);
        }
    }

    scheduleRoundEnd(delay) {
        if (!this._round.started || this._round.endScheduled) {
            throw new Error("Can't schedule a round end multiple times");
        }

        this._round.endScheduled = true;
        const callback = () => {
            this._round.started      = false;
            this._round.endScheduled = false;
            this._round.endTimeout   = undefined;
            this._gameHandler.endRound();
        };
        if (delay <= 0) {
            callback();
        } else {
            this._round.endTimeout = setTimeout(callback, delay * 1000);
        }
    }

    endRoundNow() {
        this.scheduleRoundEnd(-1);
    }

    cancelGameStart() {
        if (!this._game.startScheduled) {
            return;
        }

        clearTimeout(this._game.startTimeout);
        this._game.startScheduled = false;
        this._game.startTimeout = undefined;
    }

    cancelGameEnd() {
        if (!this._game.endScheduled) {
            return;
        }

        clearTimeout(this._game.endTimeout);
        this._game.endScheduled = false;
        this._game.endTimeout = undefined;
    }

    cancelRoundStart() {
        if (!this._round.startScheduled) {
            return;
        }

        clearTimeout(this._round.startTimeout);
        this._round.startScheduled = false;
        this._round.startTimeout = undefined;
    }

    cancelRoundEnd() {
        if (!this._round.endScheduled) {
            return;
        }

        clearTimeout(this._round.endTimeout);
        this._round.endScheduled = false;
        this._round.endTimeout = undefined;
    }

    isGameStarted() {
        return this._game.started;
    }

    isGameStarting() {
        return this._game.startScheduled;
    }

    isGameEnding() {
        return this._game.endScheduled;
    }

    isRoundStarted() {
        return this._round.started;
    }
}

module.exports = GameScheduler;
