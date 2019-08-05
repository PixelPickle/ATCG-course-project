import {Component, OnDestroy, OnInit} from '@angular/core';
import {Recipe} from '../recipe.model';
import {Subscription} from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[];
  subscription: Subscription;

  constructor(
    private store: Store<fromApp.AppState>
    ) { }

  ngOnInit() {

    this.subscription = this.store
    .select('recipes')
    .pipe( map( recipesState => recipesState.recipes ) )
    .subscribe( (recipes: Recipe[]) => { this.recipes = recipes; } );

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
