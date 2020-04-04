import { Action } from 'redux';
import { GET_USER_DETAILS_SUCCESS, GET_USER_DETAILS_FAILURE } from '../actions/user';

const initialState = {
}

export default function user(state = initialState, action = {}) {
    var updatedState = {};
    switch (action.type) {
        case GET_USER_DETAILS_SUCCESS:
            updatedState = action.payload.data
            break;
        case GET_USER_DETAILS_FAILURE:
            break;
        default:
            //do nothing
            return state;
    }
    const newState = Object.assign({}, state, updatedState);
    return newState;
};