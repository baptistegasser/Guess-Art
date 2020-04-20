export const setBoss = (username) => {
    return {
        type: 'SET_BOSS',
        username: username
    }
}

export const setIsBoss = (isBoss) => {
    return {
        type: 'SET_IS_BOSS',
        isBoss: isBoss
    }
}

export const addPlayer = (player) => {
    return {
        type: 'ADD_PLAYER',
        player: player
    }
}

export const removePlayer = (player) => {
    return {
        type: 'REMOVE_PLAYER',
        player: player
    }
}
