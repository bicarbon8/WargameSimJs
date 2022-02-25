import { MapManager } from "../map/map-manager";
import { MapTile } from "../map/map-tile";
import { Rand } from "../utils/rand";
import { IPlayer } from "./i-player";
import { PlayerManager } from "./player-manager";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export class BasePlayer implements IPlayer {
    readonly id: number;
    private _name: string;
    private _x: number;
    private _y: number;
    private _teamId: number;
    private readonly _stats: PlayerStats;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;

    constructor(name: string, stats: PlayerStats) {
        this.id = Rand.getId();
        this._name = name;
        this._stats = stats;
        this._remainingWounds = this._stats.wounds;
        this._effects = new Set<PlayerStatusEffect>();
    }

    getName(): string {
        return this._name;
    }
    
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    setLocation(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    getTeamId(): number {
        return this._teamId;
    }

    setTeamId(id: number): void {
        this._teamId = id;
    }

    getStats(): PlayerStats {
        return this._stats;
    }

    wound(): void {
        this._remainingWounds--;
    }

    getEffects(): PlayerStatusEffect[] {
        return Array.from(this._effects.values());
    }

    setEffects(...effects: PlayerStatusEffect[]): void {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                this._effects.add(effects[i]);
            }
        }
    }

    removeEffects(...effects: PlayerStatusEffect[]): void {
        if (effects) {
            for (var i=0; i<effects.length; i++) {
                if (this._effects.has(effects[i])) {
                    this._effects.delete(effects[i]);
                }
            }
        }
    }

    isDead(): boolean {
        return this._remainingWounds <= 0;
    }

    isBattling(): boolean {
        return MapManager.getPlayersInRange(this._x, this._y, 1).filter((player: IPlayer) => {
            if (player.id !== this.id && PlayerManager.areAllies(this, player)) { return true; }
        }).length > 0;
    }
}
