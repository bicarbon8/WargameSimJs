import { IPlayer } from "./i-player";
import { PlayerStatusEffect } from "./player-status-effect";

export class PlayerManager {
    private _players: Map<number, IPlayer>;
    private _active: Map<number, IPlayer>;
    private _dead: Map<number, IPlayer>;

    constructor() {
        this._players = new Map<number, IPlayer>();
        this._active = new Map<number, IPlayer>();
        this._dead = new Map<number, IPlayer>();
    }

    addPlayers(...players: IPlayer[]) {
        if (players) {
            for (var i=0; i<players.length; i++) {
                let p: IPlayer = players[i];
                this._players.set(p.id, p);
                if (players[i].isDead()) {
                    this._dead.set(p.id, p);
                } else {
                    this._active.set(p.id, p);
                }
            }
        }
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let players: IPlayer[] = [];
        if (effects) {

        } else {
            players = Array.from(this._players.values());
        }
        return players;
    }

    getPlayerById(id: number): IPlayer {
        return this._players.get(id);
    }
    
    areAllies(...players: IPlayer[]): boolean {
        if (players) {
            for (var i=0; i<players.length-1; i++) {
                let teamAId: number = players[i].getTeamId();
                let teamBId: number = players[i+1].getTeamId();
                if (teamAId != teamBId) {
                    return false;
                }
            }
        }
        return true;
    }
}

export module PlayerManager {
    export var inst: PlayerManager = new PlayerManager();
}
