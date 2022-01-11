import { Component, NgZone, OnInit } from '@angular/core';
import { warGame } from './war-game';

@Component({
  selector: 'app-war-game',
  templateUrl: './war-game.component.html',
  styleUrls: ['./war-game.component.css']
})
export class WarGameComponent implements OnInit {
  COUNTER: number = 0;
  readonly ALERT_GOOD: string = 'alert-success';
  readonly ALERT_INFO: 'alert-info';
  readonly ALERT_BAD: 'alert-danger';
  private _zone: NgZone;
  
  time: number;

  constructor(zone: NgZone) {
      this._zone = zone;
  }

  ngOnInit(): void {
    this.time = warGame.game.getTime();
  }
}
