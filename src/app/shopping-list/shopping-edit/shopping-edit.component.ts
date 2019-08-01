import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('f', {static: false}) shoppingListForm: NgForm;

  subscription: Subscription;
  editMode = false;
  editItem: Ingredient;

  constructor(
    private shoppingListService: ShoppingListService,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {

    // New Store Method
    this.subscription = this.store.select('shoppingList').subscribe( stateData => {
      if ( stateData.editedIndex > -1) {
        this.editMode = true;
        this.editItem = stateData.editedIngredient;
        this.shoppingListForm.setValue({
          name: this.editItem.name,
          amount: this.editItem.amount
        });
      } else {
        this.editMode = false;
      }
    } );

    // Old Service Method
    // this.subscription = this.shoppingListService.startedEditing
    //   .subscribe(
    //     (index: number) => {
    //       this.editMode = true;
    //       this.editIndex = index;
    //       this.editItem = this.shoppingListService.getIngredient(index);
    //       this.shoppingListForm.setValue({
    //         name: this.editItem.name,
    //         amount: this.editItem.amount
    //       });
    //     }
    //   );
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    this.store.dispatch(new ShoppingListActions.StopEdit() );
  }

  onAddItem(form: NgForm) {
    const newIngredient = new Ingredient(form.value.name, form.value.amount);

    if (this.editMode) {
      // Old Service Method
      // this.shoppingListService.updateIngredient(this.editIndex, newIngredient);

      // New Store Method
      this.store.dispatch(new ShoppingListActions.UpdateIngredient( newIngredient ));
    } else {
      // Old Service Method
      // this.shoppingListService.addIngredient(newIngredient);

      // New Store Method
      this.store.dispatch(new ShoppingListActions.AddIngredient( newIngredient ));
    }

    form.reset();
    this.editMode = false;

  }

  onClear(form: NgForm) {
    form.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit() );
  }

  onDelete(form: NgForm) {
    if (this.editMode) {
      // Old Service Method
      // this.shoppingListService.deleteIngredient(this.editIndex);

      // New Store Method
      this.store.dispatch(new ShoppingListActions.DeleteIngredient() );
    }
    this.onClear(form);
  }

}
