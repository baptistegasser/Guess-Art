export const resetRoomInfos = () => {
    return {
        type: 'RESET_INFOS'
    };
}

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

export const setPlayerScore = (username, score) => {
    return {
        type: 'SET_PLAYER_SCORE',
        username: username,
        score: score
    };
}

export const resetPlayersScores = () => {
    return {
        type: 'RESET_PLAYERS_SCORES'
    };
}

export const setTool = (toolType) => {
    return {
        type: 'SET_TOOL_TYPE',
        toolType: toolType
    };
}

export const setWidth = (width) => {
    return {
        type: 'SET_TOOL_WIDTH',
        width: width
    };
}

export const setColor = (color) => {
    return {
        type: 'SET_TOOL_COLOR',
        color: color
    };
}
