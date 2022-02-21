import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { WarGame } from './wargame-sim/war-game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  private _zone: NgZone;
  
  constructor(zone: NgZone) {
      this._zone = zone;
  }

  ngOnInit(): void {
      WarGame.start();
  }

  ngOnDestroy(): void {
      WarGame.stop();
  }
}
