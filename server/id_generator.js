class IDGenerator {
    constructor() {
        this._last_id = null;
    }

    getNewID() {
        let new_id;
        while((new_id = (+new Date()).toString(36)) === this._last_id);
        this._last_id = new_id;
        return new_id;
    }
}

const instance = new IDGenerator();
module.exports = instance;
