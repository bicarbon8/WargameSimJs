import { IPlayer } from "../players/i-player";
import { PlayerManager } from "../players/player-manager";
import { PlayerOptions } from "../players/player-options";
import { PlayerStatusEffect } from "../players/player-status-effect";
import { Rand } from "../utils/rand";
import { WarGame } from "../war-game";
import { TeamManager } from "./team-manager";
import { TeamOptions } from "./team-options";

export class Team {
    readonly id: string;
    private _teamMgr: TeamManager;
    private _playerMgr: PlayerManager;
    private _name: string;
    private _color: string;
    private _originalPoints: number;
    private _remainingPoints: number;
    private _score: number;

    constructor(options: TeamOptions) {
        this.id = Rand.guid();
        this._teamMgr = options.teamManager;
        this._playerMgr = options.playerManager;
        this._name = options.name;
        this._color = options.color || Rand.colorString();
        this._originalPoints = options.points;
        this._remainingPoints = this._originalPoints;
        this._score = 0;
    }

    get name(): string {
        return this._name;
    }

    get color(): string {
        return this._color;
    }

    get remainingPoints(): number {
        return this._remainingPoints;
    }

    get score(): number {
        return this._score;
    }

    hasPlayers(): boolean {
        return this.getPlayers().length > 0;
    }

    getPlayersByName(name: string): IPlayer[] {
        return this.getPlayers().filter((p: IPlayer) => p.name === name);
    }

    getPlayers(...effects: PlayerStatusEffect[]): IPlayer[] {
        let teamPlayers: IPlayer[] = [];
        let allPlayers: IPlayer[] = this._playerMgr.getPlayers(...effects);
        for (var i=0; i<allPlayers.length; i++) {
            let p: IPlayer = allPlayers[i];
            if (p && !p.isDead() && p.teamId === this.id) {
                teamPlayers.push(p);
            }
        }
        return teamPlayers;
    }

    addPlayer(options: PlayerOptions): IPlayer {
        let added: IPlayer;
        if (options && this.remainingPoints >= options.stats.cost) {
            this._remainingPoints -= options.stats.cost;
            const player: IPlayer = this._playerMgr.addPlayer(options);
            player.setTeamId(this.id);
            WarGame.evtMgr.notify(WarGame.EVENTS.TEAM_CHANGED, this);
        }
        return added;
    }

    removePlayer(player: IPlayer, destroy?: boolean): IPlayer {
        let removed: IPlayer;
        if (player) {
            this._playerMgr.removePlayer(player, destroy);
            this._remainingPoints += player.stats.cost;
            WarGame.evtMgr.notify(WarGame.EVENTS.TEAM_CHANGED, this);
        }
        return removed;
    }

    addToScore(increase: number): void {
        this._score += increase;
    }

    destroy(): void {
        this.getPlayers().forEach((p: IPlayer) => {
            this.removePlayer(p, true);
        });
        this._teamMgr = null;
    }
}
