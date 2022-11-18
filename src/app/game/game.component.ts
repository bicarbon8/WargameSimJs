import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { WarGame } from './wargame-sim/war-game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    WarGame.resize();
  }
  
  constructor(private _zone: NgZone) { }

  ngOnInit(): void {
      this._zone.runOutsideAngular(() => {
          WarGame.start();
      });
  }

  ngOnDestroy(): void {
      WarGame.stop();
  }
}
