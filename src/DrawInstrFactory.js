class DrawInstrFactory {
    static newInstrTrash() {
        return this._newInstr(DrawInstrFactory.types.trash);
    }

    static newInstr(type, pos, color, width) {
        return this._newInstr(type, {
            pos: pos,
            color: color,
            width: width
        });
    }

    static _newInstr(type, options) {
        this._assertInstrType(type);

        return {
            type: type,
            options: options
        };
    }

    static _assertInstrType(type) {
        for (let [key, val] of Object.entries(DrawInstrFactory.types)) {
            if (val === type) return;
        }
        throw new TypeError(`'${type}' is not a valid DrawInstr type.`);
    }
}

DrawInstrFactory.types = Object.freeze({
    trash: 'TRASH',
    bucket: 'BUCKET',
    eraser: 'ERASER',
    pencil: 'PENCIL'
});

export default DrawInstrFactory
