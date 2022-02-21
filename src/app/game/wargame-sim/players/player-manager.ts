import { IPlayer } from "./i-player";
import { PlayerStatusEffect } from "./player-status-effect";

export module PlayerManager {
    var _players = new Map<number, IPlayer>();
    var _active = new Map<number, IPlayer>();
    var _dead = new Map<number, IPlayer>();

    export function addPlayers(...players: IPlayer[]) {
        if (players) {
            for (var i=0; i<players.length; i++) {
                let p: IPlayer = players[i];
                _players.set(p.id, p);
                if (players[i].isDead()) {
                    _dead.set(p.id, p);
                } else {
                    _active.set(p.id, p);
                }
            }
        }
    }

    export function getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let players: IPlayer[] = [];
        if (effects) {

        } else {
            players = Array.from(_players.values());
        }
        return players;
    }

    export function getPlayerById(id: number): IPlayer {
        return _players.get(id);
    }
    
    export function areAllies(...players: IPlayer[]): boolean {
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