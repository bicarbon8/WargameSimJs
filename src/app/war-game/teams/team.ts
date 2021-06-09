import { IPlayer } from "../players/i-player";
import { playerManager } from "../players/player-manager";
import { PlayerStatusEffect } from "../players/player-status-effect";
import { Rand } from "../utils/rand";

export class Team {
    readonly id: number;
    private _name: string;
    private _colour: string;
    private _originalPoints: number;
    private _remainingPoints: number;
    private _score: number;
    private _priority: number;

    constructor(name: string, colour: string, points: number) {
        this.id = Rand.getId();
        this._name = name;
        this._colour = colour;
        this._originalPoints = points;
        this._remainingPoints = this._originalPoints;
        this._score = 0;
        this._priority = 0;
    }

    get name(): string {
        return this._name;
    }

    get colour(): string {
        return this._colour;
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let teamPlayers: IPlayer[] = [];
        let allPlayers: IPlayer[] = playerManager.getPlayers(...effects);
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
                    playerManager.addPlayers(p);
                }
            }
        }
    }

    get remainingPoints(): number {
        return this._remainingPoints;
    }

    get score(): number {
        return this._score;
    }

    addToScore(increase: number): void {
        this._score += increase;
    }

    get priority(): number {
        return this._priority;
    }

    set priority(priority: number) {
        this._priority = priority;
    }
}
