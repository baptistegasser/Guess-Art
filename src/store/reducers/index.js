import { combineReducers } from 'redux';
import loggedReducer from './isLogged';
import userReducer from './user';
import RoomInfoReducer from './room';

// Combine all the reducers into one, which will be the root reducer
const rootReducer = combineReducers({
    isLogged: loggedReducer,
    user: userReducer,
    roomInfo: RoomInfoReducer
})

export default rootReducer;
