import {UserModel} from '../user.model';
import * as fromAuthActions from './auth.actions';

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

  // Determine Return Value Based Upon Action
  switch (action.type) {

    // If We Sent an HTTP Request to Login
    case fromAuthActions.LOGIN_REQUEST:

      // Keep the current State
      // Set Loading to True Since Waiting on Async Task
      // Clear Any Error We Might Have
      return {
        ...state,
        loading: true,
        authError: null
      };

    // If We Sent an HTTP Request to Sign Up
    case fromAuthActions.SIGN_UP_REQUEST:

      // Keep the current State
      // Set Loading to True Since Waiting on Async Task
      // Clear Any Error We Might Have
      return {
        ...state,
        loading: true,
        authError: null
      };

    // Logout the User
    case fromAuthActions.LOGOUT:

      // Keep the current State
      // Delete User Object from State
      // Clear Any Error We Might Have
      return {
        ...state,
        user: null,
        authError: null
      };

    // If We Received a Successful HTTP Response
    case fromAuthActions.AUTHENTICATE_SUCCESS:

      // Construct the User from the Payload Data
      const user = new UserModel(
        action.payload.email,
        action.payload.userId,
        action.payload.token,
        action.payload.expirationDate
      );

      // Keep the current State
      // Clear Any Error We Might Have
      // Async Task Finished so Loading is Complete
      // Store the User We Received
      return {
        ...state,
        authError: null,
        loading: false,
        user
      };

    // If We Received an Error HTTP Response
    case fromAuthActions.AUTHENTICATE_FAILURE:

      // Keep the current State
      // Delete User Object from State (Should be null anyway)
      // Async Task Finished so Loading is Complete
      // Store the Error We Received
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
