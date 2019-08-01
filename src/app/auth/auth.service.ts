import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Subject, BehaviorSubject, throwError} from 'rxjs';
import {UserModel} from './user.model';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  // public user = new BehaviorSubject<UserModel>(null);

  private tokenTimeout: any;

  private APIKey = 'AIzaSyDus228-Tvbt2aOgX1Sc4PyxparFuMPLSQ';

  constructor(private http: HttpClient, private router: Router, private store: Store<fromApp.AppState>) {}

  public signup( email: string, password: string) {

    return this.http.post<AuthResponseData>( 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + this.APIKey, {
      email,
      password,
      returnSecureToken: true
    } ).pipe(catchError(this.handleError), tap( responseData => {
      this.handleUser(responseData.email, responseData.localId, responseData.idToken, responseData.expiresIn);
    } ) );

  }

  public login( email: string, password: string) {

    return this.http.post<AuthResponseData>( 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + this.APIKey, {
      email,
      password,
      returnSecureToken: true
    } ).pipe(catchError(this.handleError), tap( responseData => {
      this.handleUser(responseData.email, responseData.localId, responseData.idToken, responseData.expiresIn);
    } ));

  }

  public autologin() {

    // Pull 'userData' from Local Storage
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Quit if 'userData' Didn't Contain Anything
    if (!userData) {
      return ;
    }

    // Since 'userData' Contained Data, Create a User Account
    const loadedUser = new UserModel( userData.email, userData.id, userData.tokenData, new Date( userData.tokenExpirationDate ) );

    // Validate that the Token is Still Active
    if (loadedUser.token) {
      // TODO: Replace with Store
      // this.user.next(loadedUser);
      this.store.dispatch(new AuthActions.AuthenticateSuccess({
        email: loadedUser.email,
        userId: loadedUser.id,
        token: loadedUser.token,
        expirationDate: new Date( userData.tokenExpirationDate )
      }) );
      const expirationDuration = new Date( userData.tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout( expirationDuration );
    }

  }

  public logout() {
    // TODO: Replace with Store
    // this.user.next(null);
    this.store.dispatch(new AuthActions.Logout());

    if (this.tokenTimeout) {
      clearTimeout(this.tokenTimeout);
    }
    this.tokenTimeout = null;
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);
  }

  autoLogout( expirationDuration: number ) {
    this.tokenTimeout = setTimeout( () => {
      this.logout();
    }, expirationDuration );
  }

  private handleUser(email: string, userId: string, token: string, expiresIn: string) {
    const expirationDate = new Date(Date.now() + (+expiresIn * 1000) );
    const user = new UserModel(email, userId, token, expirationDate);
    this.autoLogout( (+expiresIn * 1000) );
    // TODO: Replace with Store
    // this.user.next(user);
    this.store.dispatch(new AuthActions.AuthenticateSuccess({
      email,
      userId,
      token,
      expirationDate
    }) );
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorResponse: HttpErrorResponse) {

    let errorMessage = 'An unknown error occurred.';

    if ( !errorResponse.error || !errorResponse.error.error ) {
      return throwError(errorMessage);
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

    return throwError(errorMessage);
  }
}
