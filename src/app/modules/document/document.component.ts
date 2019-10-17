import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {
  showSidebar = true;

  constructor() {}

  ngOnInit() {}

  public onOpenSidebar(event) {
    console.log('Open SideBar');
    this.showSidebar = !this.showSidebar;
  }
  public onCloseSidebar(event) {
    this.showSidebar = !this.showSidebar;
  }
}
