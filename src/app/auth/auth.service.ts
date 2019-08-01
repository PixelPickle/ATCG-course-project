import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserModel} from './user.model';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Injectable({providedIn: 'root'})
export class AuthService {

  private tokenTimeout: any;

  constructor(private http: HttpClient, private router: Router, private store: Store<fromApp.AppState>) {}

  public autoLogin() {

    // Pull 'userData' from Local Storage
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Check if 'userData' Contains Anything
    if (!userData) {

      // Quit if 'userData' Doesn't Contain Data
      return ;

    }

    // Since 'userData' Does Contain Data, Create a User Account
    const loadedUser = new UserModel( userData.email, userData.id, userData.tokenData, new Date( userData.tokenExpirationDate ) );

    // Validate that the Token is Still Active
    if (loadedUser.token) {

      // Call the Authentication Success Action in our Store, Providing a Payload of User Information
      this.store.dispatch(new AuthActions.AuthenticateSuccess({
        email: loadedUser.email,
        userId: loadedUser.id,
        token: loadedUser.token,
        expirationDate: new Date( userData.tokenExpirationDate )
      }) );

      // Calculate Duration Before Token will Expire
      const expirationDuration = new Date( userData.tokenExpirationDate).getTime() - new Date().getTime();

      // Pass this Duration to Auto Logout to Create a Timer
      this.autoLogout( expirationDuration );
    }

  }

  public logout() {

    // Call the Logout Action in our Store, Providing No Payload
    this.store.dispatch(new AuthActions.Logout());

    // If We Have an Existing Timeout
    if (this.tokenTimeout) {

      // Clear our Timeout so We Don't Call Logout When We Aren't Logged In
      clearTimeout(this.tokenTimeout);

    }

    // Delete the Reference to Our Timeout, Since No Longer Needed
    this.tokenTimeout = null;

    // Remove the User Data from our Local Storage, Otherwise we would Auto-login again
    localStorage.removeItem('userData');

    // Navigate to our "Auth" Page
    // .then(null) Tells IntelliJ that We Do Handle the Returned Promise
    this.router.navigate(['/auth']).then(null);

  }

  public autoLogout( expirationDuration: number ) {

    // Store a New Timeout Timer
    this.tokenTimeout = setTimeout( () => {

      // When the Timeout is Reached, Call the Logout Function
      this.logout();

    // Provide the Given Duration to the Timeout Constructor
    }, expirationDuration );

  }

}
