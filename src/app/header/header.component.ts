import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataStorageService} from '../shared/data-storage.service';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import {map} from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuthenticated = false;
  userSubscription: Subscription;

  constructor(private dataStorageService: DataStorageService, private authService: AuthService, private store: Store<fromApp.AppState>) {}

  ngOnInit() {

    // New Store Method
    this.store.select('auth').pipe(
      map( authState => {
        return authState.user;
      })
    ).subscribe( user => {
      this.isAuthenticated = !!user;
    });

    // Old Service Method
    // this.userSubscription = this.authService.user.subscribe( user => {
    //   this.isAuthenticated = !!user;
    // });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {

    // Call the Logout Action in our Store, Providing No Payload
    this.store.dispatch(new AuthActions.Logout());

  }

}
