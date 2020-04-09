import { combineReducers } from 'redux';
import loggedReducer from './isLogged';

// Combine all the reducers into one, which will be the root reducer
const rootReducer = combineReducers({
    isLogged: loggedReducer
})

export default rootReducer;
