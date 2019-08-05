import {Component, OnDestroy, OnInit} from '@angular/core';


import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import {map} from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuthenticated = false;
  subscription: Subscription;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {

    // New Store Method
    this.subscription = this.store.select('auth').pipe(
      map( authState => {
        return authState.user;
      })
    ).subscribe( user => {
      this.isAuthenticated = !!user;
    });

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSaveData() {
    this.store.dispatch( new RecipeActions.StoreRecipes() );
  }

  onFetchData() {
    this.store.dispatch( new RecipeActions.FetchRecipes() );
  }

  onLogout() {

    // Call the Logout Action in our Store, Providing No Payload
    this.store.dispatch(new AuthActions.Logout());

  }

}
