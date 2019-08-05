import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UserModel} from '../user.model';
import { AuthService } from '../auth.service';

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

  // Construct User Object
  const user = new UserModel( email, userId, token, expirationDate);

  // Save User to Local Storage
  localStorage.setItem('userData', JSON.stringify(user) );

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
    private router: Router,
    private authService: AuthService
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

        // Execute This Without Affecting the Observable
        tap( responseData => {

          // Provide the Auto Logout Timer a Duration in Milliseconds
          this.authService.setLogoutTimer( +responseData.expiresIn * 1000 );

        } ),

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

        // Execute This Without Affecting the Observable
        tap( responseData => {

          // Provide the Auto Logout Timer a Duration in Milliseconds
          this.authService.setLogoutTimer( +responseData.expiresIn * 1000 );

        } ),

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
  authRedirect = this.actions$.pipe(

    // Filter to Only Authenticate Success Actions
    ofType(AuthActions.AUTHENTICATE_SUCCESS),

    // Execute This Without Affecting the Observable
    tap( () => {

      // Navigate to our "Home" Page (Which is Recipes)
      // .then(null) Tells IntelliJ that We Do Handle the Returned Promise
      this.router.navigate( ['/'] ).then(null);

    } )
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(

    // Filter to Only Logout Actions
    ofType(AuthActions.LOGOUT),

    // Execute This Without Affecting the Observable
    tap( () => {

      // Clear the Auto Logout Timer
      this.authService.clearLogoutTimer();

      // Remove the stored User Data from Local Storage
      localStorage.removeItem('userData');

      // Navigate to our "Home" Page (Which is Recipes)
      // .then(null) Tells IntelliJ that We Do Handle the Returned Promise
      this.router.navigate( ['/auth'] ).then(null);

    } )

  );

  @Effect()
  authAutoLogin = this.actions$.pipe(

    // Filter to Only Auto Login Actions
    ofType(AuthActions.AUTO_LOGIN),

    // Do Something
    map( () => {

      // Pull 'userData' from Local Storage
      const userData = JSON.parse(localStorage.getItem('userData'));

      // Check if 'userData' Contains Anything
      if (!userData) {

        // Quit if 'userData' Doesn't Contain Data
        return { type: 'GENERIC' };

      }

      // Since 'userData' Does Contain Data, Create a User Account
      const loadedUser = new UserModel( userData.email, userData.id, userData.tokenData, new Date( userData.tokenExpirationDate ) );

      // Validate that the Token is Still Active
      if (loadedUser.token) {

        // Calculate Duration Before Token will Expire
        const expirationDuration = new Date( userData.tokenExpirationDate).getTime() - new Date().getTime();

        // Provide the Auto Logout Timer a Duration in Milliseconds
        this.authService.setLogoutTimer( expirationDuration );

        // Return the Authentication Success Action, Providing a Payload of User Information
        return (new AuthActions.AuthenticateSuccess({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: new Date( userData.tokenExpirationDate )
        }) );

      }

      // Token Wasn't Valid
      return { type: 'GENERIC' };

    } )

  );

}
