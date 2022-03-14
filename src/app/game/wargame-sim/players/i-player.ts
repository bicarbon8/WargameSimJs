import { HasGameObject } from "../interfaces/has-game-object";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer extends HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: string;
    readonly tileX: number;
    readonly tileY: number;
    readonly name: string;
    readonly teamId: string;
    readonly stats: PlayerStats;
    readonly statusEffects: PlayerStatusEffect[];
    setTile(x: number, y: number, worldLocation: Phaser.Math.Vector2): this;
    setTeamId(id: string): this;
    wound(): this;
    setEffects(...effects: PlayerStatusEffect[]): this;
    removeEffects(...effects: PlayerStatusEffect[]): this;
    isDead(): boolean;
    destroy(): void;
}