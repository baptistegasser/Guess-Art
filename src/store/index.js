import { createStore, combineReducers } from 'redux'
import { infos } from './reducers'

const rootReducer = combineReducers({
    infos
})

export default createStore(rootReducer)