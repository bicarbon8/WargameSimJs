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

    addPlayer(player: IPlayer): boolean {
        if (player) {
            if (!this.getPlayerById(player.id)) {
                this._players.push(player);
                return true;
            }
        }
        return false;
    }

    removePlayer(player: IPlayer): boolean {
        if (player) {
            const index: number = this._players.findIndex((p: IPlayer) => p.id === player.id);
            if (index !== -1) {
                this._players.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let players: IPlayer[] = this.players;
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                let effect: PlayerStatusEffect = effects[i];
                players = players.filter((player: IPlayer) => {
                    let pEffects: PlayerStatusEffect[] = player.statusEffects;
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
                let teamAId: number = players[i].teamId;
                let teamBId: number = players[i + 1].teamId;
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