import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer {
    readonly id: number;
    readonly tileX: number;
    readonly tileY: number;
    readonly name: string;
    readonly teamId: number;
    readonly stats: PlayerStats;
    readonly statusEffects: PlayerStatusEffect[];
    setTile(x: number, y: number): void;
    setTeamId(id: number): void;
    wound(): void;
    setEffects(...effects: PlayerStatusEffect[]): void;
    removeEffects(...effects: PlayerStatusEffect[]): void;
    isDead(): boolean;
}