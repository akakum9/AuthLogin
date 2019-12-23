import { RESET_CURRENT_USER } from '../actions/types';
import isEmpty from '../validation/is-empty';

const initialState = {
    emailThere: false,
    user: {}
}

export default function(state = initialState, action ) {
    switch(action.type) {
        case RESET_CURRENT_USER:
            return {
                ...state,
                emailThere: !isEmpty(action.payload),
                user: action.payload
            }
        default: 
            return state;
    }
}