import {UserModel} from '../user.model';
import * as fromAuthActions from './auth.actions';
import {AuthActions} from './auth.actions';

export interface State {
  user: UserModel;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false
};

export function authReducer( state = initialState, action: fromAuthActions.AuthActions ) {

  switch (action.type) {
    case fromAuthActions.AUTHENTICATE_SUCCESS:
      const user = new UserModel(
        action.payload.email,
        action.payload.userId,
        action.payload.token,
        action.payload.expirationDate
      );
      return {
        ...state,
        authError: null,
        loading: false,
        user
      };
    case fromAuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        authError: null
      };
    case fromAuthActions.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        authError: null
      };
    case fromAuthActions.AUTHENTICATE_FAILURE:
      return {
        ...state,
        user: null,
        loading: false,
        authError: action.payload
      };
    default:
      return state;
  }

}
