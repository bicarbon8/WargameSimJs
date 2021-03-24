import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WarGameRoutingModule } from './war-game-routing.module';
import { WarGameComponent } from './war-game.component';


@NgModule({
  declarations: [WarGameComponent],
  imports: [
    CommonModule,
    WarGameRoutingModule
  ]
})
export class WarGameModule { }
