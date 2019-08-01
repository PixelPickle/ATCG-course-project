import {Ingredient} from '../../shared/ingredient.model';

import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIndex: number;
}

const initialState: State = {
  ingredients: [
    new Ingredient('Steak', 1),
    new Ingredient('Salt', .3),
    new Ingredient('Pepper', .5)
  ],
  editedIngredient: null,
  editedIndex: -1
};

export function shoppingListReducer( state: State = initialState, action: ShoppingListActions.ShoppingListActions ) {

  switch (action.type) {

    case ShoppingListActions.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };

    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload]
      };

    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = {
        ...state.ingredients[state.editedIndex],
        ...action.payload
      };

      const ingredients = [...state.ingredients];
      ingredients[state.editedIndex] = ingredient;

      return {
        ...state,
        editedIndex: -1,
        editedIngredient: null,
        ingredients: [...ingredients]
      };

    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        editedIndex: -1,
        editedIngredient: null,
        ingredients: state.ingredients.filter( (item, index) => {
          return index !== state.editedIndex;
        } )
      };

    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIndex: action.payload,
        editedIngredient: {...state.ingredients[action.payload]}
      };

    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null,
        editedIndex: -1
      };

    default:
      return state;
  }

}
