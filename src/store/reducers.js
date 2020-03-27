import { TYPES } from './actions'

const init_state = {
    infos: {
        logged: false,
        username: undefined
    }
}

export const infos = (infos = init_state.infos, action) => {
    switch (action.type) {
        case TYPES.SET_LOGGED:
                return Object.assign({}, infos, { logged: action.logged });
            case TYPES.SET_USERNAME:
                return Object.assign({}, infos, { username: action.username });
        default:
            return infos;
    }
}