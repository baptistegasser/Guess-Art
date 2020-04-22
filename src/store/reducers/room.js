const RoomInfoReducer = (state = {
    players: [],
    boss: "",
    isBoss: false,
    tool: {
        type: '',
        width: 0,
        color: 'rgb(255, 255, 255)'
    }
}, action) => {
    const listContainPlayer = player => {
        for(let i = 0, l = state.players.length; i < l; ++i) {
            if (state.players[i].username === player.username) {
                return true;
            }
        }
        return false;
    }

    switch (action.type) {
        case 'SET_BOSS':
            return {
                ...state,
                boss: action.username
            };
        case 'SET_IS_BOSS':
            return {
                ...state,
                isBoss: action.isBoss
            };

        case 'ADD_PLAYER':
            // Return state if the player is IN the list
            if (listContainPlayer(action.player)) {
                return state;
            }
            return {
                ...state,
                players: [...state.players, action.player]
            };
        case 'REMOVE_PLAYER':
            // Return state if the player is NOT IN the list
            if (!listContainPlayer(action.player)) {
                return state;
            }
            // Create a copy of players list, loop throught it and splice to remove the player
            let players = state.players;
            for (let i = 0; i < players.length; i++) {
                if (players[i].username === action.player.username) {
                    players.splice(i, 1);
                    return {
                        ...state,
                        players: players
                    };
                }
            }
            // Normaly netheir reached, fallback is player not found in for loop
            return state;
        case 'SET_PLAYER_SCORE':
            let updatedPlayers = state.players;
            for (let i = 0, l = updatedPlayers.length; i < l; ++i) {
                if (updatedPlayers[i].username === action.username) {
                    updatedPlayers[i].score = action.score;
                    break;
                }
            }
            return {
                ...state,
                players: updatedPlayers
            };

        case 'SET_TOOL_TYPE':
            return {
                ...state,
                tool: {
                    ...state.tool,
                    type: action.toolType
                }
            }
        case 'SET_TOOL_WIDTH':
            return {
                ...state,
                tool: {
                    ...state.tool,
                    width: action.width
                }
            }
        case 'SET_TOOL_COLOR':
            return {
                ...state,
                tool: {
                    ...state.tool,
                    color: action.color
                }
            }

        default:
            return state;
    }
}

export default RoomInfoReducer;
