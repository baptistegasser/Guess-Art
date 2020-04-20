const toolOptionReducer = (state = {
    tool: "",
    width: 0,
    color: 'rgb(255, 255, 255)'
}, action) => {

    switch (action.type) {
    case 'SET_TOOL':
        return {
            ...state,
            tool: action.tool
        };
    case 'SET_WIDTH':
        return {
            ...state,
            width: action.width
        };
    case 'SET_COLOR':
        return {
            ...state,
            color: state.color
        };

        default:
            return state;
    }
}

export default toolOptionReducer;
