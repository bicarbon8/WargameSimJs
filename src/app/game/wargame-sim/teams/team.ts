import { IPlayer } from "../players/i-player";
import { PlayerStatusEffect } from "../players/player-status-effect";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { TeamOptions } from "./team-options";

export class Team {
    readonly id: number;
    private _name: string;
    private _colour: string;
    private _originalPoints: number;
    private _remainingPoints: number;
    private _score: number;
    private _priority: number;

    constructor(options: TeamOptions) {
        this.id = Rand.getId();
        this._name = options.name;
        this._colour = options.colour;
        this._originalPoints = options.points;
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

    getPlayersByName(name: string): IPlayer[] {
        return this.getPlayers().filter((p: IPlayer) => p.name === name);
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let teamPlayers: IPlayer[] = [];
        let allPlayers: IPlayer[] = WarGame.players.getPlayers(...effects);
        for (var i=0; i<allPlayers.length; i++) {
            let p: IPlayer = allPlayers[i];
            if (p && !p.isDead() && p.teamId == this.id) {
                teamPlayers.push(p);
            }
        }
        return teamPlayers;
    }

    addPlayer(player: IPlayer): void {
        if (player && this.remainingPoints >= player.stats.cost) {
            this._remainingPoints -= player.stats.cost;
            player.setTeamId(this.id);
            WarGame.players.addPlayer(player);
        }
    }

    removePlayer(player: IPlayer): void {
        if (player) {
            WarGame.players.removePlayer(player);
            this._remainingPoints += player.stats.cost;
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
