import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() tabSelected = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onSelect(selected: string) {
    this.tabSelected.emit(selected);
  }

}
