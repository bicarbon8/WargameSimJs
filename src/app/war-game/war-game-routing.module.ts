import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarGameComponent } from './war-game.component';

const routes: Routes = [
  {path: '', component: WarGameComponent},
  {path: 'war-game', component: WarGameComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarGameRoutingModule { }
