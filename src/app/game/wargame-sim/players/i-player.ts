import { HasGameObject } from "../interfaces/has-game-object";
import { XY } from "../ui/types/xy";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";

export interface IPlayer extends HasGameObject<Phaser.GameObjects.Container> {
    readonly id: string;
    readonly tileXY: XY
    readonly name: string;
    readonly teamId: string;
    readonly stats: PlayerStats;
    readonly statusEffects: PlayerStatusEffect[];
    setTile(tileXY: XY): this;
    setTeamId(id: string): this;
    wound(): this;
    setEffects(...effects: PlayerStatusEffect[]): this;
    removeEffects(...effects: PlayerStatusEffect[]): this;
    isDead(): boolean;
    isAlly(player: IPlayer): boolean;
    isEnemy(player: IPlayer): boolean;
    destroy(): void;
}