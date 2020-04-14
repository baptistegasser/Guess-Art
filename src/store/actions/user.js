export const getUsername = () =>
{
    return{
        type: 'GET_USERNAME'
    }
}

export const setUsername = (username) =>
{
    return{
        type: 'SET_USERNAME',
        payload : username
    }
}
