import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DivisionRoutingModule } from './division-routing.module';
import { DivisionEditComponent } from './division-edit/division-edit.component';
import { DivisionListComponent } from './division-list/division-list.component';
import { DivisionComponent } from './division.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DivisionComponent,
    DivisionEditComponent,
    DivisionListComponent
  ],
  imports: [
    CommonModule,
    DivisionRoutingModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [DivisionComponent, DivisionEditComponent, DivisionListComponent]
})
export class DivisionModule {}
