import {Recipe} from './recipe.model';
import {EventEmitter, Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
  recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    new Recipe(
      'Test Name A',
      'Test Description A',
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG',
      [
        new Ingredient('Chicken', 1),
        new Ingredient('Fettuccine', 20)
      ] ),
    new Recipe(
      'Test Name B',
      'Test Description B',
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG',
      [
        new Ingredient('Duck', 2),
        new Ingredient('Mancini', 40)
      ] ),
    new Recipe(
      'Test Name C',
      'Test Description C',
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG',
      [
        new Ingredient('Steak', 3),
        new Ingredient('Broccoli', 4)
      ])
  ];

  constructor( private shoppingListService: ShoppingListService ) {}

  getRecipes() {
    return this.recipes.slice();
  }

  addToShoppingList( ingredients: Ingredient[] ) {
    this.shoppingListService.addIngredients(ingredients);
  }

}
