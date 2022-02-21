import { Location } from "../map/location";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer {
    readonly id: number;
    getName(): string;
    getLocation(): Location;
    setLocation(loc: Location): void;
    getTeamId(): number;
    setTeamId(id: number): void;
    getStats(): PlayerStats;
    wound(): void;
    getEffects(): PlayerStatusEffect[];
    setEffects(...effects: PlayerStatusEffect[]): void;
    removeEffects(...effects: PlayerStatusEffect[]): void;
    isDead(): boolean;
}