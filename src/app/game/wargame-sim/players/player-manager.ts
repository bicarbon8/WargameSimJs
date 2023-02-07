import { WarGame } from "../war-game";
import { IPlayer } from "./i-player";
import { Player } from "./player";
import { PlayerOptions } from "./player-options";
import { PlayerStatusEffect } from "./player-status-effect";

export class PlayerManager {
    private readonly _players: Map<string, IPlayer>

    constructor() {
        this._players = new Map<string, IPlayer>();
    }

    get players(): IPlayer[] {
        return Array.from(this._players.values());
    }

    addPlayer(options: PlayerOptions): IPlayer {
        let player: IPlayer;
        if (options) {
            options.playerManager = options.playerManager || this;
            player = new Player(options);
            this._players.set(player.id, player);
            WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_ADDED, player);
        }
        return player;
    }

    removePlayer(player: IPlayer, destroy?: boolean): IPlayer {
        let removed: IPlayer;
        if (player) {
            removed = this.getPlayerById(player.id);
            if (removed) {
                this._players.delete(removed.id);
                WarGame.evtMgr.notify(WarGame.EVENTS.PLAYER_REMOVED, removed);
                if (destroy) {
                    removed.destroy();
                }
            }
        }
        return removed;
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

    getPlayerById(id: string): IPlayer {
        return this._players.get(id);
    }

    getPlayerAt(tileX: number, tileY: number): IPlayer {
        let players: IPlayer[] = this.players.filter((player: IPlayer) => {
            if (player.tileX === tileX && player.tileY === tileY) return true;
        });
        return (players?.length) ? players[0] : null;
    }

    areAllies(...players: IPlayer[]): boolean {
        if (players?.length) {
            for (var i = 0; i < players.length - 1; i++) {
                let teamAId: string = players[i]?.teamId;
                let teamBId: string = players[i + 1]?.teamId;
                if (teamAId !== teamBId) {
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