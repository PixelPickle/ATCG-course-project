import { Component, OnInit } from '@angular/core';
import {Recipe} from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [
    new Recipe('Test Name A', 'Test Description A', 'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG'),
    new Recipe('Test Name B', 'Test Description B', 'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG'),
    new Recipe('Test Name C', 'Test Description C', 'https://upload.wikimedia.org/wikipedia/commons/5/57/Chicken_fettuccine_alfredo.JPG')
  ];

  constructor() { }

  ngOnInit() {
  }

}
