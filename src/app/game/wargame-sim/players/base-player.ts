import { Rand } from "../utils/rand";
import { IPlayer } from "./i-player";
import { Location } from "../map/location";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export class BasePlayer implements IPlayer {
    readonly id: number;
    private _name: string;
    private _loc: Location;
    private _teamId: number;
    private readonly _stats: PlayerStats;
    private _remainingWounds: number;
    private _effects: Set<PlayerStatusEffect>;

    constructor(name: string, stats: PlayerStats) {
        this.id = Rand.getId();
        this._name = name;
        this._stats = stats;
        this._remainingWounds = this._stats.startingWounds;
        this._effects = new Set<PlayerStatusEffect>();
    }

    getName(): string {
        return this._name;
    }
    
    getLocation(): Location {
        return this._loc;
    }

    setLocation(loc: Location): void {
        this._loc = loc;
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
                } else {
                    console.warn(`unable to remove effect ${PlayerStatusEffect[effects[i]]} from player: ${this.id} because they are not affected by it`);
                }
            }
        }
    }

    isDead(): boolean {
        return this._remainingWounds <= 0;
    }
}
