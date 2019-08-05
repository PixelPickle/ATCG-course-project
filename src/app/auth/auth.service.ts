import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Injectable({providedIn: 'root'})
export class AuthService {

  private tokenTimeout: any;

  constructor(private store: Store<fromApp.AppState>) {}

  public clearLogoutTimer() {

    // If We Have an Existing Timeout
    if (this.tokenTimeout) {

      // Clear our Timeout so We Don't Call Logout When We Aren't Logged In
      clearTimeout(this.tokenTimeout);

    }

    // Delete the Reference to Our Timeout, Since No Longer Needed
    this.tokenTimeout = null;

  }

  public setLogoutTimer( expirationDuration: number ) {

    // Store a New Timeout Timer
    this.tokenTimeout = setTimeout( () => {

      // When the Timeout is Reached, Call the Logout Action
      this.store.dispatch(new AuthActions.Logout());

    // Provide the Given Duration to the Timeout Constructor
    }, expirationDuration );

  }

}
