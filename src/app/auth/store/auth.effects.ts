import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (email: string, userId: string, token: string, expiresIn: number) => {

  // Construct our Expiration Date Based on Current Time and the Lifespan of the Token
  const expirationDate = new Date(Date.now() + (expiresIn * 1000) );

  // Return an Authentication Success Action with Our Response Data as a Payload
  return new AuthActions.AuthenticateSuccess( {
    email,
    userId,
    token,
    expirationDate
  } );
};

const handleError = ( errorResponse: any ) => {

  // Initialize Error Message with Generic Statement
  let errorMessage = 'An unknown error occurred.';

  // Ensure Error Response Object is of Proper Format
  if ( !errorResponse.error || !errorResponse.error.error ) {

    // Return Generic Response if Error Response Doesn't Contain an Error Message/Code
    return of( new AuthActions.AuthenticateFailure(errorMessage) );

  }

  // Decode the Error Message We Received. Information Copied Directly from Firebase
  switch (errorResponse.error.error.message) {

    case 'EMAIL_NOT_FOUND':
      errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
      break;

    case 'INVALID_PASSWORD':
      errorMessage = 'The password is invalid or the user does not have a password.';
      break;

    case 'USER_DISABLED':
      errorMessage = 'The user account has been disabled by an administrator.';
      break;

    case 'EMAIL_EXISTS':
      errorMessage = 'The email address is already in use by another account.';
      break;

    case 'OPERATION_NOT_ALLOWED':
      errorMessage = 'Password sign-in is disabled for this project.';
      break;

    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
      break;
  }

  // Return a New Observable Wrapping an Authentication Failure Action containing our
  // Clarified Response (or Generic Response if Provided Error isn't Listed)
  // Since an Error Observable Would Break the Reducer, We Create a New Observable
  return of( new AuthActions.AuthenticateFailure(errorMessage) );

};

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router
  ) {}

  @Effect()
  authLogin = this.actions$.pipe(

    // Filter to Only Login Request Actions
    ofType(AuthActions.LOGIN_REQUEST),

    // Switch From Action Observable to HTTP Request Observable
    switchMap( (authData: AuthActions.LoginRequest) => {

      // Returns the Observable Generated from HTTP Request
      return this.http.post<AuthResponseData>(

        // URL is Provided by Firebase and we append our API Key (Controlled by Environment)
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,

        // Our Data to Post is the Login Credentials
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }

      // Take the HTTP Request Observable and Pipe it Into Here; Converting to Authorization Success or Authorization Failure
      ).pipe(

        // If the Observable IS NOT an error, Map it Into a Authorization Success Action
        map( responseData => {

          // Return the Result of Handle Authentication, which is an Authorization Success Action
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);

        }),

        // If the Observable IS an error, Wrap it Into a Authorization Failure Action
        catchError( errorResponse => {

          // Return the Result of Handle Error, which is an Authorization Failure Action
          return handleError(errorResponse);

        } )

      );

    } )

  );

  @Effect()
  authSignUp = this.actions$.pipe(

    // Filter to Only Sign Up Request Actions
    ofType(AuthActions.SIGN_UP_REQUEST),

    // Switch From Action Observable to HTTP Request Observable
    switchMap( (signUpAction: AuthActions.SignUpRequest) => {

      // Returns the Observable Generated from HTTP Request
      return this.http.post<AuthResponseData>(

        // URL is Provided by Firebase and we append our API Key (Controlled by Environment)
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,

        // Our Data to Post is the Login Credentials
        {
          email: signUpAction.payload.email,
          password: signUpAction.payload.password,
          returnSecureToken: true
        }

      // Take the HTTP Request Observable and Pipe it Into Here; Converting to Authorization Success or Authorization Failure
      ).pipe(

        // If the Observable IS NOT an error, Map it Into a Authorization Success Action
        map( responseData => {

          // Return the Result of Handle Authentication, which is an Authorization Success Action
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);

        }),

        // If the Observable IS an error, Wrap it Into a Authorization Failure Action
        catchError( errorResponse => {

          // Return the Result of Handle Error, which is an Authorization Failure Action
          return handleError(errorResponse);

        } )

      );

    } )

  );

  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(

    // Filter to Only Authenticate Success Actions
    ofType(AuthActions.AUTHENTICATE_SUCCESS),

    // Execute This Without Affecting the Observable
    tap( () => {

      // Navigate to our "Home" Page (Which is Recipes)
      // .then(null) Tells IntelliJ that We Do Handle the Returned Promise
      this.router.navigate( ['/'] ).then(null);

    } )
  );

}
