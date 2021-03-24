import { IPlayer } from "../players/i-player";
import { PlayerManager } from "../players/player-manager";
import { PlayerStatusEffect } from "../players/player-status-effect";
import { Rand } from "../utils/rand";

export class Team {
    readonly id: number;
    private _name: string;
    private _colour: string;
    private _playerMgr: PlayerManager;
    private _originalPoints: number;
    private _remainingPoints: number;
    private _score: number;
    private _priority: number;

    constructor(name: string, colour: string, points: number, playerMgr?: PlayerManager) {
        this.id = Rand.getId();
        this._name = name;
        this._colour = colour;
        this._playerMgr = playerMgr || PlayerManager.inst;
        this._originalPoints = points;
        this._remainingPoints = this._originalPoints;
        this._score = 0;
        this._priority = 0;
    }

    getName(): string {
        return this._name;
    }

    getColour(): string {
        return this._colour;
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let teamPlayers: IPlayer[] = [];
        let allPlayers: IPlayer[] = this._playerMgr.getPlayers(...effects);
        for (var i=0; i<allPlayers.length; i++) {
            let p: IPlayer = allPlayers[i];
            if (p && !p.isDead() && p.getTeamId() == this.id) {
                teamPlayers.push(p);
            }
        }
        return teamPlayers;
    }

    addPlayers(...players: IPlayer[]): void {
        if (players) {
            for (var i=0; i<players.length; i++) {
                let p: IPlayer = players[i];
                if (p && this._remainingPoints >= p.getStats().cost) {
                    this._remainingPoints -= p.getStats().cost;
                    p.setTeamId(this.id);
                    this._playerMgr.addPlayers(p);
                }
            }
        }
    }

    getRemainingPoints(): number {
        return this._remainingPoints;
    }

    getScore(): number {
        return this._score;
    }

    addToScore(increase: number): void {
        this._score += increase;
    }

    getPriority(): number {
        return this._priority;
    }

    setPriority(priority: number): void {
        this._priority = priority;
    }
}
