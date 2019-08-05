import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Recipe} from '../recipes/recipe.model';
import {RecipeService} from '../recipes/recipe.service';
import {exhaustMap, map, take, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';
import { Store } from '@ngrx/store';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
    private store: Store<fromApp.AppState>
    ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();

    this.http
      .put('https://atcg-course-project.firebaseio.com/recipes.json', recipes)
      .subscribe( response => {
        console.log(response);
      });

  }

  fetchRecipes() {

    return this.http.get<Recipe[]>(
      'https://atcg-course-project.firebaseio.com/recipes.json'
    ).pipe(
      map( (recipes) => {
        return recipes.map( recipe => {
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] };
        });
      }),
      tap( (recipes) => {
        // this.recipeService.setRecipes(recipes);
        this.store.dispatch( new RecipesActions.SetRecipes( recipes ) );
      })
    );

  }

}
