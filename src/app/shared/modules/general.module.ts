import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  exports: [CommonModule, RouterModule, HttpClientModule, FormsModule]
})
export class GeneralModule {}
