export const TYPES = {
    SET_LOGGED: 'SET_LOGGED',
    SET_USERNAME: 'SET_USERNAME'
}
  
export const actions = {
    setLogged: (logged) => ({ type: TYPES.SET_LOGGED, logged }),
    setUsername: (username) => ({ type: TYPES.SET_USERNAME, username })
}