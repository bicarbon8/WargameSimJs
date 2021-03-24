import { PlayerManager } from "../players/player-manager";

export class BattleManager {
    private _playerMgr: PlayerManager;

    constructor(playerMgr?: PlayerManager) {
        this._playerMgr = playerMgr || PlayerManager.inst;
    }
}

export module BattleManager {
    export var inst = new BattleManager();
}