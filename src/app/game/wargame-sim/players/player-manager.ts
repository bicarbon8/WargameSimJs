import { IPlayer } from "./i-player";
import { PlayerStatusEffect } from "./player-status-effect";

export class PlayerManager {
    private readonly _players: IPlayer[]

    constructor() {
        this._players = [];
    }

    get players(): IPlayer[] {
        return this._players;
    }

    addPlayers(...players: IPlayer[]) {
        if (players) {
            for (var i = 0; i < players.length; i++) {
                let p: IPlayer = players[i];
                if (!this.getPlayerById(p.id)) {
                    this._players.push(p);
                }
            }
        }
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let players: IPlayer[] = this.players;
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                let effect: PlayerStatusEffect = effects[i];
                players = players.filter((player: IPlayer) => {
                    let pEffects: PlayerStatusEffect[] = player.getEffects();
                    if (pEffects.includes(effect)) {
                        return true;
                    }
                });
            }
        }
        return players;
    }

    getPlayerById(id: number): IPlayer {
        let players: IPlayer[] = this.players.filter((player: IPlayer) => {
            if (player.id === id) { return true; }
        });
        return (players?.length) ? players[0] : null;
    }

    getPlayerAt(tileX: number, tileY: number): IPlayer {
        let players: IPlayer[] = this.players.filter((player: IPlayer) => {
            if (player.tileX === tileX && player.tileY === tileY) return true;
        });
        return (players?.length) ? players[0] : null;
    }

    areAllies(...players: IPlayer[]): boolean {
        if (players) {
            for (var i = 0; i < players.length - 1; i++) {
                let teamAId: number = players[i].getTeamId();
                let teamBId: number = players[i + 1].getTeamId();
                if (teamAId != teamBId) {
                    return false;
                }
            }
        }
        return true;
    }

    areEnemies(...players: IPlayer[]): boolean {
        return !this.areAllies(...players);
    }
}