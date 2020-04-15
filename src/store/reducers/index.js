import { combineReducers } from 'redux';
import loggedReducer from './isLogged';
import userReducer from './user';

// Combine all the reducers into one, which will be the root reducer
const rootReducer = combineReducers({
    isLogged: loggedReducer,
    user: userReducer
})

export default rootReducer;
