import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as ShoppingListActions from './store/shopping-list.actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ingredients: Ingredient[]}>;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {

    // Store Methods
    this.ingredients = this.store.select('shoppingList');

    // Old Service Methods
    // this.ingredients = this.shoppingListService.getIngredients();
    // this.subscription = this.shoppingListService.ingredientsUpdated.subscribe( (ingredients: Ingredient[]) => {
    //   this.ingredients = ingredients;
    // });
  }

  ngOnDestroy(): void {
    // Old Service Method
    // this.subscription.unsubscribe();
  }

  onEditItem(index: number) {
    // Old Service Method
    // this.shoppingListService.startedEditing.next(index);

    // New Store Method
    this.store.dispatch( new ShoppingListActions.StartEdit(index) );
  }

}
