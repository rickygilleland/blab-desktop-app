import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router'
import createRootReducer from '../reducers';
import axios from 'axios';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk.withExtraArgument(axios), router);

function configureStore(initialState) {
    return createStore(rootReducer, initialState, enhancer);
}

export { configureStore, history };