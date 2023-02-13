import { XY } from "../ui/types/xy";
import { PlayerStats } from "./player-stats";
import { PlayerStatusEffect } from "./player-status-effect";
import { PlayerType } from "./player-type";

export interface IPlayer {
    readonly id: string;
    readonly tileXY: XY
    readonly name: PlayerType;
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
}