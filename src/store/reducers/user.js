const userReducer = (state = "",action) =>
{
    switch (action.type) {
        case 'SET_USERNAME':
            state = action.payload;
            return state;
        case 'GET_USERNAME':
            return state;
        default:
            return state;

    }
}

export default userReducer;
