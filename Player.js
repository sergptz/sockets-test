module.exports = class Player {
    constructor(name = '', socket) {
        if (!name) throw new Error('Name required!')

        this.name = name
        this.socket = socket
        this.token = (new Date()).toISOString() + name
        this.opponent = null
    }

    get isPlaying() {
        return !!this.opponent
    }

    setOpponent(player) {
        this.opponent = player
    }
}