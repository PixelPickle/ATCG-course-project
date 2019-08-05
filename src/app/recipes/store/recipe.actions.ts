import { Action } from '@ngrx/store';
import { Recipe } from '../recipe.model';

export const SET_RECIPES = '[Recipes] SET_RECIPES';
export const FETCH_RECIPES = '[Recipes] FETCH_RECIPES';
export const ADD_RECIPE = '[Recipes] ADD_RECIPE';
export const UPDATE_RECIPE = '[Recipes] UPDATE_RECIPE';
export const DELETE_RECIPE = '[Recipes] DELETE_RECIPE';
export const STORE_RECIPES = '[Recipes] STORE_RECIPES';
// export const  = '[Recipes] ';

export class SetRecipes implements Action {
  readonly type = SET_RECIPES;
  // Payload is Array of Recipes
  constructor( public payload: Recipe[]) {}
}

export class FetchRecipes implements Action {
  readonly type = FETCH_RECIPES;
  // No Payload Needed
}

export class StoreRecipes implements Action {
  readonly type = STORE_RECIPES;
  // No Payload, Since Recipes to Store are in State
}

export class AddRecipe implements Action {
  readonly type = ADD_RECIPE;
  // Payload is a Single Recipe to Add
  constructor( public payload: Recipe ) {}
}

export class UpdateRecipe implements Action {
  readonly type = UPDATE_RECIPE;
  // Payload contains the index of the recipe to update and the new recipe data
  constructor( public payload: { index: number, recipe: Recipe }) {}
}

export class DeleteRecipe implements Action {
  readonly type = DELETE_RECIPE;
  // Payload is the Index of Recipe to Delete
  constructor( public payload: number) {}
}

export type RecipesAction =
  | SetRecipes
  | FetchRecipes
  | UpdateRecipe
  | AddRecipe
  | DeleteRecipe
  | StoreRecipes;
