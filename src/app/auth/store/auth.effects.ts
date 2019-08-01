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
  const expirationDate = new Date(Date.now() + (expiresIn * 1000) );
  return new AuthActions.AuthenticateSuccess( {
    email,
    userId,
    token,
    expirationDate
  } );
};

const handleError = ( errorResponse: any ) => {
  let errorMessage = 'An unknown error occurred.';

  if ( !errorResponse.error || !errorResponse.error.error ) {
    // Return Generic Response
    return of( new AuthActions.AuthenticateFailure(errorMessage) );
  }

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

  // Return Clarified Response
  return of( new AuthActions.AuthenticateFailure(errorMessage) );
};

@Injectable()
export class AuthEffects {

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_REQUEST),
    switchMap( (authData: AuthActions.LoginRequest) => {

      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        map( responseData => {
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
        }),
        catchError( errorResponse => {
          // Crucial to NOT return an error type observable
          return handleError(errorResponse);
        } )
      );

    } )
  );

  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap( () => {
      this.router.navigate( ['/'] );
    } )
  );

  @Effect()
  authSignUp = this.actions$.pipe(
    ofType(AuthActions.SIGN_UP_REQUEST),
    switchMap( (signUpAction: AuthActions.SignUpRequest) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
          email: signUpAction.payload.email,
          password: signUpAction.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        map( responseData => {
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
        }),
        catchError( errorResponse => {
          // Crucial to NOT return an error type observable
          return handleError(errorResponse);
        } )
      );
    } )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router
  ) {}
}
