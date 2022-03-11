import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer {
    readonly id: string;
    readonly tileX: number;
    readonly tileY: number;
    readonly name: string;
    readonly teamId: string;
    readonly stats: PlayerStats;
    readonly statusEffects: PlayerStatusEffect[];
    setTile(x: number, y: number): this;
    setTeamId(id: string): this;
    wound(): this;
    setEffects(...effects: PlayerStatusEffect[]): this;
    removeEffects(...effects: PlayerStatusEffect[]): this;
    isDead(): boolean;
    destroy(): void;
}