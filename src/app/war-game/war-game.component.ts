import { AfterViewChecked, Component, NgZone, OnInit } from '@angular/core';
import { ViewManager } from './ui/view-manager';
import { TeamManager } from './teams/team-manager';
import { PhaseManager } from './phases/phase-manager';
import { PlayerManager } from './players/player-manager';
import { BattleManager } from './battles/battle-manager';

@Component({
  selector: 'app-war-game',
  templateUrl: './war-game.component.html',
  styleUrls: ['./war-game.component.css']
})
export class WarGameComponent implements OnInit, AfterViewChecked {
  COUNTER: number = 0;
  readonly ALERT_GOOD: string = 'alert-success';
  readonly ALERT_INFO: 'alert-info';
  readonly ALERT_BAD: 'alert-danger';
  private _playfield: HTMLCanvasElement;
  private _viewMgr: ViewManager;
  private _teamMgr: TeamManager;
  private _playerMgr: PlayerManager;
  private _phaseMgr: PhaseManager;
  private _battleMgr: BattleManager;
  private _zone: NgZone;

  constructor(zone: NgZone) {
      this._zone = zone;
  }

  ngOnInit(): void {
    this._playfield = document.querySelector<HTMLCanvasElement>('#playfield');
    this._viewMgr = ViewManager.inst;
    this._viewMgr.init(this._playfield);
    this._teamMgr = TeamManager.inst;
    this._playerMgr = PlayerManager.inst;
    this._phaseMgr = PhaseManager.inst;
    this._battleMgr = BattleManager.inst;
  }

  ngAfterViewChecked(): void {
    this.refreshLayout();
  }

  refreshLayout(): void {
    this._zone.runOutsideAngular(() => {
      setTimeout(() => {
        this._viewMgr.render();
      }, 200);
    });
  }
}
