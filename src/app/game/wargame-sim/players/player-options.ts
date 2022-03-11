import { PlayerStats } from "./player-stats";
import { PlayerSpritesheetMapping } from "./player-spritesheet-mappings";

export interface PlayerOptions {
    name: string;
    spriteMapping: PlayerSpritesheetMapping;
    stats: PlayerStats;
    scene?: Phaser.Scene;
}