import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer {
    readonly id: number;
    readonly tileX: number;
    readonly tileY: number;
    getName(): string;
    setTile(x: number, y: number): void;
    getTeamId(): number;
    setTeamId(id: number): void;
    getStats(): PlayerStats;
    wound(): void;
    getEffects(): PlayerStatusEffect[];
    setEffects(...effects: PlayerStatusEffect[]): void;
    removeEffects(...effects: PlayerStatusEffect[]): void;
    isDead(): boolean;
}