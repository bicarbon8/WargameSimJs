import { MapTile } from "../map/map-tile";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    getName(): string;
    setLocation(x: number, y: number): void;
    getTeamId(): number;
    setTeamId(id: number): void;
    getStats(): PlayerStats;
    wound(): void;
    getEffects(): PlayerStatusEffect[];
    setEffects(...effects: PlayerStatusEffect[]): void;
    removeEffects(...effects: PlayerStatusEffect[]): void;
    isDead(): boolean;
}